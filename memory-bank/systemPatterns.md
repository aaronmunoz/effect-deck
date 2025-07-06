# System Patterns: Effect Deck

## Architecture Overview

Effect Deck follows a **functional monorepo architecture** with clear separation of concerns:

```
effect-deck/
├── packages/core/     # Pure functional game engine
├── packages/cli/      # Terminal interface
├── packages/web/      # React web interface  
└── memory-bank/       # Claude's context preservation
```

## Key Technical Decisions

### 1. Effect-TS as Core Pattern
**Decision**: All business logic uses Effect-TS primitives
**Rationale**: Demonstrates composable effects and structured error handling
**Implementation**: 
- `Effect.Effect<Success, Error>` for all game operations
- No thrown exceptions - errors modeled as Effect failures
- `Effect.gen` for sequential operations
- `Ref` for mutable state within Effect computations

### 2. Immutable State Management
**Decision**: All game state changes return new objects
**Rationale**: Enables time travel debugging and predictable state transitions
**Implementation**:
- `GameState` interface with readonly properties
- Pure functions for all state transitions
- JSON serializable state for save/load functionality

### 3. Schema-First API Design
**Decision**: Effect Schema defines all game data structures
**Rationale**: Runtime type safety and automatic validation
**Implementation**:
- `GameState`, `GameAction`, `GameResponse` schemas
- Validation at package boundaries
- JSON responses suitable for any frontend

### 4. Package Boundary Enforcement
**Decision**: Core engine is completely UI-agnostic
**Rationale**: Enables multiple frontend implementations with shared logic
**Implementation**:
- Core exports only pure functions and types
- CLI and web packages depend on core, never vice versa
- No UI concerns leak into core package

## Design Patterns in Use

### 1. Command Pattern
- `GameAction` union type represents all possible player actions
- `processAction` function handles command dispatch
- Actions are serializable for network/persistence

### 2. State Machine Pattern
- Game phases: `draw`, `play`, `enemy`, `cleanup`
- Phase transitions are pure functions
- Invalid state transitions return errors

### 3. Factory Pattern
- `CardFactory` creates cards with proper typing
- `EncounterGenerator` creates procedural enemies
- Factories handle validation and default values

### 4. Strategy Pattern
- Different card effects implement common interface
- Enemy AI behaviors are pluggable strategies
- Renderer implementations for different frontends

## Component Relationships

### Core Engine Flow
```
GameAction → processAction() → GameState → GameResponse
     ↓                                         ↑
Schema Validation                        JSON Serialization
```

### Effect Composition
```
Card Effects → Context System → Dependency Resolution → State Updates
```

### Package Dependencies
```
CLI ──→ Core ←── Web
     ↘     ↙
   Shared Types
```

## Critical Implementation Paths

### 1. Card Effect Resolution
1. Player selects card from hand
2. Core validates card can be played (energy cost, requirements)
3. Card effect executes within Effect context
4. Game state updates immutably
5. JSON response sent to frontend

### 2. Turn Management
1. Turn phase transitions managed by state machine
2. Each phase has specific allowed actions
3. Phase completion triggers automatic transitions
4. Turn counter advances after enemy phase

### 3. Context System (Dependency Injection)
1. Cards can provide contexts (`Initialize Algorithm`)
2. Other cards require contexts (`Overclock Attack` needs `HighEnergy`)
3. Context matching happens during card validation
4. Contexts persist until explicitly removed

### 4. Error Handling Flow
1. All operations return `Effect<Success, Error>`
2. Errors are typed and structured (not strings)
3. Error recovery happens at appropriate boundaries
4. User sees meaningful error messages

## Testing Architecture

### Test Structure
- Unit tests for pure functions in core
- Integration tests for package interactions
- E2E tests for complete game flows
- Property-based tests for game rules

### Test Patterns
- Fixtures for common game states
- Builders for complex test data
- Effect testing utilities from `@effect/test`
- No mocking - use dependency injection instead

## Performance Considerations

- Immutable state updates use structural sharing where possible
- Game state is lightweight and serializes quickly
- Card effect resolution is synchronous (no async operations)
- Memory usage bounded by deck size and game history