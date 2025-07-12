import { Effect, Layer, Ref } from 'effect'
import type { CardRegistry, CardEffect } from './card-effects'
import { CardRegistry as CardRegistryTag } from './card-effects'
import { CardNotFound } from './errors'

// Card registry implementation - starts empty, populated by CardBootstrapLayer
export const CardRegistryLive: Layer.Layer<CardRegistry> = 
  Layer.effect(
    CardRegistryTag,
    Effect.gen(function* (_) {
      const effects = yield* _(Ref.make(new Map<string, CardEffect>()))
      
      return {
        getEffect: (cardId: string) =>
          Effect.gen(function* (_) {
            const effectMap = yield* _(Ref.get(effects))
            const effect = effectMap.get(cardId)
            
            if (!effect) {
              const availableCards = Array.from(effectMap.keys())
              return yield* _(Effect.fail(new CardNotFound({
                cardId,
                availableCards
              })))
            }
            
            return effect
          }),
        
        getAllEffects: () =>
          Effect.gen(function* (_) {
            return yield* _(Ref.get(effects))
          }),
        
        registerEffect: (cardId: string, effect: CardEffect) =>
          Effect.gen(function* (_) {
            yield* _(Ref.update(effects, map => new Map(map.set(cardId, effect))))
          })
      }
    })
  )

// Helper function to register multiple effects at once
export const registerEffects = (
  effects: Array<CardEffect>
): Effect.Effect<void, never, CardRegistry> =>
  Effect.gen(function* (_) {
    const registry = yield* _(CardRegistryTag)
    
    for (const effect of effects) {
      yield* _(registry.registerEffect(effect.metadata.id, effect))
    }
  })