# SDK Design

## Core Concepts

### 1. SomniaAgentKit (Main SDK Class)

Entry point for all operations:

```typescript
const kit = new SomniaAgentKit(config);
await kit.initialize();
```

### 2. Agent Lifecycle

```
Create → Register → Deploy → Start → Execute → Stop
```

### 3. Task Planning & Execution

Tasks are decomposed into steps and executed:

```typescript
const planner = new Planner();
const plan = await planner.createPlan(taskId, taskType, taskData);

const executor = new Executor();
const result = await executor.execute(plan);
```

### 4. Event-Driven Architecture

Triggers respond to blockchain events or time schedules:

```typescript
const trigger = new Trigger();
trigger.register({
  name: 'PriceAlert',
  type: TriggerType.Condition,
  conditions: [{ type: 'gt', field: 'price', value: 1000 }],
  action: 'notify_user',
});
```

## Design Patterns

- **Factory Pattern**: Agent creation
- **Strategy Pattern**: Execution handlers
- **Observer Pattern**: Event triggers
- **Repository Pattern**: State storage
