'use client'

import { useState, useCallback } from 'react'
import { Effect } from 'effect'
import type { GameState, GameAction, GameResponse } from '@effect-deck/core'
import { AppLayer, GameEngine } from '@effect-deck/core'

// Extended GameAction type to handle card index for web interface
export type WebGameAction = 
  | { type: 'play_card'; cardIndex: number; targetId?: string }
  | { type: 'end_turn' }
  | { type: 'start_game' }

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeGame = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const program = Effect.gen(function* () {
        const engine = yield* GameEngine
        return yield* engine.startNewGame()
      })

      const result = await Effect.runPromise(Effect.provide(program, AppLayer))
      setGameState(result.gameState)
    } catch (err) {
      console.error('Game initialization error:', err)
      setError(err instanceof Error ? err.message : 'Failed to initialize game')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const processAction = useCallback(async (action: WebGameAction) => {
    if (!gameState) return

    setIsLoading(true)
    setError(null)

    try {
      // Convert web action to core action
      let coreAction: GameAction
      if (action.type === 'play_card') {
        const card = gameState.player.hand[action.cardIndex]
        if (!card) {
          throw new Error('Card not found in hand')
        }
        coreAction = {
          type: 'play_card',
          cardId: card.id,
          targetId: action.targetId,
        }
      } else {
        coreAction = action
      }

      const program = Effect.gen(function* () {
        const engine = yield* GameEngine
        return yield* engine.processAction(coreAction)
      })

      const result = await Effect.runPromise(Effect.provide(program, AppLayer))
      setGameState(result.gameState)
      return result
    } catch (err) {
      console.error('Action processing error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to process action'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [gameState])

  return {
    gameState,
    isLoading,
    error,
    initializeGame,
    processAction,
  }
}