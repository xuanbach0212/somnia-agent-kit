/**
 * Task Planning and Decomposition
 * Breaks down complex tasks into executable steps
 * Includes rule-based and LLM-based planning strategies
 */

import type { OpenAIAdapter } from '../llm/openaiAdapter';
import type { OllamaAdapter } from '../llm/ollamaAdapter';

// =============================================================================
// Base Planner Interface and Action Type
// =============================================================================

/**
 * Simple action interface for planner output
 */
export interface Action {
  type: string;
  params: Record<string, any>;
}

/**
 * Base planner interface
 * All planner implementations must conform to this interface
 */
export interface IPlanner {
  /**
   * Plan actions based on goal and context
   * @param goal Goal to achieve or task description
   * @param context Optional context information
   * @returns Array of actions to execute
   */
  plan(goal: any, context?: any): Promise<Action[]>;
}

// =============================================================================
// Legacy Types (for backward compatibility)
// =============================================================================

export enum TaskPriority {
  Low = 0,
  Normal = 1,
  High = 2,
  Critical = 3,
}

export enum TaskStatus {
  Pending = 'pending',
  Planned = 'planned',
  Ready = 'ready',
  Blocked = 'blocked',
}

export interface PlanStep {
  id: string;
  action: string;
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
  priority: TaskPriority;
  status: TaskStatus;
}

export interface PlannerConfig {
  maxSteps?: number;
  enableOptimization?: boolean;
  allowParallel?: boolean;
}

/**
 * Planner class for task decomposition and planning
 */
export class Planner {
  private config: PlannerConfig;
  private plans: Map<string, ExecutionPlan> = new Map();

  constructor(config: PlannerConfig = {}) {
    this.config = {
      maxSteps: config.maxSteps || 50,
      enableOptimization: config.enableOptimization !== false,
      allowParallel: config.allowParallel !== false,
    };
  }

  /**
   * Create execution plan for a task
   */
  async createPlan(
    taskId: string,
    taskType: string,
    taskData: any,
    priority: TaskPriority = TaskPriority.Normal
  ): Promise<ExecutionPlan> {
    // Generate steps based on task type
    const steps = await this.decompose(taskType, taskData);

    // Optimize if enabled
    const optimizedSteps = this.config.enableOptimization
      ? this.optimize(steps)
      : steps;

    // Validate plan
    this.validate(optimizedSteps);

    const plan: ExecutionPlan = {
      taskId,
      steps: optimizedSteps,
      totalSteps: optimizedSteps.length,
      createdAt: Date.now(),
      priority,
      status: TaskStatus.Planned,
    };

    this.plans.set(taskId, plan);
    return plan;
  }

  /**
   * Decompose task into executable steps
   */
  private async decompose(taskType: string, taskData: any): Promise<PlanStep[]> {
    const steps: PlanStep[] = [];

    // Task type specific decomposition
    switch (taskType) {
      case 'transfer':
        steps.push({
          id: 'step-1',
          action: 'validate_address',
          params: { address: taskData.to },
          dependencies: [],
        });
        steps.push({
          id: 'step-2',
          action: 'check_balance',
          params: { amount: taskData.amount },
          dependencies: ['step-1'],
        });
        steps.push({
          id: 'step-3',
          action: 'execute_transfer',
          params: { to: taskData.to, amount: taskData.amount },
          dependencies: ['step-2'],
          retryable: true,
        });
        break;

      case 'swap':
        steps.push({
          id: 'step-1',
          action: 'get_quote',
          params: { from: taskData.tokenIn, to: taskData.tokenOut },
          dependencies: [],
        });
        steps.push({
          id: 'step-2',
          action: 'approve_token',
          params: { token: taskData.tokenIn, amount: taskData.amountIn },
          dependencies: ['step-1'],
        });
        steps.push({
          id: 'step-3',
          action: 'execute_swap',
          params: taskData,
          dependencies: ['step-2'],
          retryable: true,
        });
        break;

      case 'contract_call':
        steps.push({
          id: 'step-1',
          action: 'validate_contract',
          params: { address: taskData.contract },
          dependencies: [],
        });
        steps.push({
          id: 'step-2',
          action: 'estimate_gas',
          params: { contract: taskData.contract, method: taskData.method },
          dependencies: ['step-1'],
        });
        steps.push({
          id: 'step-3',
          action: 'call_contract',
          params: taskData,
          dependencies: ['step-2'],
          retryable: true,
        });
        break;

      default:
        // Generic task decomposition
        steps.push({
          id: 'step-1',
          action: 'execute',
          params: taskData,
          dependencies: [],
          retryable: true,
        });
    }

    return steps;
  }

  /**
   * Optimize execution plan
   */
  private optimize(steps: PlanStep[]): PlanStep[] {
    // Remove redundant steps
    const uniqueSteps = this.removeDuplicates(steps);

    // Reorder for better performance if parallel execution allowed
    if (this.config.allowParallel) {
      return this.reorderForParallel(uniqueSteps);
    }

    return uniqueSteps;
  }

  /**
   * Remove duplicate steps
   */
  private removeDuplicates(steps: PlanStep[]): PlanStep[] {
    const seen = new Set<string>();
    return steps.filter((step) => {
      const key = `${step.action}-${JSON.stringify(step.params)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Reorder steps for parallel execution
   */
  private reorderForParallel(steps: PlanStep[]): PlanStep[] {
    // Group steps by dependency level
    const levels: PlanStep[][] = [];
    const processed = new Set<string>();

    while (processed.size < steps.length) {
      const currentLevel = steps.filter(
        (step) =>
          !processed.has(step.id) &&
          step.dependencies.every((dep) => processed.has(dep))
      );

      if (currentLevel.length === 0) {
        // Circular dependency detected
        break;
      }

      levels.push(currentLevel);
      currentLevel.forEach((step) => processed.add(step.id));
    }

    return levels.flat();
  }

  /**
   * Validate execution plan
   */
  private validate(steps: PlanStep[]): void {
    if (steps.length === 0) {
      throw new Error('Plan must have at least one step');
    }

    if (steps.length > this.config.maxSteps!) {
      throw new Error(`Plan exceeds maximum steps: ${this.config.maxSteps}`);
    }

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (stepId: string): boolean => {
      if (recursionStack.has(stepId)) {
        return true;
      }
      if (visited.has(stepId)) {
        return false;
      }

      visited.add(stepId);
      recursionStack.add(stepId);

      const step = steps.find((s) => s.id === stepId);
      if (step) {
        for (const dep of step.dependencies) {
          if (hasCycle(dep)) {
            return true;
          }
        }
      }

      recursionStack.delete(stepId);
      return false;
    };

    for (const step of steps) {
      if (hasCycle(step.id)) {
        throw new Error('Circular dependency detected in plan');
      }
    }
  }

  /**
   * Get execution plan
   */
  getPlan(taskId: string): ExecutionPlan | undefined {
    return this.plans.get(taskId);
  }

  /**
   * Update plan status
   */
  updatePlanStatus(taskId: string, status: TaskStatus): void {
    const plan = this.plans.get(taskId);
    if (plan) {
      plan.status = status;
    }
  }

  /**
   * Delete plan
   */
  deletePlan(taskId: string): boolean {
    return this.plans.delete(taskId);
  }

  /**
   * Get all plans
   */
  getAllPlans(): ExecutionPlan[] {
    return Array.from(this.plans.values());
  }

  /**
   * Clear all plans
   */
  clearPlans(): void {
    this.plans.clear();
  }

  /**
   * Plan actions (new interface method)
   * @param goal Goal to achieve
   * @param context Optional context
   * @returns Array of actions
   */
  async plan(goal: any, context?: any): Promise<Action[]> {
    // For backward compatibility, delegate to decompose
    let taskType = 'generic';
    let taskData = goal;

    // Try to infer task type from goal
    if (typeof goal === 'object' && goal !== null) {
      if (goal.type) {
        taskType = goal.type;
        taskData = goal.data || goal;
      }
    }

    const steps = await this.decompose(taskType, taskData);

    // Convert PlanStep[] to Action[]
    return steps.map((step) => ({
      type: step.action,
      params: step.params,
    }));
  }
}

// =============================================================================
// RulePlanner - Rule-based Planning
// =============================================================================

/**
 * Rule-based planner that uses predefined rules for task decomposition
 */
export class RulePlanner implements IPlanner {
  /**
   * Plan actions using rule-based decomposition
   */
  async plan(goal: any, context?: any): Promise<Action[]> {
    let taskType = 'generic';
    let taskData = goal;

    // Parse goal
    if (typeof goal === 'string') {
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(goal);
        if (parsed.type) {
          taskType = parsed.type;
          taskData = parsed.data || parsed;
        } else {
          taskData = parsed;
        }
      } catch {
        // Not JSON, treat as raw data
        taskData = { description: goal };
      }
    } else if (typeof goal === 'object' && goal !== null) {
      if (goal.type) {
        taskType = goal.type;
        taskData = goal.data || goal;
      } else {
        taskData = goal;
      }
    }

    // Apply rules based on task type
    return this.applyRules(taskType, taskData, context);
  }

  /**
   * Apply rules to decompose task into actions
   */
  private applyRules(taskType: string, taskData: any, context?: any): Action[] {
    const actions: Action[] = [];

    switch (taskType) {
      case 'transfer':
        actions.push({
          type: 'validate_address',
          params: { address: taskData.to },
        });
        actions.push({
          type: 'check_balance',
          params: { amount: taskData.amount },
        });
        actions.push({
          type: 'execute_transfer',
          params: { to: taskData.to, amount: taskData.amount },
        });
        break;

      case 'swap':
        actions.push({
          type: 'get_quote',
          params: {
            tokenIn: taskData.tokenIn,
            tokenOut: taskData.tokenOut,
            amountIn: taskData.amountIn,
          },
        });
        actions.push({
          type: 'approve_token',
          params: { token: taskData.tokenIn, amount: taskData.amountIn },
        });
        actions.push({
          type: 'execute_swap',
          params: taskData,
        });
        break;

      case 'contract_call':
        actions.push({
          type: 'validate_contract',
          params: { address: taskData.contract },
        });
        actions.push({
          type: 'estimate_gas',
          params: {
            contract: taskData.contract,
            method: taskData.method,
            args: taskData.args,
          },
        });
        actions.push({
          type: 'call_contract',
          params: taskData,
        });
        break;

      case 'deploy_contract':
        actions.push({
          type: 'compile_contract',
          params: { source: taskData.source },
        });
        actions.push({
          type: 'estimate_deployment_gas',
          params: { bytecode: taskData.bytecode },
        });
        actions.push({
          type: 'deploy_contract',
          params: taskData,
        });
        break;

      default:
        // Generic execution
        actions.push({
          type: 'execute',
          params: taskData,
        });
    }

    return actions;
  }
}

// =============================================================================
// LLMPlanner - LLM-based Planning
// =============================================================================

/**
 * LLM-based planner that uses AI to generate action plans
 */
export class LLMPlanner implements IPlanner {
  private llm: OpenAIAdapter | OllamaAdapter;
  private systemPrompt: string;

  constructor(
    llm: OpenAIAdapter | OllamaAdapter,
    options?: {
      systemPrompt?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    this.llm = llm;
    this.systemPrompt =
      options?.systemPrompt ||
      `You are an AI agent planner. Your job is to break down user goals into executable actions.

IMPORTANT: You MUST respond with valid JSON only. No markdown, no explanations, just a JSON array.

Output format:
[
  {
    "type": "action_type",
    "params": {
      "param1": "value1",
      "param2": "value2"
    }
  }
]

Available action types:
- validate_address: Validate blockchain address
- check_balance: Check account balance
- execute_transfer: Transfer tokens/ETH
- get_quote: Get swap quote
- approve_token: Approve token spending
- execute_swap: Execute token swap
- validate_contract: Validate contract address
- estimate_gas: Estimate transaction gas
- call_contract: Call smart contract method
- deploy_contract: Deploy smart contract
- query_data: Query blockchain data
- execute: Generic execution

Break down complex goals into simple, sequential actions.`;
  }

  /**
   * Plan actions using LLM
   */
  async plan(goal: any, context?: any): Promise<Action[]> {
    try {
      // Build prompt
      const prompt = this.buildPrompt(goal, context);

      // Call LLM
      const response = await this.llm.generate(prompt, {
        temperature: 0.3, // Lower temperature for more deterministic output
        maxTokens: 1000,
      });

      // Parse response
      const actions = this.parseResponse(response);

      return actions;
    } catch (error) {
      console.error('LLMPlanner error:', error);
      // Fallback to empty array or basic action
      return [
        {
          type: 'execute',
          params: { goal, context, error: String(error) },
        },
      ];
    }
  }

  /**
   * Build prompt for LLM
   */
  private buildPrompt(goal: any, context?: any): string {
    let prompt = `${this.systemPrompt}\n\n`;

    // Add goal
    if (typeof goal === 'string') {
      prompt += `Goal: ${goal}\n`;
    } else {
      prompt += `Goal: ${JSON.stringify(goal, null, 2)}\n`;
    }

    // Add context if provided
    if (context) {
      prompt += `\nContext: ${JSON.stringify(context, null, 2)}\n`;
    }

    prompt += `\nGenerate the action plan as a JSON array:`;

    return prompt;
  }

  /**
   * Parse LLM response into actions
   */
  private parseResponse(response: string): Action[] {
    try {
      // Clean response - remove markdown code blocks if present
      let cleaned = response.trim();

      // Remove markdown json blocks
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/i, '');
      }
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '');
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.replace(/\s*```$/, '');
      }

      // Try to find JSON array in response
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }

      // Parse JSON
      const parsed = JSON.parse(cleaned);

      // Validate format
      if (!Array.isArray(parsed)) {
        console.warn('LLM response is not an array, wrapping it');
        return [
          {
            type: 'execute',
            params: parsed,
          },
        ];
      }

      // Validate each action
      const actions: Action[] = [];
      for (const item of parsed) {
        if (item && typeof item === 'object' && item.type) {
          actions.push({
            type: String(item.type),
            params: item.params || {},
          });
        } else {
          console.warn('Invalid action format:', item);
        }
      }

      return actions;
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      console.error('Response was:', response);

      // Return fallback action
      return [
        {
          type: 'execute',
          params: { rawResponse: response },
        },
      ];
    }
  }

  /**
   * Set custom system prompt
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * Get current system prompt
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}
