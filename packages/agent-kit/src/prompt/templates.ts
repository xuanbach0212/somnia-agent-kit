/**
 * Prompt Templates for AI Agents
 * Reusable prompt templates with placeholder support
 */

/**
 * Template metadata
 */
export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  examples?: Record<string, any>[];
}

/**
 * Basic agent prompt for general tasks
 */
export const BASIC_AGENT_PROMPT: PromptTemplate = {
  name: 'basic_agent',
  description: 'General purpose AI agent prompt',
  template: `You are an AI agent on the Somnia blockchain. Your goal is to analyze the input and return appropriate actions.

Goal: {{goal}}

Context: {{context}}

Please analyze the situation and determine the best course of action.`,
  variables: ['goal', 'context'],
  examples: [
    {
      goal: 'Check my wallet balance',
      context: 'User address: 0x123...',
    },
  ],
};

/**
 * Action planner prompt for breaking down goals
 */
export const ACTION_PLANNER_PROMPT: PromptTemplate = {
  name: 'action_planner',
  description: 'Plans actions from user goals',
  template: `You are an AI agent planner. Your job is to break down user goals into executable actions.

IMPORTANT: You MUST respond with valid JSON only. No markdown, no explanations, just a JSON array.

Output format:
[
  {
    "type": "action_type",
    "target": "optional_target_address",
    "params": {
      "param1": "value1",
      "param2": "value2"
    },
    "reason": "Why this action is needed"
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
- data_fetch: Fetch data from blockchain or API
- no_action: No action needed (observation only)
- query_data: Query blockchain data
- execute: Generic execution

Goal: {{goal}}

{{#if context}}
Context: {{context}}
{{/if}}

Break down the goal into simple, sequential actions. For each action, provide:
- type: The action type from the list above
- target: Target address if applicable (contract, recipient, etc.)
- params: Parameters needed for the action
- reason: Clear explanation of why this action is necessary`,
  variables: ['goal', 'context'],
  examples: [
    {
      goal: 'Send 1 ETH to Alice',
      context: 'My balance: 5 ETH, Alice address: 0xabc...',
    },
  ],
};

/**
 * Blockchain analyzer prompt
 */
export const BLOCKCHAIN_ANALYZER_PROMPT: PromptTemplate = {
  name: 'blockchain_analyzer',
  description: 'Analyzes blockchain state and events',
  template: `You are a blockchain state analyzer for the Somnia network.

Blockchain State:
- Block Number: {{blockNumber}}
- Network: {{network}}
- Gas Price: {{gasPrice}}

{{#if events}}
Recent Events:
{{events}}
{{/if}}

{{#if state}}
Current State:
{{state}}
{{/if}}

Task: {{task}}

Analyze the blockchain state and provide recommendations for what the agent should do next.`,
  variables: ['blockNumber', 'network', 'gasPrice', 'task', 'events', 'state'],
  examples: [
    {
      blockNumber: 1000000,
      network: 'mainnet',
      gasPrice: '20 gwei',
      task: 'Monitor for high-value transfers',
    },
  ],
};

/**
 * Event handler prompt
 */
export const EVENT_HANDLER_PROMPT: PromptTemplate = {
  name: 'event_handler',
  description: 'Handles blockchain events',
  template: `You are an AI agent event handler on Somnia chain.

Event Details:
- Type: {{eventType}}
- Contract: {{contractAddress}}
- Block: {{blockNumber}}
- Transaction: {{txHash}}

{{#if eventData}}
Event Data:
{{eventData}}
{{/if}}

Instructions: {{instructions}}

Determine the appropriate action to take in response to this event.`,
  variables: [
    'eventType',
    'contractAddress',
    'blockNumber',
    'txHash',
    'eventData',
    'instructions',
  ],
  examples: [
    {
      eventType: 'Transfer',
      contractAddress: '0x...',
      blockNumber: 1000000,
      txHash: '0x...',
      instructions: 'Monitor large transfers and alert if > 100 ETH',
    },
  ],
};

/**
 * Tool executor prompt
 */
export const TOOL_EXECUTOR_PROMPT: PromptTemplate = {
  name: 'tool_executor',
  description: 'Executes tools and handles results',
  template: `You are a tool execution agent. Execute the following tool and handle the result.

Tool: {{toolName}}

{{#if toolDescription}}
Description: {{toolDescription}}
{{/if}}

Parameters:
{{params}}

{{#if constraints}}
Constraints:
{{constraints}}
{{/if}}

Execute the tool and provide a summary of the result.`,
  variables: ['toolName', 'toolDescription', 'params', 'constraints'],
  examples: [
    {
      toolName: 'check_balance',
      params: { address: '0x123...' },
      constraints: 'Read-only operation',
    },
  ],
};

/**
 * Transaction builder prompt
 */
export const TRANSACTION_BUILDER_PROMPT: PromptTemplate = {
  name: 'transaction_builder',
  description: 'Builds blockchain transactions',
  template: `You are a transaction builder agent. Construct a transaction based on the following requirements.

Transaction Type: {{txType}}
Target: {{target}}

{{#if amount}}
Amount: {{amount}}
{{/if}}

{{#if data}}
Data: {{data}}
{{/if}}

Requirements:
{{requirements}}

Build a safe and optimized transaction that meets these requirements.`,
  variables: ['txType', 'target', 'amount', 'data', 'requirements'],
  examples: [
    {
      txType: 'transfer',
      target: '0xabc...',
      amount: '1 ETH',
      requirements: 'Minimize gas cost',
    },
  ],
};

/**
 * Data query prompt
 */
export const DATA_QUERY_PROMPT: PromptTemplate = {
  name: 'data_query',
  description: 'Queries blockchain data',
  template: `You are a blockchain data query agent.

Query: {{query}}

{{#if filters}}
Filters:
{{filters}}
{{/if}}

{{#if timeRange}}
Time Range: {{timeRange}}
{{/if}}

Retrieve and format the requested data from the blockchain.`,
  variables: ['query', 'filters', 'timeRange'],
  examples: [
    {
      query: 'Get all transfers in the last hour',
      timeRange: '1 hour',
    },
  ],
};

/**
 * Error handler prompt
 */
export const ERROR_HANDLER_PROMPT: PromptTemplate = {
  name: 'error_handler',
  description: 'Handles errors and suggests recovery',
  template: `You are an error handler agent. Analyze the error and suggest recovery actions.

Error Details:
- Type: {{errorType}}
- Message: {{errorMessage}}

{{#if stackTrace}}
Stack Trace:
{{stackTrace}}
{{/if}}

{{#if context}}
Context:
{{context}}
{{/if}}

Suggest recovery actions or alternative approaches.`,
  variables: ['errorType', 'errorMessage', 'stackTrace', 'context'],
  examples: [
    {
      errorType: 'InsufficientFunds',
      errorMessage: 'Not enough ETH for gas',
    },
  ],
};

/**
 * Risk assessment prompt
 */
export const RISK_ASSESSMENT_PROMPT: PromptTemplate = {
  name: 'risk_assessment',
  description: 'Assesses transaction risks',
  template: `You are a risk assessment agent. Evaluate the risk of the following action.

Action: {{action}}
Parameters: {{params}}

{{#if contractInfo}}
Contract Information:
{{contractInfo}}
{{/if}}

{{#if historicalData}}
Historical Data:
{{historicalData}}
{{/if}}

Assess the risk level (low/medium/high) and provide recommendations.`,
  variables: ['action', 'params', 'contractInfo', 'historicalData'],
  examples: [
    {
      action: 'approve_token',
      params: { spender: '0x...', amount: 'unlimited' },
    },
  ],
};

/**
 * All templates map
 */
export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  basic_agent: BASIC_AGENT_PROMPT,
  action_planner: ACTION_PLANNER_PROMPT,
  blockchain_analyzer: BLOCKCHAIN_ANALYZER_PROMPT,
  event_handler: EVENT_HANDLER_PROMPT,
  tool_executor: TOOL_EXECUTOR_PROMPT,
  transaction_builder: TRANSACTION_BUILDER_PROMPT,
  data_query: DATA_QUERY_PROMPT,
  error_handler: ERROR_HANDLER_PROMPT,
  risk_assessment: RISK_ASSESSMENT_PROMPT,
};

/**
 * Get template by name
 */
export function getTemplate(name: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[name];
}

/**
 * List all available templates
 */
export function listTemplates(): string[] {
  return Object.keys(PROMPT_TEMPLATES);
}

/**
 * Get template variables
 */
export function getTemplateVariables(name: string): string[] {
  const template = getTemplate(name);
  return template?.variables || [];
}
