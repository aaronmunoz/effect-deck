import type { CardEffect } from '../../card-effects'
import { validateEnergy } from '../../card-validation'
import { 
  dealDamageToEnemy, 
  dealRandomDamageToEnemy,
  dealDamageAndGainShield
} from '../../composable-effects'

/**
 * Attack card implementations
 * Cards that deal damage to enemies
 */

export const AttackCards: Record<string, CardEffect> = {
  strike: {
    execute: dealDamageToEnemy(6),
    validate: validateEnergy,
    metadata: { id: 'strike', category: 'attack' }
  },

  heavy_strike: {
    execute: dealDamageToEnemy(12),
    validate: validateEnergy,
    metadata: { id: 'heavy_strike', category: 'attack' }
  },

  quick_strike: {
    execute: dealDamageToEnemy(3),
    validate: validateEnergy,
    metadata: { id: 'quick_strike', category: 'attack' }
  },

  precise_strike: {
    execute: dealDamageToEnemy(8, true), // ignores shield
    validate: validateEnergy,
    metadata: { id: 'precise_strike', category: 'attack' }
  },

  wild_strike: {
    execute: dealRandomDamageToEnemy(3, 9),
    validate: validateEnergy,
    metadata: { id: 'wild_strike', category: 'attack' }
  },

  vampiric_strike: {
    execute: dealDamageAndGainShield(10, 0.2), // 10 damage, 20% shield gain (2 shield)
    validate: validateEnergy,
    metadata: { id: 'vampiric_strike', category: 'attack' }
  },

  berserker_strike: {
    execute: dealDamageAndGainShield(15, 0.2), // 15 damage, 20% shield gain (3 shield)
    validate: validateEnergy,
    metadata: { id: 'berserker_strike', category: 'attack' }
  }
}