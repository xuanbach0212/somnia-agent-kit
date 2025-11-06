/**
 * Task Execution Engine
 * Executes planned tasks with error handling and retry logic
 * Supports both on-chain and off-chain actions
 */

import { ethers } from 'ethers';
import type { Action } from './planner';
import type { ChainClient } from '../core/chainClient';
import type { SomniaContracts } from '../core/contracts';
import type {
  ExecutionResult,
  DetailedExecutionResult,
  ExecutionContext,
  ExecutorConfig,
  ActionHandler,
} from '../types/action';
import { ExecutionStatus } from '../types/action'; // Import enum as value
import { LIMITS, RETRY, calculateBackoff } from '../constants';
import type { AsyncHandler, StringRecord } from '../types/common';
import type { Logger } from '../monitor/logger';

// Re-export types for backward compatibility
export { ExecutionStatus, ExecutorConfig };
export type { ExecutionResult, DetailedExecutionResult, ExecutionContext, ActionHandler };

// Type alias for transaction receipt
export type TxReceipt = ethers.TransactionReceipt;

// Legacy PlanStep and ExecutionPlan types for executor (backward compatibility)
// These use string-based action identifiers for handler lookup
export interface PlanStep {
  id: string;
  action: string; // Action type as string (handler key)
  params: Record<string, any>;
  dependencies: string[];
  estimatedDuration?: number;
  retryable?: boolean;
}

export interface ExecutionPlan {
  taskId: string;
  steps: PlanStep[];
  totalSteps: number;
  createdAt: number;
  priority: number;
  status: string;
}

/**
 * Executor class for task execution
 */
export class Executor {
  private config: ExecutorConfig;
  private contexts: Map<string, ExecutionContext> = new Map();
  private handlers: Map<string, AsyncHandler<StringRecord, unknown>> = new Map();
  private chainClient?: ChainClient;
  private contracts?: SomniaContracts;
  private logger?: Logger;

  constructor(
    chainClient?: ChainClient,
    contracts?: SomniaContracts,
    config: ExecutorConfig = {},
    logger?: Logger
  ) {
    this.chainClient = chainClient;
    this.contracts = contracts;
    this.logger = logger;
    this.config = {
      maxRetries: config.maxRetries || RETRY.MAX_ATTEMPTS,
      retryDelay: config.retryDelay || RETRY.INITIAL_DELAY,
      timeout: config.timeout || LIMITS.MAX_RETRY_DELAY,
      enableParallel: config.enableParallel !== false,
      dryRun: config.dryRun || false,
    };

    // Register default handlers
    this.registerDefaultHandlers();
  }

  /**
   * Register action handler
   */
  registerHandler<TParams = StringRecord, TResult = unknown>(
    action: string,
    handler: AsyncHandler<TParams, TResult>
  ): void {
    this.handlers.set(action, handler as AsyncHandler<StringRecord, unknown>);
  }

  /**
   * Execute a single action
   * @param action Action to execute
   * @returns Detailed execution result with status and metadata
   */
  async execute(action: Action): Promise<DetailedExecutionResult> {
    const startTime = Date.now();
    const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Get handler for this action type
      const handler = this.handlers.get(action.type);
      if (!handler) {
        return {
          stepId: actionId,
          status: ExecutionStatus.Failed,
          success: false,
          error: `No handler registered for action: ${action.type}`,
          duration: Date.now() - startTime,
          dryRun: this.config.dryRun,
        };
      }

      // Dry-run mode: simulate without executing
      if (this.config.dryRun) {
        this.logger?.info(`[DRY-RUN] Would execute ${action.type}`, { 
          params: action.params 
        });
        return {
          stepId: actionId,
          status: ExecutionStatus.Success,
          success: true,
          data: { simulated: true, action },
          duration: Date.now() - startTime,
          dryRun: true,
        };
      }

      // Execute with timeout and retry logic
      let retryCount = 0;
      let lastError: Error | null = null;

      while (retryCount <= (this.config.maxRetries || 0)) {
        try {
          const result = await this.executeWithTimeout(
            handler(action.params),
            this.config.timeout!
          );

          const resultData = result as StringRecord | undefined;
          return {
            stepId: actionId,
            status: ExecutionStatus.Success,
            success: true,
            data: result,
            retryCount,
            duration: Date.now() - startTime,
            txReceipt: resultData?.txReceipt as any, // Extract tx receipt if present
          };
        } catch (error) {
          lastError = error as Error;

          if (retryCount >= (this.config.maxRetries || 0)) {
            break;
          }

          retryCount++;
          // Use exponential backoff with jitter
          const backoffDelay = calculateBackoff(
            retryCount,
            this.config.retryDelay,
            RETRY.BACKOFF_MULTIPLIER,
            RETRY.MAX_DELAY
          );
          await this.sleep(backoffDelay);
        }
      }

      return {
        stepId: actionId,
        status: ExecutionStatus.Failed,
        success: false,
        error: lastError?.message || 'Unknown error',
        retryCount,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        stepId: actionId,
        status: ExecutionStatus.Failed,
        success: false,
        error: (error as Error).message,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute multiple actions (batch execution)
   * @param actions Array of actions to execute
   * @returns Array of execution results
   */
  async executeAll(actions: Action[]): Promise<ExecutionResult[]> {
    if (actions.length === 0) {
      return [];
    }

    // Parallel execution if enabled
    if (this.config.enableParallel) {
      return await Promise.all(
        actions.map((action) => this.execute(action))
      );
    }

    // Sequential execution
    const results: ExecutionResult[] = [];
    for (const action of actions) {
      const result = await this.execute(action);
      results.push(result);

      // Stop on first failure if not in parallel mode
      if (result.status === ExecutionStatus.Failed) {
        break;
      }
    }

    return results;
  }

  /**
   * Execute a plan (legacy method for backward compatibility)
   * @deprecated Use execute(action) or executeAll(actions) instead
   */
  async executePlan(plan: ExecutionPlan): Promise<ExecutionContext> {
    const context: ExecutionContext = {
      taskId: plan.taskId,
      results: new Map(),
      startTime: Date.now(),
      status: ExecutionStatus.Running,
    };

    this.contexts.set(plan.taskId, context);

    try {
      for (const step of plan.steps) {
        context.currentStep = step.id;

        // Check if dependencies are completed
        const dependenciesCompleted = this.checkDependencies(step, context);
        if (!dependenciesCompleted) {
          throw new Error(`Dependencies not met for step ${step.id}`);
        }

        // Execute step
        const result = await this.executeStep(step);
        context.results.set(step.id, result);

        if (result.status === ExecutionStatus.Failed) {
          throw new Error(`Step ${step.id} failed: ${result.error}`);
        }
      }

      context.status = ExecutionStatus.Success;
    } catch (error) {
      context.status = ExecutionStatus.Failed;
      context.results.set('error', {
        stepId: 'error',
        status: ExecutionStatus.Failed,
        success: false,
        error: (error as Error).message,
        duration: 0,
      });
    } finally {
      context.endTime = Date.now();
    }

    return context;
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: PlanStep): Promise<DetailedExecutionResult> {
    const startTime = Date.now();
    let retryCount = 0;

    while (retryCount <= (this.config.maxRetries || 0)) {
      try {
        const handler = this.handlers.get(step.action);
        if (!handler) {
          throw new Error(`No handler registered for action: ${step.action}`);
        }

        // Execute with timeout
        const result = await this.executeWithTimeout(
          handler(step.params),
          this.config.timeout!
        );

        return {
          stepId: step.id,
          status: ExecutionStatus.Success,
          success: true,
          data: result,
          retryCount,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        if (!step.retryable || retryCount >= (this.config.maxRetries || 0)) {
          return {
            stepId: step.id,
            status: ExecutionStatus.Failed,
            success: false,
            error: (error as Error).message,
            retryCount,
            duration: Date.now() - startTime,
          };
        }

        retryCount++;
        // Use exponential backoff with jitter
        const backoffDelay = calculateBackoff(
          retryCount,
          this.config.retryDelay,
          RETRY.BACKOFF_MULTIPLIER,
          RETRY.MAX_DELAY
        );
        await this.sleep(backoffDelay);
      }
    }

    return {
      stepId: step.id,
      status: ExecutionStatus.Failed,
      success: false,
      error: 'Max retries exceeded',
      retryCount,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Execution timeout')), timeout)
      ),
    ]);
  }

  /**
   * Check if step dependencies are completed
   */
  private checkDependencies(
    step: PlanStep,
    context: ExecutionContext
  ): boolean {
    return step.dependencies.every((depId) => {
      const result = context.results.get(depId);
      return result && result.status === ExecutionStatus.Success;
    });
  }

  /**
   * Get execution context
   */
  getContext(taskId: string): ExecutionContext | undefined {
    return this.contexts.get(taskId);
  }

  /**
   * Clear execution context
   */
  clearContext(taskId: string): boolean {
    return this.contexts.delete(taskId);
  }

  /**
   * Register default handlers with real blockchain integration
   */
  private registerDefaultHandlers(): void {
    // Validation handlers
    this.registerHandler('validate_address', async (params) => {
      const valid = ethers.isAddress(params.address);
      if (!valid) {
        throw new Error(`Invalid address: ${params.address}`);
      }
      return { valid: true, address: params.address };
    });

    this.registerHandler('validate_contract', async (params) => {
      if (!ethers.isAddress(params.address)) {
        throw new Error(`Invalid contract address: ${params.address}`);
      }

      // Check if it's a contract (has code)
      if (this.chainClient) {
        const provider = this.chainClient.getProvider();
        const code = await provider.getCode(params.address);
        if (code === '0x') {
          throw new Error(`Address is not a contract: ${params.address}`);
        }
        return { valid: true, address: params.address, hasCode: true };
      }

      return { valid: true, address: params.address };
    });

    // Balance handlers
    this.registerHandler('check_balance', async (params) => {
      if (!this.chainClient) {
        throw new Error('ChainClient not configured');
      }

      const provider = this.chainClient.getProvider();
      const signerManager = this.chainClient.getSignerManager();

      const address = (params.address as string) || (await signerManager.getAddress());
      const balance = await provider.getBalance(address);
      const required = params.amount ? ethers.parseEther(String(params.amount)) : 0n;

      return {
        address,
        balance: balance.toString(),
        balanceEther: ethers.formatEther(balance),
        required: required.toString(),
        sufficient: balance >= required,
      };
    });

    // Transfer handlers
    this.registerHandler('execute_transfer', async (params) => {
      if (!this.chainClient) {
        throw new Error('ChainClient not configured');
      }

      const signer = this.chainClient.getSignerManager().getSigner();
      const tx = await signer.sendTransaction({
        to: params.to as string,
        value: ethers.parseEther(String(params.amount)),
      });

      const receipt = await tx.wait();

      return {
        txHash: receipt?.hash,
        txReceipt: receipt,
        from: await signer.getAddress(),
        to: params.to,
        amount: params.amount,
      };
    });

    // Gas estimation
    this.registerHandler('estimate_gas', async (params) => {
      if (!this.chainClient) {
        throw new Error('ChainClient not configured');
      }

      const provider = this.chainClient.getProvider();
      let gasEstimate: bigint;

      if (params.contract && params.method) {
        // Estimate for contract call (placeholder - needs contract instance)
        gasEstimate = 100000n;
      } else {
        // Estimate for simple transfer
        gasEstimate = await provider.estimateGas({
          to: (params.to as string) || ethers.ZeroAddress,
          value: params.value ? ethers.parseEther(String(params.value)) : 0n,
        });
      }

      return {
        gasLimit: gasEstimate.toString(),
        gasLimitNumber: Number(gasEstimate),
      };
    });

    // Token operations
    this.registerHandler('approve_token', async (params) => {
      // Placeholder - needs ERC20 contract integration
      return {
        action: 'approve_token',
        token: params.token,
        spender: params.spender,
        amount: params.amount,
      };
    });

    // Swap operations
    this.registerHandler('get_quote', async (params) => {
      // Placeholder - needs DEX integration
      return {
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        amountOut: params.amountIn, // 1:1 mock rate
        rate: 1.0,
      };
    });

    this.registerHandler('execute_swap', async (params) => {
      // Placeholder - needs DEX integration
      return {
        action: 'execute_swap',
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        amountIn: params.amountIn,
        amountOut: params.amountOut,
      };
    });

    // Contract calls
    this.registerHandler('call_contract', async (params) => {
      if (!this.chainClient) {
        throw new Error('ChainClient not configured');
      }

      // Placeholder - needs specific contract integration
      return {
        action: 'call_contract',
        contract: params.contract,
        method: params.method,
        args: params.args,
      };
    });

    // Generic execute handler
    this.registerHandler('execute', async (params) => {
      // Generic execution - just return params
      return { executed: true, params };
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
