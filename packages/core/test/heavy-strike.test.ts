import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Effect } from 'effect'
import { AppLayer } from '../src/app-layer'
import { CardRegistry } from '../src/card-effects'

describe('Heavy Strike Card Registration', () => {
  it('should register heavy_strike card effect in CardRegistry', async () => {
    const program = Effect.gen(function* () {
      const registry = yield* CardRegistry
      const effect = yield* registry.getEffect('heavy_strike')
      
      expect(effect).to.not.be.undefined
      expect(effect.metadata.id).to.equal('heavy_strike')
      expect(effect.metadata.category).to.equal('attack')
    })
    
    await Effect.runPromise(Effect.provide(program, AppLayer))
  })

  it('should list heavy_strike in available cards', async () => {
    const program = Effect.gen(function* () {
      const registry = yield* CardRegistry
      const allEffects = yield* registry.getAllEffects()
      
      expect(allEffects.has('heavy_strike')).to.be.true
      expect(allEffects.size).to.be.greaterThan(10)
    })
    
    await Effect.runPromise(Effect.provide(program, AppLayer))
  })

  it('should execute heavy_strike effect properly', async () => {
    const program = Effect.gen(function* () {
      const registry = yield* CardRegistry
      const heavyStrikeEffect = yield* registry.getEffect('heavy_strike')
      
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
      
      const result = yield* heavyStrikeEffect.execute(gameState, 'heavy_strike')
      
      expect(result.enemy?.health).to.equal(18) // 30 - 12 = 18
      expect(result.log).to.include('Player deals 12 damage to Test Enemy')
    })
    
    await Effect.runPromise(Effect.provide(program, AppLayer))
  })
})