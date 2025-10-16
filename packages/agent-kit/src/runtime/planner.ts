/**
 * Task Planning and Decomposition
 * Breaks down complex tasks into executable steps
 */

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
}
