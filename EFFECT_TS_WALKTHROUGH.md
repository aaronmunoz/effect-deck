# Effect-TS Game Engine Design Walkthrough

## Overview

This document provides a comprehensive walkthrough of how Effect-TS is used in the Effect Deck game engine, covering both current implementation and advanced patterns.

## Core Effect-TS Patterns

### 1. Schema-First Design

**Location**: `packages/core/src/schema.ts`

Effect Schema provides both compile-time types and runtime validation:

```typescript
export const CardSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  cost: Schema.Number,
  description: Schema.String,
  type: Schema.Literal('attack', 'defense', 'context', 'dependent'),
})

// Derive TypeScript type from schema
export type Card = Schema.Schema.Type<typeof CardSchema>
```

**Benefits**:
- Single source of truth for types
- Runtime validation
- Schema composition
- Automatic serialization/deserialization

### 2. Tagged Errors (No Exceptions)

**Location**: `packages/core/src/errors.ts`

All errors are first-class values tracked in Effect's type signature:

```typescript
export class CardNotFound extends Schema.TaggedError<CardNotFound>()("CardNotFound", {
  cardId: Schema.String,
  availableCards: Schema.Array(Schema.String),
}) {
  override get message() {
    return `Card '${this.cardId}' not found. Available: ${this.availableCards.join(', ')}`
  }
}

// Used in effect signatures:
Effect.Effect<Card, CardNotFound>
```

**Pattern**: Errors in type signatures → No try/catch → Explicit error handling

### 3. Context-Based Dependency Injection

**Location**: `packages/core/src/services.ts`

Services are defined as Context tags:

```typescript
export interface GameEngine {
  readonly processAction: (action: GameAction) => Effect.Effect<GameResponse, GameError, CardRegistry>
  readonly getGameState: () => Effect.Effect<GameState>
  readonly startNewGame: () => Effect.Effect<GameResponse, GameError, CardRegistry>
}

export const GameEngine = Context.GenericTag<GameEngine>('GameEngine')
```

**Usage**:
```typescript
const program = Effect.gen(function* () {
  const engine = yield* GameEngine  // Access service via Context
  const response = yield* engine.processAction(action)
  return response
})
```

**Benefits**:
- Explicit dependencies in type signatures
- Easy testing with mock implementations
- No global state or singletons

### 4. Layer-Based Architecture

**Location**: `packages/core/src/game-engine.ts`, `packages/core/src/app-layer.ts`

Layers compose services and their dependencies:

```typescript
// Layer that provides GameStateRef
export const GameStateRefLive: Layer.Layer<GameStateRef> =
  Layer.effect(
    GameStateRef,
    Effect.gen(function* () {
      const ref = yield* Ref.make(createInitialGameState())
      return { ref }
    })
  )

// Layer that requires GameStateRef and provides GameEngine
export const GameEngineLive: Layer.Layer<GameEngine, never, GameStateRef | CardRegistry> =
  Layer.effect(
    GameEngine,
    Effect.gen(function* () {
      const { ref: gameStateRef } = yield* GameStateRef
      // ... implementation
    })
  )
```

**Composition** (packages/core/src/app-layer.ts:33-44):
```typescript
export const AppLayer = Layer.provide(
  Layer.mergeAll(
    BootstrappedServicesLayer,
    GameEngineLayer
  ),
  BootstrappedServicesLayer
)
```

**Benefits**:
- Declarative dependency management
- Deterministic initialization order
- Testable layer substitution

### 5. Ref for Mutable State

**Location**: `packages/core/src/game-engine.ts:171-178`

Ref provides safe mutable state within Effect:

```typescript
const ref = yield* Ref.make(createInitialGameState())

// Read
const currentState = yield* Ref.get(gameStateRef)

// Write
yield* Ref.set(gameStateRef, newState)

// Update
yield* Ref.update(gameStateRef, (state) => ({
  ...state,
  turn: state.turn + 1
}))
```

**Benefits**:
- Thread-safe updates
- Composable with other Effects
- Atomic operations

### 6. Effect.gen for Sequential Operations

**Location**: Throughout codebase (e.g., `packages/core/src/game-engine.ts:59-107`)

`Effect.gen` provides imperative-style syntax for Effect compositions:

```typescript
const playCard = (gameState: GameState, cardId: string): Effect.Effect<GameState, GameError, CardRegistry> =>
  Effect.gen(function* () {
    const cardRegistry = yield* CardRegistry
    const cardEffect = yield* cardRegistry.getEffect(cardId)

    // Errors automatically propagate
    if (cardIndex === -1) {
      return yield* Effect.fail(new CardNotFound({...}))
    }

    yield* cardEffect.validate(card, gameState)
    const finalState = yield* cardEffect.execute(intermediateState, cardId)

    return finalState
  })
```

**Pattern**: `yield*` unwraps Effects, errors propagate automatically

### 7. Composable Card Effects

**Location**: `packages/core/src/composable-effects.ts`

Higher-order functions return Effects for composition:

```typescript
// Builder function
export const dealDamageToEnemy = (damage: number, ignoreShield = false) =>
  (gameState: GameState): Effect.Effect<GameState, never> =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState

      const updatedEnemy = yield* applyDamage(gameState.enemy, damage, ignoreShield)

      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Dealt ${damage} damage`]
      }
    })

// Usage in card definition (packages/core/src/card-types/attack/index.ts:14-19)
export const AttackCards: Record<string, CardEffect> = {
  strike: {
    execute: dealDamageToEnemy(6),
    validate: validateEnergy,
    metadata: { id: 'strike', category: 'attack' }
  }
}
```

**Benefits**:
- Pure functions
- Declarative card definitions
- Easy to compose complex effects

### 8. Effect Composition Patterns

**Location**: `packages/core/src/composable-effects.ts:148-164`

Effects can be composed in various ways:

```typescript
// Sequential composition
export const composeEffects = (...effects: Array<(gameState: GameState) => Effect.Effect<GameState>>) =>
  (gameState: GameState): Effect.Effect<GameState> =>
    effects.reduce(
      (acc, effect) => Effect.flatMap(acc, effect),
      Effect.succeed(gameState)
    )

// Conditional composition
export const conditionalEffect = (
  condition: (gameState: GameState) => boolean,
  effect: (gameState: GameState) => Effect.Effect<GameState>
) =>
  (gameState: GameState): Effect.Effect<GameState> =>
    condition(gameState) ? effect(gameState) : Effect.succeed(gameState)
```

## Advanced Patterns (Experimental)

### 9. Random Service for Deterministic Testing

**Location**: `packages/core/src/experimental/random-service.ts`

Abstract random operations behind a service:

```typescript
export interface GameRandom {
  readonly nextIntBetween: (min: number, max: number) => Effect.Effect<number>
  readonly shuffle: <A>(items: readonly A[]) => Effect.Effect<readonly A[]>
}

// Production: uses real random
export const GameRandomLive: Layer.Layer<GameRandom>

// Testing: deterministic
export const GameRandomTest: Layer.Layer<GameRandom>

// Reproducible: seeded PRNG
export const GameRandomSeeded: (seed: number) => Layer.Layer<GameRandom>
```

**Benefits**:
- Deterministic tests
- Reproducible game sessions
- Proper dependency injection

### 10. Config Service for Game Balancing

**Location**: `packages/core/src/experimental/game-config.ts`

Centralize game parameters:

```typescript
export interface GameConfig {
  readonly player: {
    readonly initialHealth: number
    readonly initialEnergy: number
  }
  readonly enemy: {
    readonly basic: { health: number; damage: number }
  }
  readonly difficulty: 'easy' | 'normal' | 'hard'
}

// Different difficulty presets
export const DifficultyPresets = {
  easy: { player: { initialHealth: 75, ... }, ... },
  normal: { player: { initialHealth: 50, ... }, ... },
  hard: { player: { initialHealth: 35, ... }, ... }
}
```

**Benefits**:
- Easy balancing
- A/B testing
- Difficulty modes
- Environment-based config

### 11. Scenario Testing Framework

**Location**: `packages/core/src/experimental/scenarios.ts`

Test specific game situations:

```typescript
const scenario = new ScenarioBuilder()
  .name('Lethal Strike')
  .description('Player can win with single strike')
  .initialState(gameState)
  .playCard('strike')
  .assertVictory()
  .assertEnemyHealth(0)
  .build()

const result = yield* runScenario(scenario)
// { passed: true, failedAssertions: [], finalState: ... }
```

**Benefits**:
- Regression testing
- Bug reproduction
- Balancing validation
- Game design validation

### 12. Card Builder API

**Location**: `packages/core/src/experimental/card-builder.ts`

Fluent API for rapid prototyping:

```typescript
const customCard = new CardBuilder('berserker_strike')
  .damage(10)
  .ifPlayerHealthBelow(25, (b) => b.damage(15))
  .shield(3)
  .log('Berserker rage!')
  .build()
```

**Benefits**:
- Rapid prototyping
- Less boilerplate
- Experimentation
- Declarative syntax

## Type Signatures Explained

Effect types are: `Effect<Success, Error, Requirements>`

Examples:

```typescript
// No error, no requirements
Effect.Effect<GameState>

// Can fail with GameError, requires CardRegistry
Effect.Effect<GameState, GameError, CardRegistry>

// Can fail with CardNotFound, no requirements
Effect.Effect<Card, CardNotFound>

// Void success (side effect only), can fail, requires multiple services
Effect.Effect<void, GameError, CardRegistry | GameEngine>
```

## Data Flow

```
User Action
    ↓
GameEngine.processAction()
    ↓
Read current state (Ref.get)
    ↓
CardRegistry.getEffect()
    ↓
CardEffect.validate() → May fail with error
    ↓
CardEffect.execute() → Composable effects
    ↓
Update state (Ref.set)
    ↓
Return GameResponse
```

## Execution Model

```typescript
// Define the program
const program = Effect.gen(function* () {
  const engine = yield* GameEngine
  const response = yield* engine.processAction({ type: 'play_card', cardId: 'strike' })
  return response
})

// Provide dependencies
const runnable = Effect.provide(program, AppLayer)

// Execute
const result = await Effect.runPromise(runnable)
```

**Key Insight**: Programs are values until executed. Dependencies provided via Layers.

## Testing Patterns

### Unit Testing

```typescript
const program = Effect.gen(function* () {
  const registry = yield* CardRegistry
  const strikeEffect = yield* registry.getEffect('strike')

  const gameState = createTestGameState()
  const result = yield* strikeEffect.execute(gameState, 'strike')

  expect(result.enemy?.health).to.equal(24)
})

await Effect.runPromise(Effect.provide(program, AppLayer))
```

### Testing with Mocks

```typescript
// Mock CardRegistry
const MockCardRegistry = Layer.succeed(CardRegistry, {
  getEffect: (cardId) => Effect.succeed(mockEffect),
  // ... other methods
})

await Effect.runPromise(Effect.provide(program, MockCardRegistry))
```

### Deterministic Testing

```typescript
const testLayers = Layer.mergeAll(
  AppLayer,
  GameRandomSeeded(42),      // Reproducible random
  GameConfigTest({ ... })     // Custom config
)

await Effect.runPromise(Effect.provide(program, testLayers))
```

## Best Practices

1. **Never throw exceptions** - Use `Effect.fail()` with tagged errors
2. **Make dependencies explicit** - Declare in type signature
3. **Prefer immutability** - Use Ref only when necessary
4. **Compose small effects** - Build complex behavior from simple pieces
5. **Use schemas** - Runtime validation + type safety
6. **Layer composition** - Deterministic initialization
7. **Test with mock layers** - Substitute implementations easily
8. **Type signatures as documentation** - `Effect<A, E, R>` tells the story

## Common Patterns

### Reading from Context
```typescript
const service = yield* ServiceTag
```

### Error Handling
```typescript
const result = yield* Effect.either(effect)
if (result._tag === 'Left') {
  // Handle error: result.left
} else {
  // Handle success: result.right
}
```

### Conditional Execution
```typescript
const result = condition
  ? yield* effectA
  : yield* effectB
```

### Sequential Operations
```typescript
const a = yield* effectA
const b = yield* effectB(a)
const c = yield* effectC(b)
return c
```

### Parallel Operations
```typescript
const [a, b, c] = yield* Effect.all([effectA, effectB, effectC])
```

### Updating Ref
```typescript
yield* Ref.update(ref, (state) => ({ ...state, turn: state.turn + 1 }))
```

## Next Steps

1. Review `EFFECT_TS_IMPROVEMENTS.md` for areas to enhance
2. Explore `EXPERIMENTAL_USAGE_GUIDE.md` for advanced patterns
3. Try the experimental features in `packages/core/src/experimental/`
4. Add observability (logging/tracing) to track game flow
5. Consider Stream-based effects for animations
6. Implement STM for concurrent state if needed

## Resources

- Effect-TS Documentation: https://effect.website/
- Effect Schema: https://effect.website/docs/schema/introduction
- Effect Context: https://effect.website/docs/context-management/context
- Effect Layers: https://effect.website/docs/context-management/layers
- Effect Testing: https://effect.website/docs/testing/introduction
