import { Context, Effect } from 'effect'
import type { GameState, Card, Player, Enemy } from './schema'
import type { GameError } from './errors'
import { CardNotFound } from './errors'

// Core card effect interface
export interface CardEffect {
  readonly execute: (
    gameState: GameState,
    cardId: string,
    targetId?: string
  ) => Effect.Effect<GameState, GameError>
  
  readonly validate: (
    card: Card,
    gameState: GameState
  ) => Effect.Effect<void, GameError>
  
  readonly metadata: {
    readonly id: string
    readonly category: 'attack' | 'defense' | 'context' | 'dependent'
  }
}

// Context tag for individual card effects
export const CardEffect = Context.GenericTag<CardEffect>('CardEffect')

// Card registry service interface
export interface CardRegistry {
  readonly getEffect: (cardId: string) => Effect.Effect<CardEffect, CardNotFound>
  readonly getAllEffects: () => Effect.Effect<Map<string, CardEffect>>
  readonly registerEffect: (cardId: string, effect: CardEffect) => Effect.Effect<void>
}

export const CardRegistry = Context.GenericTag<CardRegistry>('CardRegistry')

// Composable game effect primitives
export interface GameEffects {
  readonly dealDamage: (
    target: Enemy,
    amount: number,
    ignoreShield?: boolean
  ) => Effect.Effect<Enemy, never>
  
  readonly gainShield: (
    player: Player,
    amount: number
  ) => Effect.Effect<Player, never>
  
  readonly addContext: (
    player: Player,
    context: string
  ) => Effect.Effect<Player, never>
  
  readonly drawCards: (
    player: Player,
    count: number
  ) => Effect.Effect<Player, never>
  
  readonly gainEnergy: (
    player: Player,
    amount: number
  ) => Effect.Effect<Player, never>
  
  readonly heal: (
    player: Player,
    amount: number
  ) => Effect.Effect<Player, never>
  
  readonly removeContext: (
    player: Player,
    context: string
  ) => Effect.Effect<Player, never>
}

export const GameEffects = Context.GenericTag<GameEffects>('GameEffects')

// Helper function to update game state with new player
export const updatePlayer = (
  gameState: GameState,
  player: Player
): GameState => ({
  ...gameState,
  player
})

// Helper function to update game state with new enemy
export const updateEnemy = (
  gameState: GameState,
  enemy: Enemy
): GameState => ({
  ...gameState,
  enemy
})

// Helper function to add log message
export const addLogMessage = (
  gameState: GameState,
  message: string
): GameState => ({
  ...gameState,
  log: [...gameState.log, message]
})