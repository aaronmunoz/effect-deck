import { Effect, Layer } from 'effect'
import type { GameEffects } from './card-effects'
import { GameEffects as GameEffectsTag } from './card-effects'
import { applyDamage, addShield } from './cards'

// Implementation of composable game effects
export const GameEffectsLive: Layer.Layer<GameEffects> = 
  Layer.succeed(GameEffectsTag, {
    dealDamage: (target, amount, ignoreShield = false) =>
      applyDamage(target, amount, ignoreShield),
    
    gainShield: (player, amount) =>
      addShield(player, amount),
    
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