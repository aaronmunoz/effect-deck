/**
 * EXAMPLES: How the composable effects system makes creating new cards easy
 * 
 * This demonstrates the power of the new architecture - complex cards
 * can be created by composing simple building blocks.
 */

import type { CardEffect } from './card-effects'
import { validateEnergy } from './card-validation'
import { 
  dealDamageToEnemy,
  gainPlayerShield,
  addPlayerContext,
  composeEffects,
  dealDamageAndGainShield
} from './composable-effects'

/**
 * Example: More complex cards using effect composition
 */
export const ExampleCards: Record<string, CardEffect> = {
  // Card that deals damage AND adds a context
  lightning_strike: {
    execute: composeEffects(
      dealDamageToEnemy(8),
      addPlayerContext('Charged')
    ),
    validate: validateEnergy,
    metadata: { id: 'lightning_strike', category: 'attack' }
  },

  // Card that provides both offense and defense
  guardian_strike: {
    execute: composeEffects(
      dealDamageToEnemy(6),
      gainPlayerShield(4),
      addPlayerContext('Guardian')
    ),
    validate: validateEnergy,
    metadata: { id: 'guardian_strike', category: 'attack' }
  },

  // Vampiric cards with different percentages
  life_steal_minor: {
    execute: dealDamageAndGainShield(8, 0.125), // 8 damage, 12.5% shield (1 shield)
    validate: validateEnergy,
    metadata: { id: 'life_steal_minor', category: 'attack' }
  },

  life_steal_major: {
    execute: dealDamageAndGainShield(12, 0.33), // 12 damage, 33% shield (4 shield)
    validate: validateEnergy,
    metadata: { id: 'life_steal_major', category: 'attack' }
  },

  // Card that does different amounts based on percentage
  adaptive_strike: {
    execute: dealDamageAndGainShield(20, 0.15), // 20 damage, 15% shield (3 shield)
    validate: validateEnergy,
    metadata: { id: 'adaptive_strike', category: 'attack' }
  }
}

/**
 * The beauty of this system:
 * 
 * 1. EASY TO CREATE: New cards are just combinations of existing effects
 * 2. CONSISTENT: All cards follow the same patterns
 * 3. TESTABLE: Each effect can be tested independently
 * 4. FLEXIBLE: Any combination of effects is possible
 * 5. READABLE: The intent of each card is immediately clear
 * 
 * Adding any of these cards to the game would just require:
 * 1. Add the card data to BASIC_CARDS array
 * 2. Add the effect to the appropriate card type file
 * 3. The bootstrap automatically registers it
 * 
 * No need to write repetitive validation or state management code!
 */