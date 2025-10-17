/**
 * Access Control and Governance Policies
 * Defines permissions and rules for agent operations
 * Includes both access control (enterprise) and operational policies (guards)
 */

import type { Action } from './planner';

// =============================================================================
// Operational Policy Types
// =============================================================================

/**
 * Operational policy configuration for agent behavior
 */
export interface OperationalPolicy {
  maxGasLimit?: bigint;
  maxRetries?: number;
  maxTransferAmount?: bigint;
  minTransferAmount?: bigint;
  allowedActions?: string[];
  blockedActions?: string[];
  rateLimit?: {
    maxActions: number;
    windowMs: number;
  };
  requireApproval?: boolean;
}

// =============================================================================
// Access Control Types
// =============================================================================

export enum PolicyAction {
  Execute = 'execute',
  Deploy = 'deploy',
  Pause = 'pause',
  Resume = 'resume',
  Terminate = 'terminate',
  Transfer = 'transfer',
  Withdraw = 'withdraw',
  UpdateConfig = 'update_config',
}

export enum PolicyEffect {
  Allow = 'allow',
  Deny = 'deny',
}

export interface PolicyRule {
  id: string;
  name: string;
  action: PolicyAction | string;
  effect: PolicyEffect;
  conditions?: PolicyCondition[];
  priority?: number;
  enabled: boolean;
  createdAt: number;
}

export interface PolicyCondition {
  type: 'role' | 'address' | 'amount' | 'time' | 'custom';
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  field: string;
  value: any;
}

export interface PolicyContext {
  actor: string;
  action: string;
  resource?: string;
  params?: Record<string, any>;
  timestamp: number;
}

/**
 * Policy class for managing access control and operational policies
 */
export class Policy {
  private rules: Map<string, PolicyRule> = new Map();
  private roles: Map<string, Set<string>> = new Map(); // role -> addresses
  private operationalPolicy: OperationalPolicy = {};
  private actionHistory: Array<{ action: string; timestamp: number }> = [];

  /**
   * Add a policy rule
   */
  addRule(rule: Omit<PolicyRule, 'id' | 'createdAt'>): string {
    const id = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullRule: PolicyRule = {
      ...rule,
      id,
      createdAt: Date.now(),
      priority: rule.priority || 0,
      enabled: rule.enabled !== false,
    };

    this.rules.set(id, fullRule);
    return id;
  }

  /**
   * Remove a policy rule
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Assign role to address
   */
  assignRole(role: string, address: string): void {
    let addresses = this.roles.get(role);
    if (!addresses) {
      addresses = new Set();
      this.roles.set(role, addresses);
    }
    addresses.add(address.toLowerCase());
  }

  /**
   * Revoke role from address
   */
  revokeRole(role: string, address: string): void {
    const addresses = this.roles.get(role);
    if (addresses) {
      addresses.delete(address.toLowerCase());
    }
  }

  /**
   * Check if address has role
   */
  hasRole(role: string, address: string): boolean {
    const addresses = this.roles.get(role);
    return addresses ? addresses.has(address.toLowerCase()) : false;
  }

  /**
   * Evaluate if action is allowed
   */
  evaluate(context: PolicyContext): boolean {
    // Get applicable rules
    const applicableRules = this.getApplicableRules(context);

    if (applicableRules.length === 0) {
      // Default deny if no rules match
      return false;
    }

    // Sort by priority (higher priority first)
    applicableRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Evaluate rules in order
    for (const rule of applicableRules) {
      if (!rule.enabled) {
        continue;
      }

      // Check conditions
      if (this.checkConditions(rule, context)) {
        return rule.effect === PolicyEffect.Allow;
      }
    }

    // Default deny
    return false;
  }

  /**
   * Get applicable rules for context
   */
  private getApplicableRules(context: PolicyContext): PolicyRule[] {
    return Array.from(this.rules.values()).filter(
      (rule) =>
        rule.action === context.action ||
        rule.action === '*' ||
        context.action === '*'
    );
  }

  /**
   * Check if rule conditions are met
   */
  private checkConditions(rule: PolicyRule, context: PolicyContext): boolean {
    if (!rule.conditions || rule.conditions.length === 0) {
      return true;
    }

    return rule.conditions.every((condition) =>
      this.evaluateCondition(condition, context)
    );
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: PolicyCondition,
    context: PolicyContext
  ): boolean {
    let value: any;

    switch (condition.type) {
      case 'role':
        return this.hasRole(condition.value, context.actor);

      case 'address':
        value = context.actor.toLowerCase();
        break;

      case 'amount':
        value = context.params?.amount || 0;
        break;

      case 'time':
        value = context.timestamp;
        break;

      case 'custom':
        value = this.getFieldValue(context, condition.field);
        break;

      default:
        return false;
    }

    // Evaluate operator
    switch (condition.operator) {
      case 'eq':
        return value === condition.value;
      case 'ne':
        return value !== condition.value;
      case 'gt':
        return value > condition.value;
      case 'gte':
        return value >= condition.value;
      case 'lt':
        return value < condition.value;
      case 'lte':
        return value <= condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'contains':
        return String(value).includes(condition.value);
      default:
        return false;
    }
  }

  /**
   * Get field value from context
   */
  private getFieldValue(context: PolicyContext, field: string): any {
    const parts = field.split('.');
    let value: any = context;

    for (const part of parts) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): PolicyRule | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all rules
   */
  getAllRules(): PolicyRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Enable rule
   */
  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
    }
  }

  /**
   * Disable rule
   */
  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
    }
  }

  /**
   * Get all roles
   */
  getAllRoles(): Map<string, string[]> {
    const result = new Map<string, string[]>();
    for (const [role, addresses] of this.roles.entries()) {
      result.set(role, Array.from(addresses));
    }
    return result;
  }

  /**
   * Clear all rules
   */
  clearRules(): void {
    this.rules.clear();
  }

  /**
   * Clear all roles
   */
  clearRoles(): void {
    this.roles.clear();
  }

  // =============================================================================
  // Operational Policy Methods
  // =============================================================================

  /**
   * Check permission (simple wrapper for Agent.ts compatibility)
   * @param address Address to check
   * @param action Action to perform
   * @returns true if allowed, false otherwise
   */
  checkPermission(address: string, action: string): boolean {
    const context: PolicyContext = {
      actor: address,
      action,
      timestamp: Date.now(),
    };
    return this.evaluate(context);
  }

  /**
   * Main guard method - check if action should be executed
   * @param action Action to execute
   * @returns true if should execute, false otherwise
   */
  shouldExecute(action: Action): boolean {
    const policy = this.operationalPolicy;

    // Check if action type is allowed
    if (policy.allowedActions && policy.allowedActions.length > 0) {
      if (!policy.allowedActions.includes(action.type)) {
        return false;
      }
    }

    // Check if action type is blocked
    if (policy.blockedActions && policy.blockedActions.includes(action.type)) {
      return false;
    }

    // Check transfer amount limits
    if (action.params?.amount) {
      const amount = typeof action.params.amount === 'string'
        ? BigInt(action.params.amount)
        : BigInt(action.params.amount);

      if (policy.minTransferAmount && amount < policy.minTransferAmount) {
        return false;
      }

      if (policy.maxTransferAmount && amount > policy.maxTransferAmount) {
        return false;
      }
    }

    // Check rate limit
    if (policy.rateLimit) {
      if (!this.checkRateLimit()) {
        return false;
      }
    }

    // Check if approval is required
    if (policy.requireApproval) {
      // In production, this would check an approval queue
      return false;
    }

    return true;
  }

  /**
   * Check if action should be delayed
   * @param action Action to check
   * @returns delay in ms, or false for no delay
   */
  shouldDelay(action: Action): number | false {
    const policy = this.operationalPolicy;

    // Check rate limit for delay
    if (policy.rateLimit) {
      const recentCount = this.getRecentActionCount();
      if (recentCount >= policy.rateLimit.maxActions) {
        // Calculate delay until oldest action expires
        const oldestAction = this.actionHistory[0];
        if (oldestAction) {
          const elapsed = Date.now() - oldestAction.timestamp;
          const remaining = policy.rateLimit.windowMs - elapsed;
          if (remaining > 0) {
            return remaining;
          }
        }
      }
    }

    return false;
  }

  /**
   * Override action before execution (e.g., cap amounts, adjust gas)
   * @param action Original action
   * @returns Modified action
   */
  overrideAction(action: Action): Action {
    const policy = this.operationalPolicy;
    const overridden = { ...action, params: { ...action.params } };

    // Cap transfer amount if needed
    if (action.params?.amount && policy.maxTransferAmount) {
      const amount = typeof action.params.amount === 'string'
        ? BigInt(action.params.amount)
        : BigInt(action.params.amount);

      if (amount > policy.maxTransferAmount) {
        overridden.params.amount = policy.maxTransferAmount.toString();
      }
    }

    // Cap gas limit if needed
    if (action.params?.gasLimit && policy.maxGasLimit) {
      const gasLimit = typeof action.params.gasLimit === 'string'
        ? BigInt(action.params.gasLimit)
        : BigInt(action.params.gasLimit);

      if (gasLimit > policy.maxGasLimit) {
        overridden.params.gasLimit = policy.maxGasLimit.toString();
      }
    }

    return overridden;
  }

  /**
   * Set operational policy
   */
  setOperationalPolicy(policy: OperationalPolicy): void {
    this.operationalPolicy = { ...policy };
  }

  /**
   * Get operational policy
   */
  getOperationalPolicy(): Readonly<OperationalPolicy> {
    return { ...this.operationalPolicy };
  }

  /**
   * Set gas limit
   */
  setGasLimit(limit: bigint): void {
    this.operationalPolicy.maxGasLimit = limit;
  }

  /**
   * Set retry limit
   */
  setRetryLimit(limit: number): void {
    this.operationalPolicy.maxRetries = limit;
  }

  /**
   * Set transfer limits
   */
  setTransferLimit(min: bigint, max: bigint): void {
    this.operationalPolicy.minTransferAmount = min;
    this.operationalPolicy.maxTransferAmount = max;
  }

  /**
   * Add allowed action type
   */
  addAllowedAction(action: string): void {
    if (!this.operationalPolicy.allowedActions) {
      this.operationalPolicy.allowedActions = [];
    }
    if (!this.operationalPolicy.allowedActions.includes(action)) {
      this.operationalPolicy.allowedActions.push(action);
    }
  }

  /**
   * Add blocked action type
   */
  addBlockedAction(action: string): void {
    if (!this.operationalPolicy.blockedActions) {
      this.operationalPolicy.blockedActions = [];
    }
    if (!this.operationalPolicy.blockedActions.includes(action)) {
      this.operationalPolicy.blockedActions.push(action);
    }
  }

  /**
   * Set rate limit
   */
  setRateLimit(maxActions: number, windowMs: number): void {
    this.operationalPolicy.rateLimit = { maxActions, windowMs };
  }

  /**
   * Record action for rate limiting
   */
  recordAction(action: string): void {
    this.actionHistory.push({
      action,
      timestamp: Date.now(),
    });
    this.cleanupOldActions();
  }

  /**
   * Check if within rate limit
   */
  private checkRateLimit(): boolean {
    const policy = this.operationalPolicy.rateLimit;
    if (!policy) return true;

    this.cleanupOldActions();
    return this.actionHistory.length < policy.maxActions;
  }

  /**
   * Get count of recent actions within window
   */
  private getRecentActionCount(): number {
    this.cleanupOldActions();
    return this.actionHistory.length;
  }

  /**
   * Clean up old actions outside the rate limit window
   */
  private cleanupOldActions(): void {
    const policy = this.operationalPolicy.rateLimit;
    if (!policy) return;

    const cutoff = Date.now() - policy.windowMs;
    this.actionHistory = this.actionHistory.filter(
      (entry) => entry.timestamp > cutoff
    );
  }

  /**
   * Clear action history
   */
  clearActionHistory(): void {
    this.actionHistory = [];
  }
}
