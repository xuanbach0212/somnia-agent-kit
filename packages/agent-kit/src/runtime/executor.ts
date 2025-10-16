/**
 * Task Execution Engine
 * Executes planned tasks with error handling and retry logic
 */

import type { ExecutionPlan, PlanStep } from './planner';

export enum ExecutionStatus {
  Idle = 'idle',
  Running = 'running',
  Success = 'success',
  Failed = 'failed',
  Retrying = 'retrying',
}

export interface ExecutionResult {
  stepId: string;
  status: ExecutionStatus;
  result?: any;
  error?: string;
  retryCount?: number;
  duration: number;
}

export interface ExecutionContext {
  taskId: string;
  currentStep?: string;
  results: Map<string, ExecutionResult>;
  startTime: number;
  endTime?: number;
  status: ExecutionStatus;
}

export interface ExecutorConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  enableParallel?: boolean;
}

/**
 * Executor class for task execution
 */
export class Executor {
  private config: ExecutorConfig;
  private contexts: Map<string, ExecutionContext> = new Map();
  private handlers: Map<string, (params: any) => Promise<any>> = new Map();

  constructor(config: ExecutorConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      timeout: config.timeout || 30000,
      enableParallel: config.enableParallel !== false,
    };

    // Register default handlers
    this.registerDefaultHandlers();
  }

  /**
   * Register action handler
   */
  registerHandler(
    action: string,
    handler: (params: any) => Promise<any>
  ): void {
    this.handlers.set(action, handler);
  }

  /**
   * Execute a plan
   */
  async execute(plan: ExecutionPlan): Promise<ExecutionContext> {
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
  private async executeStep(step: PlanStep): Promise<ExecutionResult> {
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
          result,
          retryCount,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        if (!step.retryable || retryCount >= (this.config.maxRetries || 0)) {
          return {
            stepId: step.id,
            status: ExecutionStatus.Failed,
            error: (error as Error).message,
            retryCount,
            duration: Date.now() - startTime,
          };
        }

        retryCount++;
        await this.sleep(this.config.retryDelay! * retryCount);
      }
    }

    return {
      stepId: step.id,
      status: ExecutionStatus.Failed,
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
   * Register default handlers
   */
  private registerDefaultHandlers(): void {
    // Validation handlers
    this.registerHandler('validate_address', async (params) => {
      if (!params.address || !/^0x[a-fA-F0-9]{40}$/.test(params.address)) {
        throw new Error('Invalid address');
      }
      return { valid: true };
    });

    this.registerHandler('validate_contract', async (params) => {
      // In real implementation, this would check if address is a contract
      if (!params.address || !/^0x[a-fA-F0-9]{40}$/.test(params.address)) {
        throw new Error('Invalid contract address');
      }
      return { valid: true };
    });

    // Placeholder handlers for other actions
    this.registerHandler('check_balance', async (params) => {
      return { sufficient: true };
    });

    this.registerHandler('estimate_gas', async (params) => {
      return { gasLimit: 100000 };
    });

    this.registerHandler('get_quote', async (params) => {
      return { rate: 1.0, amount: params.amount };
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
