import { Effect } from 'effect'
import type { CardEffect } from '../card-effects'
import type { GameState, Card } from '../schema'
import {
  dealDamageToEnemy,
  gainPlayerShield,
  addPlayerContext,
  composeEffects,
  conditionalEffect
} from '../composable-effects'
import { validateEnergy, validateContext } from '../card-validation'

/**
 * Fluent Card Effect Builder
 *
 * Enables rapid prototyping and experimentation with card effects
 * without writing boilerplate code.
 *
 * Example:
 * ```typescript
 * const experimentalCard = new CardBuilder('my_card')
 *   .damage(10)
 *   .shield(5)
 *   .ifEnemyBelow(20, (b) => b.damage(15))
 *   .build()
 * ```
 */
export class CardBuilder {
  private effects: Array<(state: GameState) => Effect.Effect<GameState, never>> = []
  private validators: Array<(card: Card, state: GameState) => Effect.Effect<void, any>> = []
  private cardMetadata: { id: string; category: CardEffect['metadata']['category'] }

  constructor(
    cardId: string,
    category: CardEffect['metadata']['category'] = 'attack'
  ) {
    this.cardMetadata = { id: cardId, category }
    // Default validator: energy
    this.validators.push(validateEnergy)
  }

  // ========== DAMAGE EFFECTS ==========

  damage(amount: number, ignoreShield = false): this {
    this.effects.push(dealDamageToEnemy(amount, ignoreShield))
    return this
  }

  randomDamage(min: number, max: number): this {
    this.effects.push((state) =>
      Effect.gen(function* () {
        const damage = Math.floor(Math.random() * (max - min + 1)) + min
        return yield* dealDamageToEnemy(damage)(state)
      })
    )
    return this
  }

  // ========== SHIELD EFFECTS ==========

  shield(amount: number): this {
    this.effects.push(gainPlayerShield(amount))
    this.cardMetadata.category = 'defense'
    return this
  }

  // ========== CONTEXT EFFECTS ==========

  addContext(contextName: string): this {
    this.effects.push(addPlayerContext(contextName))
    this.cardMetadata.category = 'context'
    return this
  }

  requireContext(contextName: string): this {
    this.validators.push(validateContext(contextName))
    this.cardMetadata.category = 'dependent'
    return this
  }

  // ========== CONDITIONAL EFFECTS ==========

  ifPlayerHealthBelow(threshold: number, thenBuilder: (builder: CardBuilder) => CardBuilder): this {
    const thenEffects = thenBuilder(new CardBuilder('temp')).effects
    this.effects.push(
      conditionalEffect(
        (state) => state.player.health < threshold,
        composeEffects(...thenEffects)
      )
    )
    return this
  }

  ifEnemyHealthBelow(threshold: number, thenBuilder: (builder: CardBuilder) => CardBuilder): this {
    const thenEffects = thenBuilder(new CardBuilder('temp')).effects
    this.effects.push(
      conditionalEffect(
        (state) => (state.enemy?.health ?? 0) < threshold,
        composeEffects(...thenEffects)
      )
    )
    return this
  }

  ifPlayerHasContext(context: string, thenBuilder: (builder: CardBuilder) => CardBuilder): this {
    const thenEffects = thenBuilder(new CardBuilder('temp')).effects
    this.effects.push(
      conditionalEffect(
        (state) => state.player.contexts.includes(context),
        composeEffects(...thenEffects)
      )
    )
    return this
  }

  // ========== CUSTOM EFFECTS ==========

  custom(effect: (state: GameState) => Effect.Effect<GameState, never>): this {
    this.effects.push(effect)
    return this
  }

  customValidator(validator: (card: Card, state: GameState) => Effect.Effect<void, any>): this {
    this.validators.push(validator)
    return this
  }

  // ========== LIFECYCLE EFFECTS ==========

  log(message: string | ((state: GameState) => string)): this {
    this.effects.push((state) =>
      Effect.succeed({
        ...state,
        log: [
          ...state.log,
          typeof message === 'function' ? message(state) : message
        ]
      })
    )
    return this
  }

  // ========== BUILDER ==========

  build(): CardEffect {
    const composedEffect = composeEffects(...this.effects)
    const composedValidator = (card: Card, state: GameState) =>
      Effect.gen(function* () {
        for (const validator of this.validators) {
          yield* validator(card, state)
        }
      }).bind(this)()

    return {
      execute: composedEffect,
      validate: composedValidator,
      metadata: this.cardMetadata
    }
  }
}

// ============================================================================
// Example Card Builders
// ============================================================================

/**
 * Berserker Strike: More damage when low health
 */
export const berserkerStrike = new CardBuilder('berserker_strike')
  .damage(8)
  .ifPlayerHealthBelow(20, (b) => b.damage(8)) // Additional 8 damage when low HP
  .log((state) =>
    state.player.health < 20
      ? 'Berserker rage! Dealing massive damage!'
      : 'Berserker strike!'
  )
  .build()

/**
 * Adaptive Shield: More shield when enemy has high damage
 */
export const adaptiveShield = new CardBuilder('adaptive_shield', 'defense')
  .shield(5)
  .custom((state) =>
    Effect.succeed({
      ...state,
      player: {
        ...state.player,
        shield: state.player.shield + Math.floor((state.enemy?.damage ?? 0) / 2)
      }
    })
  )
  .log('Adaptive shield activated!')
  .build()

/**
 * Context Chain: Enable algorithm, then execute
 */
export const algorithmChain = new CardBuilder('algorithm_chain', 'context')
  .addContext('Algorithm')
  .ifPlayerHasContext('Algorithm', (b) => b.damage(10))
  .build()

/**
 * Finisher: Massive damage to low health enemies
 */
export const finisher = new CardBuilder('finisher')
  .damage(5)
  .ifEnemyHealthBelow(15, (b) => b.damage(20))
  .log((state) =>
    (state.enemy?.health ?? 0) < 15
      ? 'FINISHER! Execute!'
      : 'Finisher attack'
  )
  .build()

/**
 * Lucky Strike: Random damage with context bonus
 */
export const luckyStrike = new CardBuilder('lucky_strike')
  .randomDamage(3, 12)
  .ifPlayerHasContext('HighEnergy', (b) => b.damage(5))
  .build()
