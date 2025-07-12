import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Effect } from 'effect'
import { AppLayer } from '../src/app-layer'
import { CardRegistry } from '../src/card-effects'
import { GameEngine } from '../src/services'

describe('AppLayer', () => {
  describe('Initialization', () => {
    it('should initialize successfully without errors', async () => {
      const program = Effect.gen(function* () {
        // Simple access to verify layer initialization
        const registry = yield* CardRegistry
        const engine = yield* GameEngine
        
        expect(registry).to.not.be.undefined
        expect(engine).to.not.be.undefined
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })

    it('should have CardRegistry fully populated after initialization', async () => {
      const program = Effect.gen(function* () {
        const registry = yield* CardRegistry
        const allEffects = yield* registry.getAllEffects()
        
        // Verify all 15 cards are registered
        expect(allEffects.size).to.equal(15)
        
        // Verify heavy_strike specifically
        expect(allEffects.has('heavy_strike')).to.be.true
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })

    it('should allow GameEngine to access card effects immediately', async () => {
      const program = Effect.gen(function* () {
        const engine = yield* GameEngine
        const newGame = yield* engine.startNewGame()
        
        expect(newGame.gameState).to.not.be.undefined
        expect(newGame.gameState.player.hand.length).to.be.greaterThan(0)
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })

    it('should handle heavy_strike card action without CardNotFound error', async () => {
      const program = Effect.gen(function* () {
        const engine = yield* GameEngine
        const registry = yield* CardRegistry
        
        // Verify heavy_strike is registered
        const heavyStrikeEffect = yield* registry.getEffect('heavy_strike')
        expect(heavyStrikeEffect.metadata.id).to.equal('heavy_strike')
        
        const newGame = yield* engine.startNewGame()
        expect(newGame.error).to.be.undefined
        expect(newGame.gameState.player).to.not.be.undefined
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })
  })

  describe('Service Dependencies', () => {
    it('should provide all required services', async () => {
      const program = Effect.gen(function* () {
        // Test that all core services are available
        const registry = yield* CardRegistry
        const engine = yield* GameEngine
        
        // Verify services work together
        const heavyStrikeEffect = yield* registry.getEffect('heavy_strike')
        expect(heavyStrikeEffect.metadata.id).to.equal('heavy_strike')
        
        const newGame = yield* engine.startNewGame()
        expect(newGame.gameState.player).to.not.be.undefined
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })

    it('should maintain proper initialization order', async () => {
      const program = Effect.gen(function* () {
        // Access registry first
        const registry = yield* CardRegistry
        const initialEffects = yield* registry.getAllEffects()
        
        // Registry should be fully populated before engine access
        expect(initialEffects.size).to.equal(15)
        
        // Now access engine
        const engine = yield* GameEngine
        const newGame = yield* engine.startNewGame()
        
        expect(newGame.error).to.be.undefined
        expect(newGame.gameState).to.not.be.undefined
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })
  })

  describe('Error Handling', () => {
    it('should handle card lookup failures gracefully', async () => {
      const program = Effect.gen(function* () {
        const registry = yield* CardRegistry
        const result = yield* Effect.either(registry.getEffect('nonexistent_card'))
        
        expect(result._tag).to.equal('Left')
        if (result._tag === 'Left') {
          expect(result.left.cardId).to.equal('nonexistent_card')
          expect(result.left.availableCards).to.be.an('array')
          expect(result.left.availableCards.length).to.equal(15)
          expect(result.left.availableCards).to.include('heavy_strike')
        }
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })

    it('should provide detailed error information when card is missing', async () => {
      const program = Effect.gen(function* () {
        const registry = yield* CardRegistry
        const result = yield* Effect.either(registry.getEffect('missing_card'))
        
        if (result._tag === 'Left') {
          const availableCards = result.left.availableCards
          
          // Verify all expected cards are in the available list
          const expectedCards = [
            'strike', 'heavy_strike', 'quick_strike', 'precise_strike', 'wild_strike',
            'block', 'shield_up', 'dodge',
            'init_algorithm', 'energy_surge', 'load_balancer', 'data_cache',
            'overclock_attack', 'shield_slam', 'execute_algorithm'
          ]
          
          for (const cardId of expectedCards) {
            expect(availableCards).to.include(cardId)
          }
        }
      })
      
      await Effect.runPromise(Effect.provide(program, AppLayer))
    })
  })
})