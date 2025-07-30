'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameState } from '@effect-deck/core'

type GamePhase = 'draw' | 'action' | 'enemy' | 'cleanup'

interface TurnFlowState {
  currentPhase: GamePhase
  turnNumber: number
  phaseStartTime: number
  isTransitioning: boolean
  previousPhase: GamePhase | null
}

interface UseTurnFlowReturn {
  turnFlow: TurnFlowState
  showPhaseTransition: boolean
  phaseProgress: number
  completePhaseTransition: () => void
  triggerPhaseChange: (newPhase: GamePhase) => void
}

const PHASE_DURATIONS: Record<GamePhase, number> = {
  draw: 1500,      // 1.5 seconds for draw phase
  action: 0,       // Indefinite for player action
  enemy: 2500,     // 2.5 seconds for enemy phase
  cleanup: 1000    // 1 second for cleanup
}

export function useTurnFlow(gameState: GameState | null): UseTurnFlowReturn {
  const [turnFlow, setTurnFlow] = useState<TurnFlowState>({
    currentPhase: 'draw',
    turnNumber: 1,
    phaseStartTime: Date.now(),
    isTransitioning: false,
    previousPhase: null
  })
  
  const [showPhaseTransition, setShowPhaseTransition] = useState(false)
  const [phaseProgress, setPhaseProgress] = useState(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousPhaseRef = useRef<GamePhase>('draw')

  // Monitor game state changes for phase transitions
  useEffect(() => {
    if (!gameState) return

    const newPhase = gameState.phase
    const currentPhase = turnFlow.currentPhase

    // Check if phase actually changed
    if (newPhase !== currentPhase && newPhase !== previousPhaseRef.current) {
      triggerPhaseChange(newPhase)
      previousPhaseRef.current = newPhase
    }
  }, [gameState?.phase, turnFlow.currentPhase])

  // Progress tracking for timed phases
  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    const duration = PHASE_DURATIONS[turnFlow.currentPhase]
    if (duration && duration > 0 && !turnFlow.isTransitioning) {
      const startTime = turnFlow.phaseStartTime
      const updateProgress = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        setPhaseProgress(progress)

        if (progress >= 1) {
          clearInterval(progressIntervalRef.current!)
        }
      }

      progressIntervalRef.current = setInterval(updateProgress, 50)
      updateProgress() // Initial update
    } else {
      setPhaseProgress(0)
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [turnFlow.currentPhase, turnFlow.phaseStartTime, turnFlow.isTransitioning])

  const triggerPhaseChange = useCallback((newPhase: GamePhase) => {
  setTurnFlow(prev => ({
      ...prev,
      previousPhase: prev.currentPhase,
      isTransitioning: true
    }))

    // Show transition overlay
    setShowPhaseTransition(true)

    // Auto-complete transition after animation
    setTimeout(() => {
      setTurnFlow(prev => ({
        ...prev,
        currentPhase: newPhase,
        phaseStartTime: Date.now(),
        isTransitioning: false,
        turnNumber: (prev.currentPhase === 'cleanup' && newPhase === 'draw') 
          ? prev.turnNumber + 1 
          : prev.turnNumber
      }))
    }, 1500) // Duration of transition animation
  }, [])

  const completePhaseTransition = useCallback(() => {
    setShowPhaseTransition(false)
  }, [])

  return {
    turnFlow,
    showPhaseTransition,
    phaseProgress,
    completePhaseTransition,
    triggerPhaseChange
  }
}

// Helper functions for turn flow logic
export const turnFlowHelpers = {
  isPlayerTurn: (phase: GamePhase): boolean => {
    return phase === 'action'
  },

  isEnemyTurn: (phase: GamePhase): boolean => {
    return phase === 'enemy'
  },

  isAutomatedPhase: (phase: GamePhase): boolean => {
    return phase === 'draw' || phase === 'cleanup'
  },

  getPhaseDescription: (phase: GamePhase, isPlayerTurn: boolean): string => {
    switch (phase) {
      case 'draw':
        return isPlayerTurn ? "Drawing your cards..." : "Enemy draws cards..."
      case 'action':
        return "Choose your actions carefully"
      case 'enemy':
        return "Enemy is planning their move..."
      case 'cleanup':
        return "Resolving all effects..."
      default:
        return "Game in progress..."
    }
  },

  shouldShowTimer: (phase: GamePhase): boolean => {
    return PHASE_DURATIONS[phase] > 0
  },

  getPhaseDuration: (phase: GamePhase): number => {
    return PHASE_DURATIONS[phase] || 0
  }
}