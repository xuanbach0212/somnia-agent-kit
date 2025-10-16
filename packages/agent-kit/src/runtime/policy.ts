/**
 * Access Control and Governance Policies
 * Defines permissions and rules for agent operations
 */

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
 * Policy class for managing access control
 */
export class Policy {
  private rules: Map<string, PolicyRule> = new Map();
  private roles: Map<string, Set<string>> = new Map(); // role -> addresses

  /**
   * Add a policy rule
   */
  addRule(rule: Omit<PolicyRule, 'id' | 'createdAt'>): string {
    const id = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullRule: PolicyRule = {
      id,
      createdAt: Date.now(),
      priority: rule.priority || 0,
      enabled: rule.enabled !== false,
      ...rule,
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
}
