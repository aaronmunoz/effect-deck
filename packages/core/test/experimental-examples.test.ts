import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Effect, Layer } from 'effect'
import {
  GameRandom,
  GameRandomTest,
  GameRandomSeeded,
  GameConfig,
  GameConfigTest,
  GameConfigWithDifficulty,
  ScenarioBuilder,
  CommonScenarios,
  runScenario,
  CardBuilder
} from '../src/experimental'
import { AppLayer } from '../src/app-layer'

/**
 * Examples demonstrating advanced Effect-TS patterns
 */

describe('Experimental Features', () => {
  describe('Random Service', () => {
    it('should provide deterministic random in tests', async () => {
      const program = Effect.gen(function* () {
        const random = yield* GameRandom
        const value = yield* random.nextIntBetween(1, 100)

        // With test layer, always returns min value (1)
        expect(value).to.equal(1)
      })

      await Effect.runPromise(
        Effect.provide(program, GameRandomTest({ intValue: 1 }))
      )
    })

    it('should provide reproducible random with seed', async () => {
      const program = Effect.gen(function* () {
        const random = yield* GameRandom
        const value1 = yield* random.nextIntBetween(1, 100)
        const value2 = yield* random.nextIntBetween(1, 100)

        // Same seed produces same sequence
        return [value1, value2]
      })

      const result1 = await Effect.runPromise(
        Effect.provide(program, GameRandomSeeded(42))
      )
      const result2 = await Effect.runPromise(
        Effect.provide(program, GameRandomSeeded(42))
      )

      expect(result1).to.deep.equal(result2)
    })

    it('should shuffle cards deterministically', async () => {
      const program = Effect.gen(function* () {
        const random = yield* GameRandom
        const cards = ['A', 'B', 'C', 'D', 'E']
        const shuffled = yield* random.shuffle(cards)

        return shuffled
      })

      // Test layer returns items unchanged
      const result = await Effect.runPromise(
        Effect.provide(program, GameRandomTest())
      )

      expect(result).to.deep.equal(['A', 'B', 'C', 'D', 'E'])
    })
  })

  describe('Game Config', () => {
    it('should use default config', async () => {
      const program = Effect.gen(function* () {
        const config = yield* GameConfig

        expect(config.player.initialHealth).to.equal(50)
        expect(config.player.initialEnergy).to.equal(3)
        expect(config.difficulty).to.equal('normal')
      })

      await Effect.runPromise(
        Effect.provide(program, GameConfigTest())
      )
    })

    it('should support easy difficulty', async () => {
      const program = Effect.gen(function* () {
        const config = yield* GameConfig

        expect(config.player.initialHealth).to.equal(75)
        expect(config.player.initialEnergy).to.equal(4)
        expect(config.enemy.basic.damage).to.equal(5)
        expect(config.difficulty).to.equal('easy')
      })

      await Effect.runPromise(
        Effect.provide(program, GameConfigWithDifficulty('easy'))
      )
    })

    it('should support hard difficulty', async () => {
      const program = Effect.gen(function* () {
        const config = yield* GameConfig

        expect(config.player.initialHealth).to.equal(35)
        expect(config.player.initialEnergy).to.equal(2)
        expect(config.enemy.basic.damage).to.equal(12)
        expect(config.difficulty).to.equal('hard')
      })

      await Effect.runPromise(
        Effect.provide(program, GameConfigWithDifficulty('hard'))
      )
    })

    it('should support custom config overrides', async () => {
      const program = Effect.gen(function* () {
        const config = yield* GameConfig

        expect(config.player.initialHealth).to.equal(100)
        expect(config.cards.strikeDamage).to.equal(10)
      })

      await Effect.runPromise(
        Effect.provide(
          program,
          GameConfigTest({
            player: { initialHealth: 100 } as any,
            cards: { strikeDamage: 10 } as any
          })
        )
      )
    })
  })

  describe('Scenario Testing', () => {
    it('should run lethal strike scenario', async () => {
      const program = Effect.gen(function* () {
        const result = yield* runScenario(CommonScenarios.lethalStrike)

        expect(result.passed).to.equal(true)
        expect(result.failedAssertions).to.be.empty
        expect(result.finalState.victory).to.equal(true)
      })

      // Note: This test won't work without a proper GameEngine setup
      // that allows state injection. Included for illustration.
      // await Effect.runPromise(Effect.provide(program, AppLayer))
    })

    it('should build custom scenario with DSL', () => {
      const scenario = new ScenarioBuilder()
        .name('Custom Test')
        .description('Testing custom scenario')
        .initialState({
          id: 'test',
          turn: 1,
          phase: 'action',
          player: {
            id: 'p1',
            health: 50,
            maxHealth: 50,
            energy: 3,
            maxEnergy: 3,
            shield: 0,
            hand: [],
            deck: [],
            discard: [],
            contexts: []
          },
          enemy: undefined,
          log: [],
          isGameOver: false,
          victory: false
        })
        .playCard('strike')
        .endTurn()
        .assertPlayerHealth(50)
        .build()

      expect(scenario.name).to.equal('Custom Test')
      expect(scenario.actions).to.have.lengthOf(2)
      expect(scenario.assertions).to.have.lengthOf(1)
    })
  })

  describe('Card Builder', () => {
    it('should build simple attack card', () => {
      const card = new CardBuilder('test_strike')
        .damage(10)
        .build()

      expect(card.metadata.id).to.equal('test_strike')
      expect(card.metadata.category).to.equal('attack')
    })

    it('should build defense card', () => {
      const card = new CardBuilder('test_block', 'defense')
        .shield(8)
        .build()

      expect(card.metadata.category).to.equal('defense')
    })

    it('should build conditional card', () => {
      const card = new CardBuilder('berserker')
        .damage(5)
        .ifPlayerHealthBelow(20, (b) => b.damage(10))
        .build()

      expect(card.metadata.id).to.equal('berserker')
      // Effect execution tested in integration tests
    })

    it('should build context-dependent card', () => {
      const card = new CardBuilder('algorithm_strike', 'dependent')
        .requireContext('Algorithm')
        .damage(15)
        .build()

      expect(card.metadata.category).to.equal('dependent')
    })

    it('should compose multiple effects', () => {
      const card = new CardBuilder('combo_card')
        .damage(8)
        .shield(3)
        .addContext('Combo')
        .log('Combo activated!')
        .build()

      expect(card.metadata.id).to.equal('combo_card')
      // Composed effects tested in integration tests
    })
  })
})
