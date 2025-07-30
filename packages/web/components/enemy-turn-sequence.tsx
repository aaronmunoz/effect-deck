'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import type { Enemy } from '@effect-deck/core'

interface EnemyTurnSequenceProps {
  enemy: Enemy
  isEnemyTurn: boolean
  onSequenceComplete?: () => void
}

interface EnemyActionStep {
  type: 'intent' | 'targeting' | 'execute' | 'complete'
  duration: number
}

const ENEMY_SEQUENCE: EnemyActionStep[] = [
  { type: 'intent', duration: 1500 },    // Show what enemy plans to do
  { type: 'targeting', duration: 800 },  // Show targeting/preparation
  { type: 'execute', duration: 1200 },   // Execute the action
  { type: 'complete', duration: 500 }    // Brief pause before ending
]

export function EnemyTurnSequence({ enemy, isEnemyTurn, onSequenceComplete }: EnemyTurnSequenceProps) {
  const [currentStep, setCurrentStep] = useState<EnemyActionStep['type']>('intent')
  const [stepProgress, setStepProgress] = useState(0)
  const [isSequenceActive, setIsSequenceActive] = useState(false)

  useEffect(() => {
    if (!isEnemyTurn) {
      setIsSequenceActive(false)
      setCurrentStep('intent')
      setStepProgress(0)
      return
    }

    setIsSequenceActive(true)
    let currentStepIndex = 0
    let stepStartTime = Date.now()

    const runSequence = () => {
      const step = ENEMY_SEQUENCE[currentStepIndex]
      if (!step) {
        setIsSequenceActive(false)
        onSequenceComplete?.()
        return
      }

      const updateProgress = () => {
        const elapsed = Date.now() - stepStartTime
        const progress = Math.min(elapsed / step.duration, 1)
        
        setCurrentStep(step.type)
        setStepProgress(progress)

        if (progress >= 1) {
          currentStepIndex++
          stepStartTime = Date.now()
          setTimeout(runSequence, 50)
        } else {
          requestAnimationFrame(updateProgress)
        }
      }

      updateProgress()
    }

    runSequence()
  }, [isEnemyTurn, onSequenceComplete])

  if (!isSequenceActive) {
    return null
  }

  const getStepIcon = () => {
    switch (currentStep) {
      case 'intent': return '💭'
      case 'targeting': return '🎯' 
      case 'execute': return '⚔️'
      case 'complete': return '✅'
      default: return '💭'
    }
  }

  const getStepMessage = () => {
    switch (currentStep) {
      case 'intent': return `${enemy.name} is planning...`
      case 'targeting': return `${enemy.name} is preparing to attack!`
      case 'execute': return `${enemy.name} attacks!`
      case 'complete': return `${enemy.name} finishes their turn`
      default: return 'Enemy is thinking...'
    }
  }

  const getStepColor = () => {
    switch (currentStep) {
      case 'intent': return 'text-blue-400'
      case 'targeting': return 'text-yellow-400'
      case 'execute': return 'text-red-400'
      case 'complete': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-game-card border-2 border-game-danger rounded-xl p-8 text-center max-w-lg mx-4"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -50 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Enemy Intent Display */}
        <motion.div
          className="mb-6"
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-6xl mb-4"
            animate={currentStep === 'execute' ? {
              scale: [1, 1.3, 1],
              rotate: [0, -15, 15, 0]
            } : {
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: currentStep === 'execute' ? 0.6 : 1.5,
              repeat: currentStep === 'execute' ? 2 : Infinity,
              repeatType: "reverse"
            }}
          >
            {getStepIcon()}
          </motion.div>

          <h2 className={`text-2xl font-bold mb-4 ${getStepColor()}`}>
            {getStepMessage()}
          </h2>

          {/* Intent Details */}
          {currentStep === 'intent' && (
            <motion.div
              className="bg-game-danger/10 border border-game-danger/30 rounded-lg p-4 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-lg font-semibold text-game-danger mb-2">
                {enemy.intent}
              </div>
              {enemy.damage > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">💥</span>
                  <span className="text-xl font-bold text-red-400">
                    {enemy.damage} damage incoming!
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Targeting Phase */}
          {currentStep === 'targeting' && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-yellow-400 font-semibold mb-2">
                🎯 Targeting Player
              </div>
              <motion.div
                className="w-16 h-16 mx-auto border-4 border-yellow-400 rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  borderColor: ['#facc15', '#ef4444', '#facc15']
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
              />
            </motion.div>
          )}

          {/* Execution Phase */}
          {currentStep === 'execute' && (
            <motion.div
              className="mb-4"
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-red-400 font-bold text-xl mb-2">
                💥 ATTACK!
              </div>
              {enemy.damage > 0 && (
                <motion.div
                  className="text-4xl font-bold text-red-400"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{ duration: 0.4, repeat: 2 }}
                >
                  -{enemy.damage}
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-game-border/30 rounded-full h-2 mb-4">
          <motion.div
            className={`h-2 rounded-full transition-colors duration-300 ${
              currentStep === 'intent' ? 'bg-blue-400' :
              currentStep === 'targeting' ? 'bg-yellow-400' :
              currentStep === 'execute' ? 'bg-red-400' : 'bg-green-400'
            }`}
            initial={{ width: "0%" }}
            animate={{ width: `${stepProgress * 100}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center gap-2">
          {ENEMY_SEQUENCE.map((step, index) => (
            <motion.div
              key={step.type}
              className={`w-3 h-3 rounded-full border-2 ${
                ENEMY_SEQUENCE.findIndex(s => s.type === currentStep) >= index
                  ? 'bg-current border-current'
                  : 'border-game-border/50'
              }`}
              animate={{
                scale: ENEMY_SEQUENCE.findIndex(s => s.type === currentStep) === index ? 1.2 : 1
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}