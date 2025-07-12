import { Effect, Layer } from 'effect'
import type { Player, Enemy } from './schema'
import type { GameEffects } from './card-effects'
import { GameEffects as GameEffectsTag } from './card-effects'

// Apply damage calculation with shield mechanics
const applyDamage = (target: Player | Enemy, damage: number, ignoreShield = false): Player | Enemy => {
  const effectiveDamage = ignoreShield ? damage : Math.max(0, damage - target.shield)
  const newShield = ignoreShield ? target.shield : Math.max(0, target.shield - damage)
  
  return {
    ...target,
    health: Math.max(0, target.health - effectiveDamage),
    shield: newShield,
  }
}

// Implementation of composable game effects
export const GameEffectsLive: Layer.Layer<GameEffects> = 
  Layer.succeed(GameEffectsTag, {
    dealDamage: (target, amount, ignoreShield = false) =>
      Effect.succeed(applyDamage(target, amount, ignoreShield) as Enemy),
    
    gainShield: (player, amount) =>
      Effect.succeed({
        ...player,
        shield: player.shield + amount,
      }),
    
    addContext: (player, context) =>
      Effect.succeed({
      ...player,
        contexts: player.contexts.includes(context) 
          ? player.contexts 
          : [...player.contexts, context],
      }),
    
    drawCards: (player, count) =>
      Effect.succeed((() => {
        const cardsToDraw = Math.min(count, player.deck.length)
        const drawnCards = player.deck.slice(0, cardsToDraw)
        const remainingDeck = player.deck.slice(cardsToDraw)
        
        return {
          ...player,
          hand: [...player.hand, ...drawnCards],
          deck: remainingDeck,
        }
      })()),
    
    gainEnergy: (player, amount) =>
      Effect.succeed({
        ...player,
        energy: Math.min(player.maxEnergy, player.energy + amount),
      }),
    
    heal: (player, amount) =>
      Effect.succeed({
        ...player,
        health: Math.min(player.maxHealth, player.health + amount),
      }),
    
    removeContext: (player, context) =>
      Effect.succeed({
        ...player,
        contexts: player.contexts.filter(c => c !== context),
      }),
  })