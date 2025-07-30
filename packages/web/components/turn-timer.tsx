'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type GamePhase = 'draw' | 'action' | 'enemy' | 'cleanup'

interface TurnTimerProps {
  phase: GamePhase
  duration: number // in milliseconds
  isActive: boolean
  onTimeUp?: (() => void) | undefined
}

export function TurnTimer({ phase, duration, isActive, onTimeUp }: TurnTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (!isActive || duration <= 0) {
      setTimeLeft(duration)
      setProgress(100)
      return
    }

    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, duration - elapsed)
      const progressPercent = (remaining / duration) * 100

      setTimeLeft(remaining)
      setProgress(progressPercent)

      if (remaining <= 0) {
        clearInterval(interval)
        onTimeUp?.()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [duration, isActive, onTimeUp])

  if (!isActive || duration <= 0) {
    return null
  }

  const seconds = Math.ceil(timeLeft / 1000)
  const isUrgent = seconds <= 3
  const isCritical = seconds <= 1

  const getTimerColor = () => {
    if (isCritical) return 'text-red-500'
    if (isUrgent) return 'text-yellow-500'
    return 'text-game-info'
  }

  const getRingColor = () => {
    if (isCritical) return 'stroke-red-500'
    if (isUrgent) return 'stroke-yellow-500'
    return 'stroke-game-info'
  }

  return (
    <motion.div
      className="relative flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Timer Circle */}
      <div className="relative w-16 h-16">
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-game-border/30"
          />
          
          {/* Progress Circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className={getRingColor()}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 45}`}
            initial={{ strokeDashoffset: 0 }}
            animate={{ 
              strokeDashoffset: `${2 * Math.PI * 45 * (1 - progress / 100)}` 
            }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </svg>

        {/* Timer Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-lg font-bold font-mono ${getTimerColor()}`}
            animate={isCritical ? {
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1]
            } : {}}
            transition={isCritical ? {
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            } : {}}
          >
            {seconds}
          </motion.span>
        </div>
      </div>

      {/* Phase Label */}
      <motion.div
        className="ml-3 text-sm font-mono text-muted-foreground"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="capitalize">{phase}</div>
        <div className="text-xs opacity-60">
          {Math.floor(timeLeft / 1000)}.{Math.floor((timeLeft % 1000) / 100)}s
        </div>
      </motion.div>
    </motion.div>
  )
}

export function PhaseTimer({ 
  phase, 
  isActive,
  onPhaseComplete 
}: { 
  phase: GamePhase
  isActive: boolean
  onPhaseComplete?: (() => void) | undefined 
}) {
  const PHASE_DURATIONS: Record<GamePhase, number> = {
    draw: 2000,    // 2 seconds
    action: 0,     // No timer for player actions
    enemy: 3000,   // 3 seconds
    cleanup: 1500  // 1.5 seconds
  }

  const duration = PHASE_DURATIONS[phase]

  if (duration <= 0) {
    return null
  }

  return (
    <TurnTimer
      phase={phase}
      duration={duration}
      isActive={isActive}
      onTimeUp={onPhaseComplete}
    />
  )
}