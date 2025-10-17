/**
 * Task Planning and Decomposition
 * Breaks down complex tasks into executable steps
 * Includes rule-based and LLM-based planning strategies
 */

import type { OpenAIAdapter } from '../llm/openaiAdapter';
import type { OllamaAdapter } from '../llm/ollamaAdapter';
import { ACTION_PLANNER_PROMPT, buildPrompt } from '../prompt';
import { z } from 'zod';
import type { PlanStep, ExecutionPlan } from './executor';

// Import types from centralized location
import type {
  Action,
  ActionPlan,
} from '../types/llm';
import { ActionType, TaskPriority, TaskStatus } from '../types/llm';

// Re-export for backward compatibility
export type { Action, ActionPlan, PlanStep, ExecutionPlan };
export { ActionType, TaskPriority, TaskStatus };

// Note: PlanStep and ExecutionPlan are executor-specific types for handler-based execution
// For LLM reasoning layer, see types/llm (PlanStep with action: Action | ActionPlan)

// =============================================================================
// Zod Schemas for Validation
// =============================================================================

/**
 * Zod schema for Action validation
 */
export const ActionSchema = z.object({
  type: z.string(),
  params: z.record(z.any()),
});

/**
 * Zod schema for ActionPlan validation
 */
export const ActionPlanSchema = z.object({
  type: z.union([
    z.nativeEnum(ActionType),
    z.string(),
  ]),
  target: z.string().optional(),
  params: z.record(z.any()),
  reason: z.string(),
  dependencies: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Zod schema for array of Actions
 */
export const ActionsArraySchema = z.array(ActionSchema);

/**
 * Zod schema for array of ActionPlans
 */
export const ActionPlansArraySchema = z.array(ActionPlanSchema);

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate single action
 */
export function validateAction(action: any): action is Action {
  try {
    ActionSchema.parse(action);
    return true;
  } catch (error) {
    console.error('Action validation failed:', error);
    return false;
  }
}

/**
 * Validate single action plan
 */
export function validateActionPlan(actionPlan: any): actionPlan is ActionPlan {
  try {
    ActionPlanSchema.parse(actionPlan);
    return true;
  } catch (error) {
    console.error('ActionPlan validation failed:', error);
    return false;
  }
}

/**
 * Validate array of actions
 */
export function validateActions(actions: any[]): actions is Action[] {
  try {
    ActionsArraySchema.parse(actions);
    return true;
  } catch (error) {
    console.error('Actions array validation failed:', error);
    return false;
  }
}

/**
 * Validate array of action plans
 */
export function validateActionPlans(actionPlans: any[]): actionPlans is ActionPlan[] {
  try {
    ActionPlansArraySchema.parse(actionPlans);
    return true;
  } catch (error) {
    console.error('ActionPlans array validation failed:', error);
    return false;
  }
}

/**
 * Convert Action to ActionPlan (adds reason field)
 */
export function actionToActionPlan(action: Action, reason: string = 'Action from plan'): ActionPlan {
  return {
    type: action.type,
    params: action.params,
    reason,
  };
}

/**
 * Convert ActionPlan to Action (removes metadata)
 */
export function actionPlanToAction(actionPlan: ActionPlan): Action {
  return {
    type: actionPlan.type,
    params: actionPlan.params,
  };
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
// Planner Configuration
// =============================================================================

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
    priority: number = 1 // 0=low, 1=normal, 2=high, 3=critical
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
      status: TaskStatus.Pending, // Use Pending instead of old Planned
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
 * Options for LLMPlanner
 */
export interface LLMPlannerOptions {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  strictValidation?: boolean;  // Throw error on invalid actions (default: false)
  returnActionPlan?: boolean;  // Return ActionPlan[] instead of Action[] (default: false)
}

/**
 * LLM-based planner that uses AI to generate action plans
 */
export class LLMPlanner implements IPlanner {
  private llm: OpenAIAdapter | OllamaAdapter;
  private systemPrompt: string;
  private options: Required<LLMPlannerOptions>;

  constructor(
    llm: OpenAIAdapter | OllamaAdapter,
    options?: LLMPlannerOptions
  ) {
    this.llm = llm;
    // Use ACTION_PLANNER_PROMPT template by default
    this.systemPrompt = options?.systemPrompt || ACTION_PLANNER_PROMPT.template;
    this.options = {
      systemPrompt: this.systemPrompt,
      temperature: options?.temperature ?? 0.3,
      maxTokens: options?.maxTokens ?? 1000,
      strictValidation: options?.strictValidation ?? false,
      returnActionPlan: options?.returnActionPlan ?? false,
    };
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
        temperature: this.options.temperature,
        maxTokens: this.options.maxTokens,
      });

      // Parse response - extract content from LLMResponse
      const actions = this.parseResponse(response.content);

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
   * Plan actions with ActionPlan support
   * Returns ActionPlan[] with full structure including reason
   */
  async planWithReason(goal: any, context?: any): Promise<ActionPlan[]> {
    try {
      // Build prompt
      const prompt = this.buildPrompt(goal, context);

      // Call LLM
      const response = await this.llm.generate(prompt, {
        temperature: this.options.temperature,
        maxTokens: this.options.maxTokens,
      });

      // Parse response to ActionPlan[]
      const actionPlans = this.parseResponseToActionPlan(response.content);

      return actionPlans;
    } catch (error) {
      console.error('LLMPlanner error:', error);
      // Fallback to basic action plan
      return [
        {
          type: ActionType.Execute,
          params: { goal, context, error: String(error) },
          reason: `Fallback action due to error: ${String(error)}`,
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
   * Parse LLM response into actions with zod validation
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

      // Validate each action with zod
      const actions: Action[] = [];
      let invalidCount = 0;

      for (const item of parsed) {
        if (item && typeof item === 'object' && item.type) {
          const action: Action = {
            type: String(item.type),
            params: item.params || {},
          };

          // Validate with zod
          if (validateAction(action)) {
            actions.push(action);
          } else {
            invalidCount++;
            const message = `Invalid action format, skipping: ${JSON.stringify(item)}`;

            if (this.options.strictValidation) {
              throw new Error(message);
            } else {
              console.warn(message);
            }
          }
        } else {
          invalidCount++;
          const message = `Missing type field, skipping: ${JSON.stringify(item)}`;

          if (this.options.strictValidation) {
            throw new Error(message);
          } else {
            console.warn(message);
          }
        }
      }

      if (actions.length === 0 && invalidCount > 0) {
        console.error(`All ${invalidCount} actions were invalid`);
      }

      return actions;
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      console.error('Response was:', response);

      if (this.options.strictValidation) {
        throw error;
      }

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
   * Parse LLM response into ActionPlan[] with full structure
   * Extracts: type, target, params, reason, dependencies, metadata
   */
  private parseResponseToActionPlan(response: string): ActionPlan[] {
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
            type: ActionType.Execute,
            params: parsed,
            reason: 'Single action from LLM response',
          },
        ];
      }

      // Parse and validate each ActionPlan
      const actionPlans: ActionPlan[] = [];
      let invalidCount = 0;

      for (const item of parsed) {
        if (item && typeof item === 'object' && item.type) {
          const actionPlan: ActionPlan = {
            type: String(item.type),
            target: item.target,
            params: item.params || {},
            reason: item.reason || 'No reason provided',
            dependencies: item.dependencies,
            metadata: item.metadata,
          };

          // Validate with zod
          if (validateActionPlan(actionPlan)) {
            actionPlans.push(actionPlan);
          } else {
            invalidCount++;
            const message = `Invalid ActionPlan format, skipping: ${JSON.stringify(item)}`;

            if (this.options.strictValidation) {
              throw new Error(message);
            } else {
              console.warn(message);
            }
          }
        } else {
          invalidCount++;
          const message = `Missing type field in ActionPlan, skipping: ${JSON.stringify(item)}`;

          if (this.options.strictValidation) {
            throw new Error(message);
          } else {
            console.warn(message);
          }
        }
      }

      if (actionPlans.length === 0 && invalidCount > 0) {
        console.error(`All ${invalidCount} action plans were invalid`);
      }

      return actionPlans;
    } catch (error) {
      console.error('Failed to parse LLM response to ActionPlan:', error);
      console.error('Response was:', response);

      if (this.options.strictValidation) {
        throw error;
      }

      // Return fallback action plan
      return [
        {
          type: ActionType.Execute,
          params: { rawResponse: response },
          reason: 'Fallback due to parsing error',
        },
      ];
    }
  }

  /**
   * Set custom system prompt
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
    this.options.systemPrompt = prompt;
  }

  /**
   * Get current system prompt
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}
