'use client'

import { useState, useCallback, useEffect } from 'react'
import type { GameState } from '@effect-deck/core'
import { gameBackend } from '../services/game-backend'

// Extended GameAction type to handle card index for web interface
export type WebGameAction = 
  | { type: 'play_card'; cardIndex: number; targetId?: string }
  | { type: 'end_turn' }
  | { type: 'start_game' }

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Subscribe to backend state changes when the hook mounts
  useEffect(() => {
    // Check if backend is ready
    setIsInitialized(gameBackend.isReady())
    
    // Subscribe to state changes from backend
    const unsubscribe = gameBackend.subscribe((newState) => {
      setGameState(newState)
    })

    // Get initial state if available
    const currentState = gameBackend.getCurrentState()
    if (currentState) {
      setGameState(currentState)
    }

    return unsubscribe
  }, [])

  const initializeGame = useCallback(async () => {
    if (!isInitialized) {
      setError('Game backend not ready')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      await gameBackend.startNewGame()
      // State will be updated via subscription
    } catch (err) {
      console.error('Game initialization error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start new game')
    } finally {
      setIsLoading(false)
    }
  }, [isInitialized])

  const processAction = useCallback(async (action: WebGameAction) => {
    if (!gameState || !isInitialized) {
      setError('Game not ready')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (action.type === 'play_card') {
        const card = gameState.player.hand[action.cardIndex]
        if (!card) {
          throw new Error('Card not found in hand')
        }
        
        await gameBackend.playCard(card.id, action.targetId)
      } else if (action.type === 'end_turn') {
        await gameBackend.endTurn()
      } else if (action.type === 'start_game') {
        await gameBackend.startNewGame()
      }
      
      // State will be updated via subscription
    } catch (err) {
      console.error('Action processing error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to process action'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [gameState, isInitialized])

  return {
    gameState,
    isLoading,
    error,
    isInitialized,
    initializeGame,
    processAction,
  }
}