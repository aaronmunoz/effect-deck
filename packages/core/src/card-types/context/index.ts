import type { CardEffect } from '../../card-effects'
import { validateEnergy } from '../../card-validation'
import { addPlayerContext } from '../../composable-effects'

/**
 * Context card implementations
 * Cards that add temporary abilities or states to the player
 */

export const ContextCards: Record<string, CardEffect> = {
  init_algorithm: {
    execute: addPlayerContext('Algorithm'),
    validate: validateEnergy,
    metadata: { id: 'init_algorithm', category: 'context' }
  },

  energy_surge: {
    execute: addPlayerContext('HighEnergy'),
    validate: validateEnergy,
    metadata: { id: 'energy_surge', category: 'context' }
  },

  load_balancer: {
    execute: addPlayerContext('LoadBalancer'),
    validate: validateEnergy,
    metadata: { id: 'load_balancer', category: 'context' }
  },

  data_cache: {
    execute: addPlayerContext('Cache'),
    validate: validateEnergy,
    metadata: { id: 'data_cache', category: 'context' }
  }
}