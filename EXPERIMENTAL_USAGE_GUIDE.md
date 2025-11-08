# Experimental Features Usage Guide

This guide demonstrates how to use the advanced Effect-TS features for game state experimentation.

## Table of Contents

1. [Random Service](#random-service)
2. [Game Configuration](#game-configuration)
3. [Scenario Testing](#scenario-testing)
4. [Card Builder API](#card-builder-api)
5. [Combining Features](#combining-features)

## Random Service

### Basic Usage

```typescript
import { Effect } from 'effect'
import { GameRandom, GameRandomLive } from './src/experimental'

const program = Effect.gen(function* () {
  const random = yield* GameRandom

  // Get random number between 1 and 6 (dice roll)
  const roll = yield* random.nextIntBetween(1, 6)

  // Random boolean (coin flip)
  const heads = yield* random.nextBoolean()

  // Shuffle deck
  const cards = ['A', 'B', 'C', 'D', 'E']
  const shuffled = yield* random.shuffle(cards)

  return { roll, heads, shuffled }
})

// Run with production random
Effect.runPromise(Effect.provide(program, GameRandomLive))
```

### Deterministic Testing

```typescript
import { GameRandomTest, GameRandomSeeded } from './src/experimental'

// Test with fixed values
const testProgram = Effect.gen(function* () {
  const random = yield* GameRandom
  const value = yield* random.nextIntBetween(1, 100)

  // Always returns 42 with this test layer
  console.log(value) // 42
})

Effect.runPromise(
  Effect.provide(testProgram, GameRandomTest({ intValue: 42 }))
)

// Test with seeded random (reproducible)
const seededProgram = Effect.gen(function* () {
  const random = yield* GameRandom
  const values = yield* Effect.all([
    random.nextIntBetween(1, 100),
    random.nextIntBetween(1, 100),
    random.nextIntBetween(1, 100)
  ])

  return values // Same sequence every time with same seed
})

Effect.runPromise(
  Effect.provide(seededProgram, GameRandomSeeded(12345))
)
```

### Updating Existing Code

Replace `Math.random()` with the service:

```typescript
// Before:
const damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage

// After:
const dealRandomDamage = (minDamage: number, maxDamage: number) =>
  Effect.gen(function* () {
    const random = yield* GameRandom
    const damage = yield* random.nextIntBetween(minDamage, maxDamage)
    // ... rest of logic
  })
```

## Game Configuration

### Using Config Presets

```typescript
import { Effect } from 'effect'
import { GameConfig, GameConfigWithDifficulty } from './src/experimental'

// Easy mode
const easyGame = Effect.gen(function* () {
  const config = yield* GameConfig

  console.log(`Player HP: ${config.player.initialHealth}`) // 75
  console.log(`Enemy Damage: ${config.enemy.basic.damage}`) // 5
})

Effect.runPromise(
  Effect.provide(easyGame, GameConfigWithDifficulty('easy'))
)

// Hard mode
const hardGame = Effect.gen(function* () {
  const config = yield* GameConfig

  console.log(`Player HP: ${config.player.initialHealth}`) // 35
  console.log(`Enemy Damage: ${config.enemy.basic.damage}`) // 12
})

Effect.runPromise(
  Effect.provide(hardGame, GameConfigWithDifficulty('hard'))
)
```

### Custom Configuration

```typescript
import { GameConfigTest } from './src/experimental'

const customGame = Effect.gen(function* () {
  const config = yield* GameConfig

  // Use custom values for playtesting
  const player = createPlayer({
    health: config.player.initialHealth,
    energy: config.player.initialEnergy
  })
})

Effect.runPromise(
  Effect.provide(
    customGame,
    GameConfigTest({
      player: {
        initialHealth: 100,
        initialEnergy: 5,
        startingHandSize: 7
      } as any,
      cards: {
        strikeDamage: 12,
        blockShield: 10
      } as any
    })
  )
)
```

### Environment Variables

```bash
# Set environment variables
export GAME_DIFFICULTY=hard
export PLAYER_HEALTH=60
export ENEMY_DAMAGE=10

# Use GameConfigLive to read from environment
```

```typescript
import { GameConfigLive } from './src/experimental'

Effect.runPromise(
  Effect.provide(program, GameConfigLive)
)
```

## Scenario Testing

### Running Pre-built Scenarios

```typescript
import { runScenario, CommonScenarios } from './src/experimental'

const testLethal = Effect.gen(function* () {
  const result = yield* runScenario(CommonScenarios.lethalStrike)

  console.log(`Scenario: ${result.scenario}`)
  console.log(`Passed: ${result.passed}`)
  console.log(`Execution log:`)
  result.executionLog.forEach(log => console.log(`  ${log}`))

  if (!result.passed) {
    console.log(`Failed assertions:`)
    result.failedAssertions.forEach(a => console.log(`  - ${a}`))
  }
})

Effect.runPromise(Effect.provide(testLethal, AppLayer))
```

### Building Custom Scenarios

```typescript
import { ScenarioBuilder } from './src/experimental'

// Define initial state
const initialState: GameState = {
  id: 'scenario-1',
  turn: 1,
  phase: 'action',
  player: {
    id: 'player',
    health: 20, // Low health
    maxHealth: 50,
    energy: 2,
    maxEnergy: 3,
    shield: 0,
    hand: [
      { id: 'strike', name: 'Strike', cost: 1, description: 'Deal 6 damage', type: 'attack' },
      { id: 'block', name: 'Block', cost: 1, description: 'Gain 5 shield', type: 'defense' }
    ],
    deck: [],
    discard: [],
    contexts: []
  },
  enemy: {
    id: 'enemy',
    name: 'Boss',
    health: 50,
    maxHealth: 50,
    shield: 0,
    intent: 'Attack for 15',
    damage: 15
  },
  log: [],
  isGameOver: false,
  victory: false
}

// Build scenario with fluent API
const survivalScenario = new ScenarioBuilder()
  .name('Survival Test')
  .description('Can player survive boss attack?')
  .initialState(initialState)
  .playCard('block')  // Block first
  .endTurn()          // Enemy attacks
  .assertPlayerHealth(10) // Should survive with 10 HP (20 - 15 + 5 shield)
  .build()

// Run it
const testSurvival = Effect.gen(function* () {
  const result = yield* runScenario(survivalScenario)
  return result
})

Effect.runPromise(Effect.provide(testSurvival, AppLayer))
```

### Scenario Suite

```typescript
import { runScenarioSuite } from './src/experimental'

const scenarios = [
  CommonScenarios.lethalStrike,
  CommonScenarios.shieldDefense,
  CommonScenarios.contextCombo,
  survivalScenario
]

const runAllTests = Effect.gen(function* () {
  const results = yield* runScenarioSuite(scenarios)

  const passCount = results.filter(r => r.passed).length
  const failCount = results.filter(r => !r.passed).length

  console.log(`\n========== Test Results ==========`)
  console.log(`Total: ${results.length}`)
  console.log(`Passed: ${passCount}`)
  console.log(`Failed: ${failCount}`)

  results.forEach(result => {
    const status = result.passed ? '✓' : '✗'
    console.log(`\n${status} ${result.scenario}`)

    if (!result.passed) {
      result.failedAssertions.forEach(a => {
        console.log(`  ✗ ${a}`)
      })
    }
  })
})

Effect.runPromise(Effect.provide(runAllTests, AppLayer))
```

## Card Builder API

### Simple Cards

```typescript
import { CardBuilder } from './src/experimental'

// Basic attack
const heavyBlow = new CardBuilder('heavy_blow')
  .damage(15)
  .build()

// Basic defense
const reinforceShield = new CardBuilder('reinforce_shield', 'defense')
  .shield(10)
  .build()

// Context card
const enableAlgorithm = new CardBuilder('enable_algorithm', 'context')
  .addContext('Algorithm')
  .build()
```

### Conditional Effects

```typescript
// Damage scales with player health
const desperateStrike = new CardBuilder('desperate_strike')
  .damage(8)
  .ifPlayerHealthBelow(25, (b) => b.damage(12)) // Extra damage when desperate
  .log((state) =>
    state.player.health < 25
      ? 'Desperate strike! Dealing massive damage!'
      : 'Strike!'
  )
  .build()

// Execute finisher on low-health enemies
const execute = new CardBuilder('execute')
  .damage(5)
  .ifEnemyHealthBelow(20, (b) => b.damage(30)) // Massive damage to finish
  .build()

// Context-dependent bonus
const algorithmBoost = new CardBuilder('algorithm_boost')
  .damage(10)
  .ifPlayerHasContext('Algorithm', (b) => b.damage(10))
  .build()
```

### Complex Combos

```typescript
// Multi-effect card
const vampiricSlash = new CardBuilder('vampiric_slash')
  .damage(12)
  .shield(4)
  .addContext('Vampiric')
  .log('Vampiric slash! Draining enemy life force!')
  .build()

// Nested conditionals
const adaptiveStrike = new CardBuilder('adaptive_strike')
  .damage(6)
  .ifPlayerHealthBelow(30, (b) =>
    b.shield(5).log('Defensive stance!')
  )
  .ifEnemyHealthBelow(15, (b) =>
    b.damage(10).log('Going for the kill!')
  )
  .build()
```

### Custom Logic

```typescript
const customCard = new CardBuilder('custom_logic')
  .custom((state) =>
    Effect.gen(function* () {
      // Custom effect logic
      const bonus = Math.floor(state.player.shield / 2)

      return {
        ...state,
        enemy: state.enemy ? {
          ...state.enemy,
          health: state.enemy.health - (10 + bonus)
        } : state.enemy,
        log: [...state.log, `Dealt ${10 + bonus} damage!`]
      }
    })
  )
  .build()
```

### Registering Custom Cards

```typescript
import { CardRegistry } from '../src/card-effects'

const registerCustomCards = Effect.gen(function* () {
  const registry = yield* CardRegistry

  // Register custom cards
  yield* registry.registerEffect('desperate_strike', desperateStrike)
  yield* registry.registerEffect('execute', execute)
  yield* registry.registerEffect('vampiric_slash', vampiricSlash)
})

// Use in app initialization
const CustomCardLayer = Layer.effectDiscard(registerCustomCards)

const AppWithCustomCards = Layer.provide(
  Layer.mergeAll(AppLayer, CustomCardLayer),
  AppLayer
)
```

## Combining Features

### Complete Testing Setup

```typescript
import { Effect, Layer } from 'effect'
import {
  GameRandom,
  GameRandomSeeded,
  GameConfig,
  GameConfigTest,
  ScenarioBuilder,
  runScenario,
  CardBuilder
} from './src/experimental'
import { AppLayer } from './src/app-layer'

// 1. Create custom card
const testCard = new CardBuilder('test_card')
  .damage(20)
  .shield(5)
  .build()

// 2. Define test configuration
const testConfig = GameConfigTest({
  player: {
    initialHealth: 100,
    initialEnergy: 10
  } as any
})

// 3. Define deterministic random
const testRandom = GameRandomSeeded(42)

// 4. Create scenario
const testScenario = new ScenarioBuilder()
  .name('Integration Test')
  .description('Test custom card with config and random')
  .initialState({
    // ... state setup
  } as any)
  .playCard('test_card')
  .assertVictory()
  .build()

// 5. Run test with all layers
const fullTest = Effect.gen(function* () {
  // Register custom card
  const registry = yield* CardRegistry
  yield* registry.registerEffect('test_card', testCard)

  // Run scenario
  const result = yield* runScenario(testScenario)

  return result
})

// Provide all dependencies
const testLayers = Layer.mergeAll(
  AppLayer,
  testConfig,
  testRandom
)

Effect.runPromise(Effect.provide(fullTest, testLayers))
```

### Balancing Workflow

```typescript
// Iteratively test different configurations
const difficultyLevels = ['easy', 'normal', 'hard'] as const

for (const difficulty of difficultyLevels) {
  const balanceTest = Effect.gen(function* () {
    const config = yield* GameConfig

    console.log(`\n===== Testing ${difficulty} difficulty =====`)
    console.log(`Player HP: ${config.player.initialHealth}`)
    console.log(`Enemy Damage: ${config.enemy.basic.damage}`)

    // Run scenarios
    const results = yield* runScenarioSuite([
      CommonScenarios.lethalStrike,
      CommonScenarios.shieldDefense
    ])

    const winRate = results.filter(r => r.passed).length / results.length
    console.log(`Win rate: ${(winRate * 100).toFixed(1)}%`)
  })

  await Effect.runPromise(
    Effect.provide(balanceTest, GameConfigWithDifficulty(difficulty))
  )
}
```

### Reproducible Bug Reports

```typescript
// Generate reproducible bug report
const bugReport = Effect.gen(function* () {
  const sessionId = 'bug-12345'
  const seed = 42

  console.log(`Bug Report: ${sessionId}`)
  console.log(`Random Seed: ${seed}`)

  // Scenario that reproduces bug
  const bugScenario = new ScenarioBuilder()
    .name('Bug Reproduction')
    .description('Shield not blocking damage correctly')
    .initialState({
      // ... exact state when bug occurred
    } as any)
    .playCard('block')
    .endTurn()
    .assertPlayerHealth(50) // Expected
    .build()

  const result = yield* runScenario(bugScenario)

  if (!result.passed) {
    console.log('BUG REPRODUCED!')
    console.log(result.executionLog.join('\n'))
  }
})

Effect.runPromise(
  Effect.provide(
    bugReport,
    Layer.mergeAll(AppLayer, GameRandomSeeded(42))
  )
)
```

## Next Steps

1. Integrate Random service into composable-effects.ts
2. Use Config service in game-engine.ts initialization
3. Add scenario tests to your test suite
4. Experiment with Card Builder for rapid prototyping
5. Add observability (logging/tracing) to track game flow
6. Consider Stream-based animations for visual effects

For more details, see `EFFECT_TS_IMPROVEMENTS.md`.
