import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Effect } from 'effect'
import { AppLayer } from '../src/app-layer'
import { CardRegistry } from '../src/card-effects'
import type { GameState } from '../src/schema'
import { CardNotFound } from '../src/errors'

// Test fixtures
const createTestGameState = (): GameState => ({
  id: 'test-game',
  player: {
    id: 'test-player',
    health: 50,
    maxHealth: 50,
    energy: 3,
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
    id: 'test-enemy',
    name: 'Test Enemy',
    health: 30,
    maxHealth: 30,
    shield: 0,
    intent: 'Attack for 8',
    damage: 8
  },
  phase: 'action' as const,
  turn: 1,
  isGameOver: false,
  victory: false,
  log: []
})

describe('Card Effects', () => {
  describe('Strike Card', () => {
    it('should deal 6 damage to enemy', async () => {
      const program = Effect.gen(function* () {
        const registry = yield* CardRegistry
        const strikeEffect = yield* registry.getEffect('strike')
        
        const gameState = createTestGameState()
        const result = yield* strikeEffect.execute(gameState, 'strike')
        
        expect(result.enemy?.health).to.equal(24) // 30 - 6 = 24
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })

    it('should validate energy requirements', async () => {
      const program = Effect.gen(function* () {
        const registry = yield* CardRegistry
        const strikeEffect = yield* registry.getEffect('strike')
        
        const gameState = {
          ...createTestGameState(),
          player: {
            ...createTestGameState().player,
            energy: 0 // No energy
          }
        }
        
        const card = gameState.player.hand[0]! // Strike card
        const result = yield* Effect.either(strikeEffect.validate(card, gameState))
        
        expect(result._tag).to.equal('Left')
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })
  })

  describe('Block Card', () => {
    it('should give player 5 shield', async () => {
      const program = Effect.gen(function* () {
        const registry = yield* CardRegistry
        const blockEffect = yield* registry.getEffect('block')
        
        const gameState = createTestGameState()
        const result = yield* blockEffect.execute(gameState, 'block')
        
        expect(result.player.shield).to.equal(5)
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })
  })

  describe('Card Registry', () => {
    it('should throw CardNotFound for invalid card', async () => {
      const program = Effect.gen(function* () {
        const registry = yield* CardRegistry
        const result = yield* Effect.either(registry.getEffect('invalid_card'))
        
        expect(result._tag).to.equal('Left')
        if (result._tag === 'Left') {
          expect(result.left).to.be.instanceOf(CardNotFound)
          expect(result.left.cardId).to.equal('invalid_card')
        }
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })

    it('should return effect for valid card', async () => {
      const program = Effect.gen(function* () {
        const registry = yield* CardRegistry
        const effect = yield* registry.getEffect('strike')
        
        expect(effect.metadata.id).to.equal('strike')
        expect(effect.metadata.category).to.equal('attack')
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })
  })
})