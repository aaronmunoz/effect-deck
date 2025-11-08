# Effect-TS Improvement Opportunities

## Current Strengths

The current implementation demonstrates solid Effect-TS fundamentals:
- ✅ Schema-first design with runtime validation
- ✅ Context-based dependency injection
- ✅ Layer composition for service initialization
- ✅ Tagged errors (no thrown exceptions)
- ✅ Ref for mutable state management
- ✅ Effect.gen for readable async code
- ✅ Composable card effects

## Areas for Improvement

### 1. **Observability & Tracing** (Missing)

**Current State**: No observability infrastructure
**Improvement**: Add tracing, spans, and metrics

```typescript
// packages/core/src/game-engine.ts
const playCard = (gameState: GameState, cardId: string) =>
  Effect.gen(function* () {
    // ... existing code
  }).pipe(
    Effect.withSpan("playCard", { attributes: { cardId } }),
    Effect.tap((state) =>
      Effect.logInfo(`Card played: ${cardId}, Enemy HP: ${state.enemy?.health}`)
    )
  )
```

**Benefits**:
- Track card play performance
- Debug game flow issues
- Monitor game balance metrics
- Production telemetry

### 2. **Random Service for Deterministic Testing** (Missing)

**Current State**: `Math.random()` is not testable
**Location**: `packages/core/src/composable-effects.ts:38`

```typescript
// Current (non-deterministic):
const damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage
```

**Improvement**: Use Effect Random service

```typescript
// packages/core/src/random-service.ts
import { Context, Effect, Random } from 'effect'

export interface GameRandom {
  readonly nextIntBetween: (min: number, max: number) => Effect.Effect<number>
}

export const GameRandom = Context.GenericTag<GameRandom>('GameRandom')

// Production implementation
export const GameRandomLive = Layer.succeed(GameRandom, {
  nextIntBetween: (min, max) => Random.nextIntBetween(min, max)
})

// Test implementation (seeded/deterministic)
export const GameRandomTest = (seed: number) => Layer.succeed(GameRandom, {
  nextIntBetween: (min, max) => Effect.succeed(min) // or use seeded PRNG
})
```

**Usage**:
```typescript
export const dealRandomDamageToEnemy = (minDamage: number, maxDamage: number) =>
  (gameState: GameState): Effect.Effect<GameState, never, GameRandom> =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState

      const random = yield* GameRandom
      const damage = yield* random.nextIntBetween(minDamage, maxDamage)
      // ... rest of logic
    })
```

**Benefits**:
- Deterministic testing
- Reproducible game sessions
- Proper dependency injection

### 3. **Config Service for Game Parameters** (Missing)

**Current State**: Magic numbers hardcoded throughout

```typescript
// Hardcoded:
health: 50,
maxHealth: 50,
energy: 3,
```

**Improvement**: Config service

```typescript
// packages/core/src/config.ts
import { Config, Layer } from 'effect'

export interface GameConfig {
  readonly player: {
    readonly initialHealth: number
    readonly initialEnergy: number
    readonly cardsPerTurn: number
  }
  readonly enemy: {
    readonly basicEnemyHealth: number
    readonly basicEnemyDamage: number
  }
}

export const GameConfig = Context.GenericTag<GameConfig>('GameConfig')

export const GameConfigLive = Layer.effect(
  GameConfig,
  Effect.gen(function* () {
    const playerHealth = yield* Config.number("PLAYER_HEALTH").pipe(
      Config.withDefault(50)
    )
    const playerEnergy = yield* Config.number("PLAYER_ENERGY").pipe(
      Config.withDefault(3)
    )
    // ... more configs

    return {
      player: {
        initialHealth: playerHealth,
        initialEnergy: playerEnergy,
        cardsPerTurn: 2
      },
      enemy: {
        basicEnemyHealth: 30,
        basicEnemyDamage: 8
      }
    }
  })
)
```

**Benefits**:
- Easy game balancing
- Different difficulty modes
- Environment-based configuration
- Testability with different parameters

### 4. **Stream-Based Card Animations** (Missing)

**Current State**: Card effects are single operations
**Improvement**: Use Effect.Stream for multi-step animations

```typescript
// packages/core/src/animation-stream.ts
import { Stream, Effect, Schedule } from 'effect'

export interface AnimationFrame {
  readonly type: 'damage' | 'shield' | 'heal' | 'context'
  readonly value: number | string
  readonly timestamp: number
}

export const createDamageAnimation = (
  damage: number
): Stream.Stream<AnimationFrame> =>
  Stream.make(
    { type: 'damage', value: damage, timestamp: Date.now() }
  )

export const createComboAnimation = (
  effects: readonly Effect.Effect<GameState>[]
): Stream.Stream<GameState> =>
  Stream.fromIterable(effects).pipe(
    Stream.mapEffect((effect) => effect),
    Stream.schedule(Schedule.spaced("100 millis")) // Delay between effects
  )
```

**Benefits**:
- Smooth visual feedback
- Complex multi-step effects
- Backpressure handling
- Async rendering

### 5. **Effect.pipe for Better Composition** (Underutilized)

**Current State**: Mostly using `Effect.gen`
**Improvement**: Mix gen with pipe for cleaner data transformations

```typescript
// Instead of:
const playCard = (gameState: GameState, cardId: string) =>
  Effect.gen(function* () {
    const cardRegistry = yield* CardRegistry
    const cardEffect = yield* cardRegistry.getEffect(cardId)
    yield* cardEffect.validate(card, gameState)
    const finalState = yield* cardEffect.execute(intermediateState, cardId)
    return finalState
  })

// Consider:
const playCard = (gameState: GameState, cardId: string) =>
  CardRegistry.pipe(
    Effect.flatMap((registry) => registry.getEffect(cardId)),
    Effect.tap((effect) => effect.validate(card, gameState)),
    Effect.flatMap((effect) => effect.execute(intermediateState, cardId)),
    Effect.withSpan("playCard", { attributes: { cardId } })
  )
```

**Benefits**:
- More functional style
- Easier to add cross-cutting concerns (tracing, logging)
- Better type inference in some cases

### 6. **STM for Concurrent State** (Missing)

**Current State**: Using Ref (single-threaded state)
**Improvement**: Use STM for transactional state updates

```typescript
// packages/core/src/game-state-stm.ts
import { STM, TRef } from 'effect'

export const playCardSTM = (
  stateRef: TRef.TRef<GameState>,
  cardId: string
) =>
  STM.gen(function* () {
    const currentState = yield* TRef.get(stateRef)

    // Validate and update atomically
    const newState = yield* validateAndExecuteCard(currentState, cardId)

    yield* TRef.set(stateRef, newState)

    return newState
  })
```

**Benefits**:
- Atomic multi-ref updates
- Composable transactions
- Automatic retry on conflict
- Future-proof for multiplayer

### 7. **Resource Management with Scope** (Missing)

**Current State**: No resource cleanup patterns
**Improvement**: Use Scope for managed resources

```typescript
// packages/core/src/game-session.ts
export const createGameSession = Effect.gen(function* () {
  yield* Effect.acquireRelease(
    Effect.sync(() => {
      console.log("Game session started")
      return { id: "session-1" }
    }),
    (session) => Effect.sync(() => {
      console.log("Game session ended, saving state...")
      // Save game state, cleanup resources
    })
  )
})
```

**Benefits**:
- Guaranteed cleanup
- Resource safety
- Exception handling

### 8. **Schedule for Retry Logic** (Missing)

**Current State**: No retry patterns
**Improvement**: Add retry for network/persistence

```typescript
// packages/core/src/persistence.ts
import { Schedule } from 'effect'

export const saveGameState = (state: GameState) =>
  Effect.gen(function* () {
    // Simulated save to database
    yield* Effect.tryPromise(() =>
      fetch('/api/save', {
        method: 'POST',
        body: JSON.stringify(state)
      })
    )
  }).pipe(
    Effect.retry(
      Schedule.exponential("100 millis").pipe(
        Schedule.compose(Schedule.recurs(3))
      )
    ),
    Effect.timeout("5 seconds")
  )
```

**Benefits**:
- Resilient to transient failures
- Configurable backoff
- Timeout protection

### 9. **Effect Test Utilities** (Partially Missing)

**Current State**: Using Mocha/Chai, manually running Effects
**Improvement**: Use `@effect/vitest` or Effect test utilities

```typescript
// packages/core/test/card-effects.effect.test.ts
import { Effect, Layer, TestContext, TestClock } from 'effect'
import { describe, test, expect } from '@effect/vitest'

describe("Card Effects", () => {
  test.effect("strike should deal 6 damage", () =>
    Effect.gen(function* () {
      const registry = yield* CardRegistry
      const strikeEffect = yield* registry.getEffect('strike')

      const gameState = createTestGameState()
      const result = yield* strikeEffect.execute(gameState, 'strike')

      expect(result.enemy?.health).toBe(24)
    }).pipe(Effect.provide(AppLayer))
  )

  test.effect("time-based effects with TestClock", () =>
    Effect.gen(function* () {
      const clock = yield* TestClock

      // Simulate time passing for DoT effects
      yield* TestClock.adjust("1 second")

      // Assert effect triggered
    })
  )
})
```

**Benefits**:
- Better Effect integration
- Virtual time for testing
- Cleaner test syntax

### 10. **Option/Either Utilities** (Underutilized)

**Current State**: Manual null checks
**Improvement**: Use Option type

```typescript
// Instead of:
if (!gameState.enemy) return gameState

// Use:
import { Option } from 'effect'

const enemy = Option.fromNullable(gameState.enemy)
return Option.match(enemy, {
  onNone: () => gameState,
  onSome: (enemy) => {
    // Apply effect
  }
})
```

## Experimental Game States Framework

### GameState Scenarios

```typescript
// packages/core/test/scenarios.ts
import { Effect, Layer } from 'effect'

export interface GameScenario {
  readonly name: string
  readonly initialState: GameState
  readonly expectedActions: readonly GameAction[]
  readonly expectedOutcome: (state: GameState) => boolean
}

export const Scenarios = {
  // Low health, high damage scenario
  desperateStrike: {
    name: "Desperate Strike",
    initialState: {
      ...createInitialGameState(),
      player: {
        ...createInitialPlayer(),
        health: 5, // Almost dead
        energy: 1
      },
      enemy: {
        ...createBasicEnemy(),
        health: 6 // One strike away
      }
    },
    expectedActions: [{ type: 'play_card', cardId: 'strike' }],
    expectedOutcome: (state) => state.victory === true
  },

  // Shield-focused scenario
  defensivePlay: {
    name: "Defensive Play",
    initialState: {
      ...createInitialGameState(),
      player: {
        ...createInitialPlayer(),
        hand: [
          { id: 'block', name: 'Block', cost: 1, description: 'Gain 5 shield', type: 'defense' },
          { id: 'shield_slam', name: 'Shield Slam', cost: 1, description: 'Deal shield damage', type: 'dependent' }
        ]
      }
    },
    expectedActions: [
      { type: 'play_card', cardId: 'block' },
      { type: 'play_card', cardId: 'shield_slam' }
    ],
    expectedOutcome: (state) => state.enemy!.health < 30
  }
}

// Scenario runner
export const runScenario = (scenario: GameScenario) =>
  Effect.gen(function* () {
    const engine = yield* GameEngine

    // Start with scenario state
    yield* Ref.set(gameStateRef, scenario.initialState)

    // Execute expected actions
    for (const action of scenario.expectedActions) {
      yield* engine.processAction(action)
    }

    // Verify outcome
    const finalState = yield* engine.getGameState()
    const passed = scenario.expectedOutcome(finalState)

    yield* Effect.log(`Scenario "${scenario.name}": ${passed ? 'PASSED' : 'FAILED'}`)

    return { scenario: scenario.name, passed, finalState }
  })
```

### Card Effect Experimentation Framework

```typescript
// packages/core/src/experimental/card-builder.ts
export class CardEffectBuilder {
  private effects: Array<(state: GameState) => Effect.Effect<GameState>> = []

  damage(amount: number, ignoreShield = false): this {
    this.effects.push(dealDamageToEnemy(amount, ignoreShield))
    return this
  }

  shield(amount: number): this {
    this.effects.push(gainPlayerShield(amount))
    return this
  }

  context(name: string): this {
    this.effects.push(addPlayerContext(name))
    return this
  }

  conditional(
    predicate: (state: GameState) => boolean,
    thenEffect: (state: GameState) => Effect.Effect<GameState>
  ): this {
    this.effects.push(conditionalEffect(predicate, thenEffect))
    return this
  }

  build(): CardEffect {
    return {
      execute: composeEffects(...this.effects),
      validate: validateEnergy,
      metadata: { id: 'experimental', category: 'attack' }
    }
  }
}

// Usage:
const experimentalCard = new CardEffectBuilder()
  .damage(10)
  .shield(5)
  .conditional(
    (state) => state.enemy!.health < 10,
    dealDamageToEnemy(20) // Execute if enemy low health
  )
  .build()
```

### Live Game State Inspector

```typescript
// packages/core/src/experimental/game-inspector.ts
import { Effect, Stream, Schedule } from 'effect'

export interface GameStateSnapshot {
  readonly timestamp: number
  readonly state: GameState
  readonly metadata: {
    readonly turn: number
    readonly playerHP: number
    readonly enemyHP: number
    readonly cardsPlayed: number
  }
}

export const createGameInspector = () =>
  Effect.gen(function* () {
    const engine = yield* GameEngine

    // Stream of game state snapshots
    const stateStream = Stream.repeatEffect(
      Effect.gen(function* () {
        const state = yield* engine.getGameState()
        return {
          timestamp: Date.now(),
          state,
          metadata: {
            turn: state.turn,
            playerHP: state.player.health,
            enemyHP: state.enemy?.health ?? 0,
            cardsPlayed: state.player.discard.length
          }
        }
      })
    ).pipe(
      Stream.schedule(Schedule.spaced("1 second"))
    )

    return {
      snapshots: stateStream,
      query: (predicate: (snap: GameStateSnapshot) => boolean) =>
        Stream.filter(stateStream, predicate)
    }
  })

// Usage: Monitor when player health drops below 20
const lowHealthAlert = Stream.filter(
  inspector.snapshots,
  (snap) => snap.metadata.playerHP < 20
).pipe(
  Stream.tap((snap) => Effect.log(`WARNING: Low health at turn ${snap.metadata.turn}`))
)
```

## Implementation Priority

1. **High Impact, Low Effort**:
   - Add tracing/logging (Effect.logInfo, withSpan)
   - Use Effect.pipe more consistently
   - Add Config service

2. **High Impact, Medium Effort**:
   - Random service for deterministic testing
   - Scenario testing framework
   - Card builder API

3. **Medium Impact, High Effort**:
   - Stream-based animations
   - STM for concurrent state
   - Full observability infrastructure

4. **Future Enhancements**:
   - Effect test utilities migration
   - Resource management with Scope
   - Production telemetry

## Next Steps

1. Start with observability (logging/tracing)
2. Add Random service for better testing
3. Create scenario framework for game state experimentation
4. Build card effect experimentation tools
5. Gradually introduce more advanced Effect patterns
