import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Effect, Layer } from 'effect'
import { CardBootstrapLayer } from '../src/card-bootstrap'
import { CardRegistryLive } from '../src/card-registry'
import { GameEffectsLive } from '../src/game-effects'
import { CardRegistry } from '../src/card-effects'

describe('CardBootstrapLayer', () => {
  const CoreServicesLayer = Layer.mergeAll(
    CardRegistryLive,
    GameEffectsLive
  )
  
  const TestLayer = Layer.provide(
    Layer.mergeAll(
      CoreServicesLayer,
      CardBootstrapLayer
    ),
    CoreServicesLayer
  )

  describe('Card Registration', () => {
    it('should register heavy_strike card effect', async () => {
      const program = Effect.gen(function* (_) {
        const registry = yield* _(CardRegistry)
        const effect = yield* _(registry.getEffect('heavy_strike'))
        
        expect(effect).to.not.be.undefined
        expect(effect.metadata.id).to.equal('heavy_strike')
        expect(effect.metadata.category).to.equal('attack')
      })
      
      await Effect.runPromise(Effect.provide(program, TestLayer))
    })

    it('should register all basic attack cards', async () => {
      const program = Effect.gen(function* (_) {
        const registry = yield* _(CardRegistry)
        
        const attackCards = ['strike', 'heavy_strike', 'quick_strike', 'precise_strike', 'wild_strike']
        
        for (const cardId of attackCards) {
          const effect = yield* _(registry.getEffect(cardId))
          expect(effect.metadata.id).to.equal(cardId)
          expect(effect.metadata.category).to.equal('attack')
        }
      })
      
      await Effect.runPromise(Effect.provide(program, TestLayer))
    })

    it('should register all defense cards', async () => {
      const program = Effect.gen(function* (_) {
        const registry = yield* _(CardRegistry)
        
        const defenseCards = ['block', 'shield_up', 'dodge']
        
        for (const cardId of defenseCards) {
          const effect = yield* _(registry.getEffect(cardId))
          expect(effect.metadata.id).to.equal(cardId)
          expect(effect.metadata.category).to.equal('defense')
        }
      })
      
      await Effect.runPromise(Effect.provide(program, TestLayer))
    })

    it('should register all context cards', async () => {
      const program = Effect.gen(function* (_) {
        const registry = yield* _(CardRegistry)
        
        const contextCards = ['init_algorithm', 'energy_surge', 'load_balancer', 'data_cache']
        
        for (const cardId of contextCards) {
          const effect = yield* _(registry.getEffect(cardId))
          expect(effect.metadata.id).to.equal(cardId)
          expect(effect.metadata.category).to.equal('context')
        }
      })
      
      await Effect.runPromise(Effect.provide(program, TestLayer))
    })

    it('should register all dependent cards', async () => {
      const program = Effect.gen(function* (_) {
        const registry = yield* _(CardRegistry)
        
        const dependentCards = ['overclock_attack', 'shield_slam', 'execute_algorithm']
        
        for (const cardId of dependentCards) {
          const effect = yield* _(registry.getEffect(cardId))
          expect(effect.metadata.id).to.equal(cardId)
          expect(effect.metadata.category).to.equal('dependent')
        }
      })
      
      await Effect.runPromise(Effect.provide(program, TestLayer))
    })

    it('should have all 15 cards registered', async () => {
      const program = Effect.gen(function* (_) {
        const registry = yield* _(CardRegistry)
        const allEffects = yield* _(registry.getAllEffects())
        
        expect(allEffects.size).to.equal(15)
        
        const expectedCards = [
          'strike', 'heavy_strike', 'quick_strike', 'precise_strike', 'wild_strike',
          'block', 'shield_up', 'dodge',
          'init_algorithm', 'energy_surge', 'load_balancer', 'data_cache',
          'overclock_attack', 'shield_slam', 'execute_algorithm'
        ]
        
        for (const cardId of expectedCards) {
          expect(allEffects.has(cardId)).to.be.true
        }
      })
      
      await Effect.runPromise(Effect.provide(program, TestLayer))
    })
  })

  describe('Card Effect Functionality', () => {
    it('should execute heavy_strike effect correctly', async () => {
      const program = Effect.gen(function* (_) {
        const registry = yield* _(CardRegistry)
        const heavyStrikeEffect = yield* _(registry.getEffect('heavy_strike'))
        
        const gameState = {
          id: 'test',
          player: {
            id: 'player',
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
          enemy: {
            id: 'enemy',
            name: 'Test Enemy',
            health: 30,
            maxHealth: 30,
            shield: 0,
            intent: 'Attack',
            damage: 8
          },
          phase: 'action' as const,
          turn: 1,
          isGameOver: false,
          victory: false,
          log: []
        }
        
        const result = yield* _(heavyStrikeEffect.execute(gameState, 'heavy_strike'))
        
        expect(result.enemy?.health).to.equal(18) // 30 - 12 = 18
        expect(result.log).to.include('Player deals 12 damage to Test Enemy')
      })
      
      await Effect.runPromise(Effect.provide(program, TestLayer))
    })
  })
})