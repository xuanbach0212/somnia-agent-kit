# Architecture Overview

Somnia Agent Kit is built with a modular monorepo architecture.

## High-Level Architecture

```
┌──────────────────────────────────────────────┐
│         Application Layer (User Code)        │
├──────────────────────────────────────────────┤
│        @somnia/agent-kit (TypeScript SDK)    │
│  ┌────────────┬──────────┬─────────────────┐ │
│  │  Runtime   │   LLM    │    Monitor      │ │
│  │  - Agent   │ - OpenAI │    - Logger     │ │
│  │  - Planner │ - Ollama │    - Metrics    │ │
│  │  - Executor│          │    - Events     │ │
│  └────────────┴──────────┴─────────────────┘ │
│  ┌────────────────────────────────────────┐  │
│  │         Core (Blockchain Layer)         │  │
│  │  - Chain Client  - Contracts            │  │
│  │  - Signer Manager - Config              │  │
│  └────────────────────────────────────────┘  │
├──────────────────────────────────────────────┤
│         Smart Contracts (Solidity)           │
│  - AgentRegistry  - AgentExecutor           │
│  - AgentManager   - AgentVault              │
├──────────────────────────────────────────────┤
│          Somnia Blockchain Network           │
└──────────────────────────────────────────────┘
```

## Module Breakdown

### Core Layer
Handles blockchain connectivity, contract interactions, and wallet management.

### Runtime Layer
Manages agent lifecycle, task planning, execution, and triggers.

### LLM Layer
Provides AI capabilities through OpenAI and Ollama adapters.

### Monitor Layer
Tracks logs, metrics, and blockchain events.

## Design Principles

1. **Modularity**: Each layer is independent and replaceable
2. **Type Safety**: Full TypeScript with strict mode
3. **Extensibility**: Plugin-based architecture
4. **Performance**: Optimized for high-throughput scenarios
