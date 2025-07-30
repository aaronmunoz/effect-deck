import { Context, Effect, Ref } from 'effect'
import type { GameState, GameAction, GameResponse } from './schema'
import type { GameError } from './errors'
import type { CardRegistry } from './card-effects'

// Service interface using Context
export interface GameEngine {
  readonly processAction: (action: GameAction) => Effect.Effect<GameResponse, GameError, CardRegistry>
  readonly getGameState: () => Effect.Effect<GameState>
  readonly startNewGame: () => Effect.Effect<GameResponse, GameError, CardRegistry>
}

// Context tag for GameEngine service
export const GameEngine = Context.GenericTag<GameEngine>('GameEngine')

// Dependencies for GameEngine
export interface GameStateRef {
  readonly ref: Ref.Ref<GameState>
}

export const GameStateRef = Context.GenericTag<GameStateRef>('GameStateRef')

// Layer implementations will be in game-engine.ts to avoid circular dependencies