import { Effect } from 'effect'
import type { GameState } from './schema'
import { applyDamage, addShield } from './cards'

/**
 * Core composable effects for modifying game state
 * These are the building blocks that card implementations use
 */

// ===== DAMAGE EFFECTS =====

/**
 * Deal fixed damage to enemy
 */
export const dealDamageToEnemy = (damage: number, ignoreShield = false) =>
  (gameState: GameState): Effect.Effect<GameState, never> =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      const updatedEnemy = yield* applyDamage(gameState.enemy, damage, ignoreShield)
      const shieldText = ignoreShield ? ' (ignoring shield)' : ''
      
      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Player deals ${damage} damage to ${gameState.enemy.name}${shieldText}`]
      }
    })

/**
 * Deal variable damage (for random effects)
 */
export const dealRandomDamageToEnemy = (minDamage: number, maxDamage: number) =>
  (gameState: GameState): Effect.Effect<GameState, never> =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      const damage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage
      const updatedEnemy = yield* applyDamage(gameState.enemy, damage)
      
      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Player deals ${damage} damage to ${gameState.enemy.name} (wild)`]
      }
    })

/**
 * Deal damage based on player's shield amount
 */
export const dealShieldBasedDamage = (gameState: GameState): Effect.Effect<GameState, never> =>
  Effect.gen(function* () {
    if (!gameState.enemy || gameState.player.shield === 0) return gameState
    
    const damage = gameState.player.shield
    const updatedEnemy = yield* applyDamage(gameState.enemy, damage)
    
    return {
      ...gameState,
      enemy: updatedEnemy,
      log: [...gameState.log, `Player deals ${damage} damage to ${gameState.enemy.name} (shield slam)`]
    }
  })

/**
 * Deal damage and gain shield (vampiric attack)
 */
export const dealDamageAndGainShield = (damage: number, shieldPercent: number = 0.2) =>
  (gameState: GameState): Effect.Effect<GameState, never> =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      // Deal damage first
      const updatedEnemy = yield* applyDamage(gameState.enemy, damage)
      
      // Calculate shield gain (20% of damage by default)
      const shieldGain = Math.ceil(damage * shieldPercent)
      const updatedPlayer = yield* addShield(gameState.player, shieldGain)
      
      return {
        ...gameState,
        enemy: updatedEnemy,
        player: updatedPlayer,
        log: [...gameState.log, `Player deals ${damage} damage to ${gameState.enemy.name} and gains ${shieldGain} shield`]
      }
    })

// ===== SHIELD EFFECTS =====

/**
 * Add shield to player
 */
export const gainPlayerShield = (amount: number) =>
  (gameState: GameState): Effect.Effect<GameState, never> =>
    Effect.gen(function* () {
      const updatedPlayer = yield* addShield(gameState.player, amount)
      
      return {
        ...gameState,
        player: updatedPlayer,
        log: [...gameState.log, `Player gains ${amount} shield`]
      }
    })

// ===== CONTEXT EFFECTS =====

/**
 * Add context to player
 */
export const addPlayerContext = (context: string) =>
  (gameState: GameState): Effect.Effect<GameState, never> =>
    Effect.gen(function* () {
      const updatedPlayer = {
        ...gameState.player,
        contexts: gameState.player.contexts.includes(context)
          ? gameState.player.contexts
          : [...gameState.player.contexts, context]
      }
      
      return {
        ...gameState,
        player: updatedPlayer,
        log: [...gameState.log, `${context} context activated`]
      }
    })

/**
 * Add dodge context (special behavior)
 */
export const addDodgeContext = (gameState: GameState): Effect.Effect<GameState, never> =>
  Effect.gen(function* () {
    const updatedPlayer = {
      ...gameState.player,
      contexts: [...gameState.player.contexts, 'Dodge']
    }
    
    return {
      ...gameState,
      player: updatedPlayer,
      log: [...gameState.log, 'Player prepares to dodge the next attack']
    }
  })

// ===== EFFECT COMBINATORS =====

/**
 * Compose multiple effects in sequence
 */
export const composeEffects = (...effects: Array<(gameState: GameState) => Effect.Effect<GameState, never>>) =>
  (gameState: GameState): Effect.Effect<GameState, never> =>
    effects.reduce(
      (acc, effect) => Effect.flatMap(acc, effect),
      Effect.succeed(gameState)
    )

/**
 * Apply effect conditionally
 */
export const conditionalEffect = (
  condition: (gameState: GameState) => boolean,
  effect: (gameState: GameState) => Effect.Effect<GameState, never>
) =>
  (gameState: GameState): Effect.Effect<GameState, never> =>
    condition(gameState) ? effect(gameState) : Effect.succeed(gameState)