/**
 * LLM-Powered Planning
 * AI-powered task decomposition and action planning using LLM adapters
 *
 * @packageDocumentation
 */

import type { LLMAdapter, Action, ActionPlan } from '../types/llm';

/**
 * LLM Task Planner Configuration
 */
export interface LLMTaskPlannerConfig {
  /**
   * Temperature for LLM generation (0-2)
   * Lower = more deterministic, Higher = more creative
   * @default 0.3
   */
  temperature?: number;

  /**
   * Maximum tokens for plan generation
   * @default 1000
   */
  maxTokens?: number;

  /**
   * Throw error on validation failure
   * @default false
   */
  strictValidation?: boolean;

  /**
   * Return ActionPlan[] with reasoning
   * @default true
   */
  returnActionPlan?: boolean;

  /**
   * System prompt override
   */
  systemPrompt?: string;
}

/**
 * LLM-Powered Task Planner
 * Uses any LLMAdapter to generate structured action plans from goals
 *
 * @example
 * ```typescript
 * import { OpenAIAdapter } from '@somnia/agent-kit/llm/adapters';
 * import { LLMTaskPlanner } from '@somnia/agent-kit/llm';
 *
 * const llm = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });
 * const planner = new LLMTaskPlanner(llm, {
 *   temperature: 0.3,
 *   strictValidation: true,
 *   returnActionPlan: true
 * });
 *
 * const plans = await planner.planWithReason('Send 1 ETH to Alice');
 * // Returns: ActionPlan[] with type, params, reason, dependencies
 * ```
 */
export class LLMTaskPlanner {
  private llm: LLMAdapter;
  private config: Required<LLMTaskPlannerConfig>;

  constructor(llm: LLMAdapter, config?: LLMTaskPlannerConfig) {
    this.llm = llm;
    this.config = {
      temperature: config?.temperature ?? 0.3,
      maxTokens: config?.maxTokens ?? 1000,
      strictValidation: config?.strictValidation ?? false,
      returnActionPlan: config?.returnActionPlan ?? true,
      systemPrompt: config?.systemPrompt ?? this.getDefaultSystemPrompt(),
    };
  }

  /**
   * Get default system prompt for planning
   */
  private getDefaultSystemPrompt(): string {
    return `You are an AI agent planner. Your task is to break down high-level goals into executable actions.

Return a JSON array of action plans. Each action should have:
- type: Action type (e.g., "check_balance", "execute_transfer", "validate_address")
- params: Action parameters as an object
- reason: Brief explanation why this action is needed
- dependencies: Optional array of action indices this depends on

Example:
[
  {
    "type": "check_balance",
    "params": { "amount": "1.0" },
    "reason": "Verify sufficient balance before transfer"
  },
  {
    "type": "execute_transfer",
    "params": { "to": "0x123...", "amount": "1.0" },
    "reason": "Execute ETH transfer to recipient",
    "dependencies": [0]
  }
]

Be concise and only include necessary actions.`;
  }

  /**
   * Plan with reasoning (returns ActionPlan[])
   * @param goal High-level goal description
   * @param context Optional context for planning
   * @returns Array of action plans with reasoning
   */
  async planWithReason(goal: string, context?: any): Promise<ActionPlan[]> {
    const prompt = this.buildPrompt(goal, context);

    const response = await this.llm.generate(prompt, {
      temperature: this.config.temperature,
      maxTokens: this.config.maxTokens,
    });

    return this.parseResponseToActionPlan(response.content);
  }

  /**
   * Plan without reasoning (returns Action[])
   * @param goal High-level goal description
   * @param context Optional context for planning
   * @returns Array of simple actions
   */
  async plan(goal: string, context?: any): Promise<Action[]> {
    const plans = await this.planWithReason(goal, context);
    return plans.map((plan) => ({
      type: plan.type,
      params: plan.params,
    }));
  }

  /**
   * Build prompt for LLM
   */
  private buildPrompt(goal: string, context?: any): string {
    let prompt = `${this.config.systemPrompt}\n\nGoal: ${goal}`;

    if (context) {
      prompt += `\n\nContext:\n${JSON.stringify(context, null, 2)}`;
    }

    prompt += '\n\nGenerate action plan:';

    return prompt;
  }

  /**
   * Parse LLM response to ActionPlan[]
   */
  private parseResponseToActionPlan(content: string): ActionPlan[] {
    try {
      // Extract JSON from markdown code blocks if present
      let jsonStr = content.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);
      const plans = Array.isArray(parsed) ? parsed : [parsed];

      // Validate structure
      for (const plan of plans) {
        if (!plan.type) {
          throw new Error('Action plan missing "type" field');
        }
        if (!plan.params) {
          throw new Error(`Action plan "${plan.type}" missing "params" field`);
        }
      }

      return plans as ActionPlan[];
    } catch (error: any) {
      if (this.config.strictValidation) {
        throw new Error(`Failed to parse action plan: ${error?.message || error}\nContent: ${content}`);
      }

      // Return empty plan on parse failure
      console.warn('Failed to parse action plan, returning empty plan:', error);
      return [];
    }
  }

  /**
   * Get planner configuration
   */
  getConfig(): Readonly<Required<LLMTaskPlannerConfig>> {
    return { ...this.config };
  }

  /**
   * Update planner configuration
   */
  updateConfig(config: Partial<LLMTaskPlannerConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}
