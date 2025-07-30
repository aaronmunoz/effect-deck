import type { CardEffect } from '../../card-effects'
import { validateEnergy } from '../../card-validation'
import { 
  gainPlayerShield,
  addDodgeContext
} from '../../composable-effects'

/**
 * Defense card implementations
 * Cards that provide protection, healing, or defensive abilities
 */

export const DefenseCards: Record<string, CardEffect> = {
  block: {
    execute: gainPlayerShield(5),
    validate: validateEnergy,
    metadata: { id: 'block', category: 'defense' }
  },

  shield_up: {
    execute: gainPlayerShield(8),
    validate: validateEnergy,
    metadata: { id: 'shield_up', category: 'defense' }
  },

  dodge: {
    execute: addDodgeContext,
    validate: validateEnergy,
    metadata: { id: 'dodge', category: 'defense' }
  }
}