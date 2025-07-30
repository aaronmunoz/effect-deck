import { Effect } from 'effect'
import type { Card, GameState } from './schema'
import { InsufficientEnergy, RequiredContextMissing } from './errors'

/**
 * Reusable validation functions for card effects
 */

/**
 * Standard energy validation that most cards use
 */
export const validateEnergy = (card: Card, gameState: GameState) =>
  gameState.player.energy >= card.cost
    ? Effect.void
    : Effect.fail(new InsufficientEnergy({
        required: card.cost,
        available: gameState.player.energy
      }))

/**
 * Validation for cards that require specific contexts
 */
export const validateContext = (requiredContext: string) => (card: Card, gameState: GameState) =>
  Effect.gen(function* () {
    // First check energy
    yield* validateEnergy(card, gameState)
    
    // Then check required context
    if (!gameState.player.contexts.includes(requiredContext)) {
      return yield* Effect.fail(new RequiredContextMissing({
        required: requiredContext,
        available: [...gameState.player.contexts]
      }))
    }
  })

/**
 * Validation for multiple required contexts
 */
export const validateContexts = (requiredContexts: string[]) => (card: Card, gameState: GameState) =>
  Effect.gen(function* () {
    yield* validateEnergy(card, gameState)
    
    for (const context of requiredContexts) {
      if (!gameState.player.contexts.includes(context)) {
        return yield* Effect.fail(new RequiredContextMissing({
          required: context,
          available: [...gameState.player.contexts]
        }))
      }
    }
  })

/**
 * Validation for shield-based cards (requires shield > 0)
 */
export const validateShield = (card: Card, gameState: GameState) =>
  Effect.gen(function* () {
    yield* validateEnergy(card, gameState)
    
    if (gameState.player.shield === 0) {
      return yield* Effect.fail(new RequiredContextMissing({
        required: 'Shield > 0',
        available: [`Shield: ${gameState.player.shield}`]
      }))
    }
  })

/**
 * Custom validation combinator
 */
export const customValidation = (
  validator: (card: Card, gameState: GameState) => boolean,
  errorMessage: string
) => (card: Card, gameState: GameState) =>
  Effect.gen(function* () {
    yield* validateEnergy(card, gameState)
    
    if (!validator(card, gameState)) {
      return yield* Effect.fail(new RequiredContextMissing({
        required: errorMessage,
        available: []
      }))
    }
  })