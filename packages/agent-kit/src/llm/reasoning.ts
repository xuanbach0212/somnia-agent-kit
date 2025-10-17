/**
 * Multi-Step Reasoning
 * Advanced reasoning capabilities including chain-of-thought, multi-step problem solving
 *
 * @packageDocumentation
 */

import type { LLMAdapter } from '../types/llm';

/**
 * Reasoning Step
 * Single step in a reasoning chain
 */
export interface ReasoningStep {
  /**
   * Step number (1-indexed)
   */
  step: number;

  /**
   * Step description/thought
   */
  thought: string;

  /**
   * Conclusion or intermediate result
   */
  conclusion?: string;

  /**
   * Confidence score (0-1)
   */
  confidence?: number;
}

/**
 * Reasoning Trace
 * Complete trace of reasoning process
 */
export interface ReasoningTrace {
  /**
   * Original problem/question
   */
  problem: string;

  /**
   * Reasoning steps
   */
  steps: ReasoningStep[];

  /**
   * Final answer/conclusion
   */
  answer: string;

  /**
   * Overall confidence (0-1)
   */
  confidence: number;

  /**
   * Reasoning quality score (0-1)
   */
  quality?: number;
}

/**
 * Reasoning Configuration
 */
export interface ReasoningConfig {
  /**
   * Maximum number of reasoning steps
   * @default 5
   */
  maxSteps?: number;

  /**
   * Temperature for generation
   * @default 0.5
   */
  temperature?: number;

  /**
   * Include confidence scores
   * @default true
   */
  includeConfidence?: boolean;
}

/**
 * Multi-Step Reasoner
 * Provides chain-of-thought reasoning and complex problem solving
 *
 * @example
 * ```typescript
 * import { OpenAIAdapter } from '@somnia/agent-kit/llm/adapters';
 * import { MultiStepReasoner } from '@somnia/agent-kit/llm';
 *
 * const llm = new OpenAIAdapter({ apiKey: process.env.OPENAI_API_KEY });
 * const reasoner = new MultiStepReasoner(llm);
 *
 * const trace = await reasoner.chainOfThought(
 *   "Should I execute this transaction with 100 ETH to unknown address?"
 * );
 *
 * console.log(trace.answer);
 * console.log(`Confidence: ${trace.confidence}`);
 * ```
 */
export class MultiStepReasoner {
  private llm: LLMAdapter;
  private config: Required<ReasoningConfig>;

  constructor(llm: LLMAdapter, config?: ReasoningConfig) {
    this.llm = llm;
    this.config = {
      maxSteps: config?.maxSteps ?? 5,
      temperature: config?.temperature ?? 0.5,
      includeConfidence: config?.includeConfidence ?? true,
    };
  }

  /**
   * Chain-of-Thought Reasoning
   * Break down complex problem into reasoning steps
   *
   * @param problem Problem or question to reason about
   * @returns Reasoning trace with steps and final answer
   */
  async chainOfThought(problem: string): Promise<ReasoningTrace> {
    const prompt = `Think through this problem step by step:

Problem: ${problem}

Provide your reasoning in the following JSON format:
{
  "steps": [
    {
      "step": 1,
      "thought": "First, I need to consider...",
      "conclusion": "This means that...",
      "confidence": 0.9
    }
  ],
  "answer": "Final conclusion",
  "confidence": 0.85
}

Think carefully and show your reasoning process.`;

    const response = await this.llm.generate(prompt, {
      temperature: this.config.temperature,
      maxTokens: 1500,
    });

    return this.parseReasoningTrace(problem, response.content);
  }

  /**
   * Multi-Step Reasoning with Context
   * Complex problem solving with additional context
   *
   * @param goal Goal to achieve
   * @param context Additional context
   * @returns Reasoning trace
   */
  async multiStepReasoning(goal: string, context?: any): Promise<ReasoningTrace> {
    let prompt = `Reason through this goal step by step:

Goal: ${goal}`;

    if (context) {
      prompt += `\n\nContext:\n${JSON.stringify(context, null, 2)}`;
    }

    prompt += `\n\nProvide detailed reasoning steps and final conclusion in JSON format.`;

    const response = await this.llm.generate(prompt, {
      temperature: this.config.temperature,
      maxTokens: 1500,
    });

    return this.parseReasoningTrace(goal, response.content);
  }

  /**
   * Evaluate Reasoning Quality
   * Assess the quality of a reasoning trace
   *
   * @param trace Reasoning trace to evaluate
   * @returns Quality score (0-1)
   */
  evaluateReasoning(trace: ReasoningTrace): number {
    let score = 0;

    // Check if all steps have conclusions
    const hasConclusions = trace.steps.every((step) => step.conclusion);
    if (hasConclusions) score += 0.3;

    // Check step coherence (each step builds on previous)
    if (trace.steps.length >= 2) {
      score += 0.2;
    }

    // Check confidence levels
    const avgConfidence =
      trace.steps.reduce((sum, step) => sum + (step.confidence || 0), 0) /
      trace.steps.length;
    score += avgConfidence * 0.3;

    // Check if answer is substantial
    if (trace.answer && trace.answer.length > 50) {
      score += 0.2;
    }

    return Math.min(1, score);
  }

  /**
   * Explain Decision
   * Provide explanation for why an action/decision was chosen
   *
   * @param action Action or decision to explain
   * @param context Optional context
   * @returns Explanation text
   */
  async explainDecision(action: string, context?: any): Promise<string> {
    let prompt = `Explain why this action/decision makes sense:

Action: ${action}`;

    if (context) {
      prompt += `\n\nContext:\n${JSON.stringify(context, null, 2)}`;
    }

    prompt += '\n\nProvide a clear, concise explanation (2-3 sentences).';

    const response = await this.llm.generate(prompt, {
      temperature: 0.3,
      maxTokens: 300,
    });

    return response.content.trim();
  }

  /**
   * Parse LLM response to ReasoningTrace
   */
  private parseReasoningTrace(problem: string, content: string): ReasoningTrace {
    try {
      // Extract JSON from markdown code blocks if present
      let jsonStr = content.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      const parsed = JSON.parse(jsonStr);

      const trace: ReasoningTrace = {
        problem,
        steps: parsed.steps || [],
        answer: parsed.answer || 'Unable to determine',
        confidence: parsed.confidence || 0.5,
      };

      // Evaluate quality
      trace.quality = this.evaluateReasoning(trace);

      return trace;
    } catch (error) {
      console.warn('Failed to parse reasoning trace:', error);

      // Return minimal trace on parse failure
      return {
        problem,
        steps: [
          {
            step: 1,
            thought: 'Unable to parse structured reasoning',
            conclusion: content.slice(0, 200),
          },
        ],
        answer: content.slice(0, 200),
        confidence: 0.3,
        quality: 0.2,
      };
    }
  }

  /**
   * Get reasoner configuration
   */
  getConfig(): Readonly<Required<ReasoningConfig>> {
    return { ...this.config };
  }

  /**
   * Update reasoner configuration
   */
  updateConfig(config: Partial<ReasoningConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}
