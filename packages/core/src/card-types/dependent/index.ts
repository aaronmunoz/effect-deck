import type { CardEffect } from '../../card-effects'
import { validateContext, validateShield } from '../../card-validation'
import { 
  dealDamageToEnemy,
  dealShieldBasedDamage
} from '../../composable-effects'

/**
 * Dependent card implementations
 * Cards that require specific contexts or conditions to be played
 */

export const DependentCards: Record<string, CardEffect> = {
  overclock_attack: {
    execute: dealDamageToEnemy(15),
    validate: validateContext('HighEnergy'),
    metadata: { id: 'overclock_attack', category: 'dependent' }
  },

  shield_slam: {
    execute: dealShieldBasedDamage,
    validate: validateShield,
    metadata: { id: 'shield_slam', category: 'dependent' }
  },

  execute_algorithm: {
    execute: dealDamageToEnemy(20),
    validate: validateContext('Algorithm'),
    metadata: { id: 'execute_algorithm', category: 'dependent' }
  }
}