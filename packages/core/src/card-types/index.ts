import type { CardEffect } from '../card-effects'
import { AttackCards } from './attack'
import { DefenseCards } from './defense'
import { ContextCards } from './context'
import { DependentCards } from './dependent'

/**
 * All card effect implementations organized by type
 */
export const AllCardEffects: Record<string, CardEffect> = {
  ...AttackCards,
  ...DefenseCards,
  ...ContextCards,
  ...DependentCards
}

// Re-export individual card type modules for extensibility
export { AttackCards } from './attack'
export { DefenseCards } from './defense'
export { ContextCards } from './context'
export { DependentCards } from './dependent'