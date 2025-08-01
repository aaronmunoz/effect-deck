import { Effect } from 'effect'
import type { Card, Player, Enemy } from './schema'
import { CardNotFound } from './errors'

const createCard = (
  id: string,
  name: string,
  cost: number,
  description: string,
  type: Card['type']
): Card => ({
  id,
  name,
  cost,
  description,
  type,
})

export const BASIC_CARDS: Card[] = [
  createCard('strike', 'Strike', 1, 'Deal 6 damage', 'attack'),
  createCard('heavy_strike', 'Heavy Strike', 2, 'Deal 12 damage', 'attack'),
  createCard('quick_strike', 'Quick Strike', 0, 'Deal 3 damage', 'attack'),
  createCard('precise_strike', 'Precise Strike', 2, 'Deal 8 damage, ignores shield', 'attack'),
  createCard('wild_strike', 'Wild Strike', 1, 'Deal 3-9 damage randomly', 'attack'),
  createCard('vampiric_strike', 'Vampiric Strike', 2, 'Deal 10 damage, gain 2 shield', 'attack'),
  createCard('berserker_strike', 'Berserker Strike', 3, 'Deal 15 damage, gain 3 shield', 'attack'),
  createCard('block', 'Block', 1, 'Gain 5 shield', 'defense'),
  createCard('shield_up', 'Shield Up', 2, 'Gain 8 shield', 'defense'),
  createCard('dodge', 'Dodge', 1, 'Negate next attack', 'defense'),
  createCard('init_algorithm', 'Initialize Algorithm', 1, 'Gain Algorithm context', 'context'),
  createCard('energy_surge', 'Energy Surge', 0, 'Gain HighEnergy context', 'context'),
  createCard('load_balancer', 'Load Balancer', 2, 'Gain LoadBalancer context', 'context'),
  createCard('data_cache', 'Data Cache', 1, 'Gain Cache context', 'context'),
  createCard('overclock_attack', 'Overclock Attack', 2, 'Deal 15 damage (requires HighEnergy)', 'dependent'),
  createCard('shield_slam', 'Shield Slam', 1, 'Deal damage equal to shield (requires Shield)', 'dependent'),
  createCard('execute_algorithm', 'Execute Algorithm', 3, 'Deal 20 damage (requires Algorithm)', 'dependent'),
]

export const getCard = (id: string): Effect.Effect<Card, CardNotFound> =>
  Effect.gen(function* () {
    const card = BASIC_CARDS.find((card) => card.id === id)
    if (!card) {
      return yield* Effect.fail(new CardNotFound({
        cardId: id,
        availableCards: BASIC_CARDS.map(c => c.id)
      }))
    }
    return card
  })

export const getAllCards = (): Effect.Effect<Card[]> =>
  Effect.succeed(BASIC_CARDS)

// Type-safe overloads for applyDamage
export function applyDamage(target: Player, damage: number, ignoreShield?: boolean): Effect.Effect<Player, never>
export function applyDamage(target: Enemy, damage: number, ignoreShield?: boolean): Effect.Effect<Enemy, never>
export function applyDamage(target: Player | Enemy, damage: number, ignoreShield = false): Effect.Effect<Player | Enemy, never> {
  return Effect.gen(function* () {
    const effectiveDamage = ignoreShield ? damage : Math.max(0, damage - target.shield)
    const newShield = ignoreShield ? target.shield : Math.max(0, target.shield - damage)
    
    return {
      ...target,
      health: Math.max(0, target.health - effectiveDamage),
      shield: newShield,
    }
  })
}

// Type-safe overloads for addShield
export function addShield(target: Player, amount: number): Effect.Effect<Player, never>
export function addShield(target: Enemy, amount: number): Effect.Effect<Enemy, never>
export function addShield(target: Player | Enemy, amount: number): Effect.Effect<Player | Enemy, never> {
  return Effect.gen(function* () {
    return {
      ...target,
      shield: target.shield + amount,
    }
  })
}