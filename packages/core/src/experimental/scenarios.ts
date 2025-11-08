import { Effect, Ref } from 'effect'
import type { GameState, GameAction, Card } from '../schema'
import { GameEngine } from '../services'

/**
 * Game Scenario Testing Framework
 *
 * Enables:
 * - Testing specific game situations
 * - Reproducing bugs
 * - Balancing validation
 * - AI training data generation
 */

export interface GameScenario {
  readonly name: string
  readonly description: string
  readonly initialState: GameState
  readonly actions: readonly GameAction[]
  readonly assertions: readonly ScenarioAssertion[]
}

export interface ScenarioAssertion {
  readonly name: string
  readonly check: (state: GameState) => boolean
  readonly expected: string
}

export interface ScenarioResult {
  readonly scenario: string
  readonly passed: boolean
  readonly failedAssertions: readonly string[]
  readonly finalState: GameState
  readonly executionLog: readonly string[]
}

/**
 * Execute a scenario and validate assertions
 */
export const runScenario = (
  scenario: GameScenario
): Effect.Effect<ScenarioResult, never, GameEngine> =>
  Effect.gen(function* () {
    const engine = yield* GameEngine
    const executionLog: string[] = []

    executionLog.push(`Starting scenario: ${scenario.name}`)
    executionLog.push(`Description: ${scenario.description}`)

    // Initialize with scenario state
    // Note: In real implementation, you'd need to expose a way to set state
    // For now, we'll assume we can create a fresh engine with custom state

    let currentState = scenario.initialState

    // Execute actions
    for (let i = 0; i < scenario.actions.length; i++) {
      const action = scenario.actions[i]!
      executionLog.push(`\nAction ${i + 1}: ${JSON.stringify(action)}`)

      try {
        const response = yield* engine.processAction(action)
        currentState = response.gameState
        executionLog.push(`Success: ${response.gameState.log[response.gameState.log.length - 1]}`)
      } catch (error) {
        executionLog.push(`Failed: ${error}`)
      }
    }

    // Run assertions
    const failedAssertions: string[] = []

    for (const assertion of scenario.assertions) {
      const result = assertion.check(currentState)
      if (!result) {
        failedAssertions.push(
          `${assertion.name}: Expected ${assertion.expected}`
        )
      } else {
        executionLog.push(`✓ ${assertion.name}`)
      }
    }

    const passed = failedAssertions.length === 0

    return {
      scenario: scenario.name,
      passed,
      failedAssertions,
      finalState: currentState,
      executionLog
    }
  })

/**
 * Run multiple scenarios and generate report
 */
export const runScenarioSuite = (
  scenarios: readonly GameScenario[]
): Effect.Effect<readonly ScenarioResult[], never, GameEngine> =>
  Effect.all(scenarios.map(runScenario))

// ============================================================================
// Scenario Builder DSL
// ============================================================================

export class ScenarioBuilder {
  private scenario: Partial<GameScenario> = {
    actions: [],
    assertions: []
  }

  name(name: string): this {
    this.scenario.name = name
    return this
  }

  description(description: string): this {
    this.scenario.description = description
    return this
  }

  initialState(state: GameState): this {
    this.scenario.initialState = state
    return this
  }

  withPlayer(modifier: (state: GameState) => GameState): this {
    if (this.scenario.initialState) {
      this.scenario.initialState = modifier(this.scenario.initialState)
    }
    return this
  }

  action(action: GameAction): this {
    this.scenario.actions = [...(this.scenario.actions || []), action]
    return this
  }

  playCard(cardId: string): this {
    return this.action({ type: 'play_card', cardId })
  }

  endTurn(): this {
    return this.action({ type: 'end_turn' })
  }

  assert(name: string, check: (state: GameState) => boolean, expected: string): this {
    this.scenario.assertions = [
      ...(this.scenario.assertions || []),
      { name, check, expected }
    ]
    return this
  }

  assertPlayerHealth(expected: number): this {
    return this.assert(
      'Player health',
      (state) => state.player.health === expected,
      `${expected} HP`
    )
  }

  assertEnemyHealth(expected: number): this {
    return this.assert(
      'Enemy health',
      (state) => state.enemy?.health === expected,
      `${expected} HP`
    )
  }

  assertVictory(): this {
    return this.assert(
      'Victory',
      (state) => state.victory === true,
      'Player wins'
    )
  }

  assertDefeat(): this {
    return this.assert(
      'Defeat',
      (state) => state.isGameOver && !state.victory,
      'Player loses'
    )
  }

  assertPlayerHasContext(context: string): this {
    return this.assert(
      `Player has ${context} context`,
      (state) => state.player.contexts.includes(context),
      `Context: ${context}`
    )
  }

  build(): GameScenario {
    if (!this.scenario.name) throw new Error('Scenario name required')
    if (!this.scenario.initialState) throw new Error('Initial state required')

    return this.scenario as GameScenario
  }
}

// ============================================================================
// Pre-built Scenarios
// ============================================================================

export const createTestCard = (
  id: string,
  name: string,
  cost: number,
  type: Card['type'] = 'attack'
): Card => ({
  id,
  name,
  cost,
  description: `Test card: ${name}`,
  type
})

export const CommonScenarios = {
  /**
   * Player has lethal damage to win the game
   */
  lethalStrike: new ScenarioBuilder()
    .name('Lethal Strike')
    .description('Player can win with a single strike')
    .initialState({
      id: 'test-1',
      turn: 1,
      phase: 'action',
      player: {
        id: 'player',
        health: 50,
        maxHealth: 50,
        energy: 3,
        maxEnergy: 3,
        shield: 0,
        hand: [createTestCard('strike', 'Strike', 1)],
        deck: [],
        discard: [],
        contexts: []
      },
      enemy: {
        id: 'enemy',
        name: 'Weak Enemy',
        health: 6, // One strike away
        maxHealth: 30,
        shield: 0,
        intent: 'Attack for 8',
        damage: 8
      },
      log: [],
      isGameOver: false,
      victory: false
    })
    .playCard('strike')
    .assertVictory()
    .assertEnemyHealth(0)
    .build(),

  /**
   * Shield blocks enemy damage
   */
  shieldDefense: new ScenarioBuilder()
    .name('Shield Defense')
    .description('Player blocks damage with shield')
    .initialState({
      id: 'test-2',
      turn: 1,
      phase: 'action',
      player: {
        id: 'player',
        health: 50,
        maxHealth: 50,
        energy: 3,
        maxEnergy: 3,
        shield: 0,
        hand: [createTestCard('block', 'Block', 1, 'defense')],
        deck: [],
        discard: [],
        contexts: []
      },
      enemy: {
        id: 'enemy',
        name: 'Attacker',
        health: 30,
        maxHealth: 30,
        shield: 0,
        intent: 'Attack for 5',
        damage: 5 // Blocked by shield
      },
      log: [],
      isGameOver: false,
      victory: false
    })
    .playCard('block')
    .endTurn() // Enemy attacks
    .assertPlayerHealth(50) // No damage taken
    .build(),

  /**
   * Context-dependent card combo
   */
  contextCombo: new ScenarioBuilder()
    .name('Context Combo')
    .description('Play context card then use dependent card')
    .initialState({
      id: 'test-3',
      turn: 1,
      phase: 'action',
      player: {
        id: 'player',
        health: 50,
        maxHealth: 50,
        energy: 5,
        maxEnergy: 5,
        shield: 0,
        hand: [
          createTestCard('init_algorithm', 'Init Algorithm', 1, 'context'),
          createTestCard('execute_algorithm', 'Execute Algorithm', 3, 'dependent')
        ],
        deck: [],
        discard: [],
        contexts: []
      },
      enemy: {
        id: 'enemy',
        name: 'Target',
        health: 30,
        maxHealth: 30,
        shield: 0,
        intent: 'Attack for 8',
        damage: 8
      },
      log: [],
      isGameOver: false,
      victory: false
    })
    .playCard('init_algorithm')
    .assertPlayerHasContext('Algorithm')
    .playCard('execute_algorithm')
    .assertEnemyHealth(10) // 30 - 20 damage
    .build()
}
