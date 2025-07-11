import { Effect, Layer, Ref } from 'effect'
import type { CardRegistry, CardEffect } from './card-effects'
import { CardRegistry as CardRegistryTag } from './card-effects'
import { CardNotFound } from './errors'

// Card registry implementation using scoped layer for proper DI
export const CardRegistryLive: Layer.Layer<CardRegistry> = 
  Layer.scoped(
    CardRegistryTag,
    Effect.gen(function* () {
      const effects = yield* Ref.make(new Map<string, CardEffect>())
      
      return {
        getEffect: (cardId) =>
          Effect.gen(function* () {
            const effectMap = yield* Ref.get(effects)
            const effect = effectMap.get(cardId)
            
            if (!effect) {
              const availableCards = Array.from(effectMap.keys())
              return yield* Effect.fail(new CardNotFound({
                cardId,
                availableCards
              }))
            }
            
            return effect
          }),
        
        getAllEffects: () =>
          Effect.gen(function* () {
            return yield* Ref.get(effects)
          }),
        
        registerEffect: (cardId, effect) =>
          Effect.gen(function* () {
            yield* Ref.update(effects, map => new Map(map.set(cardId, effect)))
          })
      }
    })
  )

// Helper function to register multiple effects at once
export const registerEffects = (
  effects: Array<CardEffect>
): Effect.Effect<void, never, CardRegistry> =>
  Effect.gen(function* () {
    const registry = yield* CardRegistryTag
    
    for (const effect of effects) {
      yield* registry.registerEffect(effect.metadata.id, effect)
    }
  })