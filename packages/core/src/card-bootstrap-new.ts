import { Effect, Layer } from 'effect'
import { CardRegistry } from './card-effects'
import { AllCardEffects } from './card-types'

/**
 * Streamlined card bootstrap layer using the new composable effects system
 * This replaces the original 477-line card-bootstrap.ts with a much cleaner approach
 */
export const CardBootstrapLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const registry = yield* CardRegistry
    
    // Register all card effects automatically
    for (const [cardId, cardEffect] of Object.entries(AllCardEffects)) {
      yield* registry.registerEffect(cardId, cardEffect)
    }
    
    const cardCount = Object.keys(AllCardEffects).length
    const cardIds = Object.keys(AllCardEffects).join(', ')
    
    yield* Effect.log(`Registered ${cardCount} card effects: ${cardIds}`)
  })
)