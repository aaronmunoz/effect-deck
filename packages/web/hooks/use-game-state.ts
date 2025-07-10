'use client'

import { useState, useCallback, useEffect } from 'react'
import { Effect } from 'effect'
import type { GameState, GameAction, GameResponse } from '@effect-deck/core'
import { AppLayer } from '@effect-deck/core'
import { GameEngine } from '@effect-deck/core'

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
        const response = yield* engine.startNewGame()
        const newGameState = yield* engine.getGameState()
        return { response, gameState: newGameState }
      })

      const result = await Effect.runPromise(Effect.provide(program, AppLayer))
      setGameState(result.gameState)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize game')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const processAction = useCallback(async (action: GameAction) => {
    if (!gameState) return

    setIsLoading(true)
    setError(null)

    try {
      const program = Effect.gen(function* () {
        const engine = yield* GameEngine
        const response = yield* engine.processAction(action)
        const newGameState = yield* engine.getGameState()
        return { response, gameState: newGameState }
      })

      const result = await Effect.runPromise(Effect.provide(program, AppLayer))
      setGameState(result.gameState)
      return result.response
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process action')
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