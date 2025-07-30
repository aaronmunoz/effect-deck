'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { PhaseTimer } from './turn-timer'

type GamePhase = 'draw' | 'action' | 'enemy' | 'cleanup'

interface TurnIndicatorProps {
  phase: GamePhase
  turnNumber: number
  onPhaseComplete?: () => void
}

interface PhaseInfo {
  name: string
  icon: string
  color: string
  description: string
  gradient: string
}

const PHASE_INFO: Record<GamePhase, PhaseInfo> = {
  draw: {
    name: 'Draw Phase',
    icon: '🃏',
    color: 'text-game-info',
    description: 'Drawing cards...',
    gradient: 'from-game-info/20 to-game-info/5'
  },
  action: {
    name: 'Action Phase',
    icon: '⚔️',
    color: 'text-game-accent',
    description: 'Your turn to act',
    gradient: 'from-game-accent/20 to-game-accent/5'
  },
  enemy: {
    name: 'Enemy Phase',
    icon: '👹',
    color: 'text-game-danger',
    description: 'Enemy is acting...',
    gradient: 'from-game-danger/20 to-game-danger/5'
  },
  cleanup: {
    name: 'End Phase',
    icon: '🧹',
    color: 'text-game-context',
    description: 'Resolving effects...',
    gradient: 'from-game-context/20 to-game-context/5'
  }
}

export function TurnIndicator({ phase, turnNumber, onPhaseComplete }: TurnIndicatorProps) {
  const phaseInfo = PHASE_INFO[phase]
  if (!phaseInfo) {
    console.warn(`Unknown phase: ${phase}`)
    return null
  }

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Turn Display */}
      <motion.div
        className={`bg-gradient-to-r ${phaseInfo.gradient} backdrop-blur-sm border-2 border-game-border/50 rounded-xl p-4 lg:p-6 text-center relative overflow-hidden`}
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1, type: "spring" }}
      >
        {/* Background Glow Effect */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${phaseInfo.gradient} opacity-50`}
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Turn Number */}
        <motion.div 
          className="mb-2 relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-xs lg:text-sm text-muted-foreground font-mono uppercase tracking-wide">
            Turn {turnNumber}
          </span>
        </motion.div>

        {/* Phase Icon and Name */}
        <motion.div 
          className="flex items-center justify-center gap-3 mb-3 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <motion.span
            className="text-3xl lg:text-4xl"
            animate={{ 
              rotate: phase === 'action' ? [0, -10, 10, 0] : [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: phase === 'action' ? 1.5 : 2.5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {phaseInfo.icon}
          </motion.span>
          <motion.h2 
            className={`text-lg lg:text-xl font-bold ${phaseInfo.color}`}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {phaseInfo.name}
          </motion.h2>
        </motion.div>

        {/* Phase Description */}
        <motion.p 
          className="text-xs lg:text-sm text-muted-foreground font-mono relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {phaseInfo.description}
        </motion.p>

        {/* Timer and Progress Indicator */}
        <motion.div 
          className="mt-4 relative z-10 flex items-center justify-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {/* Phase Timer */}
          <PhaseTimer
            phase={phase}
            isActive={true}
            onPhaseComplete={onPhaseComplete}
          />
          
          {/* Progress Bar for Action Phase */}
          {phase === 'action' && (
            <div className="flex-1 max-w-xs">
              <div className="w-full bg-game-border/30 rounded-full h-1">
                <div className="h-1 rounded-full bg-game-accent/60 w-0" />
              </div>
              <div className="text-xs text-muted-foreground text-center mt-1 font-mono">
                Take your time
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Side Indicators */}
      <AnimatePresence>
        {phase === 'action' && (
          <motion.div
            className="absolute -left-2 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, x: -10, scale: 0 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              className="w-3 h-3 bg-game-accent rounded-full shadow-lg"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}

        {phase === 'enemy' && (
          <motion.div
            className="absolute -right-2 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, x: 10, scale: 0 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              className="w-3 h-3 bg-game-danger rounded-full shadow-lg"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function PhaseTransition({ 
  fromPhase, 
  toPhase, 
  onComplete 
}: { 
  fromPhase: GamePhase
  toPhase: GamePhase
  onComplete: () => void 
}) {
  const fromInfo = PHASE_INFO[fromPhase]
  const toInfo = PHASE_INFO[toPhase]
  
  if (!fromInfo || !toInfo) {
    console.warn(`Unknown phase transition: ${fromPhase} -> ${toPhase}`)
    return null
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="bg-game-card border-2 border-game-border rounded-xl p-8 text-center max-w-md mx-4"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: -50 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* From Phase */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <span className="text-2xl">{fromInfo.icon}</span>
          <p className={`text-sm ${fromInfo.color} font-mono`}>{fromInfo.name} Complete</p>
        </motion.div>

        {/* Transition Arrow */}
        <motion.div
          className="mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <div className="text-2xl">⬇️</div>
        </motion.div>

        {/* To Phase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <span className="text-3xl">{toInfo.icon}</span>
          <h3 className={`text-lg font-bold ${toInfo.color} mt-2`}>{toInfo.name}</h3>
          <p className="text-sm text-muted-foreground font-mono mt-1">{toInfo.description}</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}