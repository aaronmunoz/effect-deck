'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface DamageNumber {
  id: string
  value: number
  type: 'damage' | 'heal' | 'shield' | 'energy'
  x: number
  y: number
  timestamp: number
}

export interface BattleEffect {
  id: string
  type: 'screen-shake' | 'particle-burst' | 'impact-wave'
  duration: number
  intensity: number
  timestamp: number
}

interface BattleEffectsProps {
  damageNumbers: DamageNumber[]
  effects: BattleEffect[]
  onEffectComplete: (id: string) => void
}

export function BattleEffects({ damageNumbers, effects, onEffectComplete }: BattleEffectsProps) {
  const [screenShake, setScreenShake] = useState(false)

  // Handle screen shake effects
  useEffect(() => {
    const shakeEffect = effects.find(e => e.type === 'screen-shake')
    if (shakeEffect) {
      setScreenShake(true)
      const timer = setTimeout(() => {
        setScreenShake(false)
        onEffectComplete(shakeEffect.id)
      }, shakeEffect.duration)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [effects, onEffectComplete])

  return (
    <>
      {/* Screen Shake Container */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50"
        animate={screenShake ? {
          x: [0, -2, 2, -2, 2, 0],
          y: [0, -1, 1, -1, 1, 0]
        } : {}}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut",
          repeat: screenShake ? 2 : 0 
        }}
      />

      {/* Damage Numbers */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <AnimatePresence>
          {damageNumbers.map((damage) => (
            <DamageNumberComponent
              key={damage.id}
              damage={damage}
              onComplete={() => onEffectComplete(damage.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Particle Effects */}
      <div className="fixed inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {effects.filter(e => e.type === 'particle-burst').map((effect) => (
            <ParticleEffect
              key={effect.id}
              effect={effect}
              onComplete={() => onEffectComplete(effect.id)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Impact Waves */}
      <div className="fixed inset-0 pointer-events-none z-20">
        <AnimatePresence>
          {effects.filter(e => e.type === 'impact-wave').map((effect) => (
            <ImpactWave
              key={effect.id}
              effect={effect}
              onComplete={() => onEffectComplete(effect.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

function DamageNumberComponent({ damage, onComplete }: { damage: DamageNumber; onComplete: () => void }) {
  const getColorClass = (type: DamageNumber['type']) => {
    switch (type) {
      case 'damage': return 'text-game-danger'
      case 'heal': return 'text-game-success'
      case 'shield': return 'text-defense'
      case 'energy': return 'text-game-info'
      default: return 'text-white'
    }
  }

  const getIcon = (type: DamageNumber['type']) => {
    switch (type) {
      case 'damage': return '💥'
      case 'heal': return '💚'
      case 'shield': return '🛡️'
      case 'energy': return '⚡'
      default: return ''
    }
  }

  return (
    <motion.div
      className="absolute"
      style={{ left: damage.x, top: damage.y }}
      initial={{ 
        opacity: 0, 
        scale: 0.5, 
        y: 0,
        rotate: -10
      }}
      animate={{ 
        opacity: [0, 1, 1, 0], 
        scale: [0.5, 1.2, 1.4, 1],
        y: [-20, -40, -60, -80],
        rotate: [10, 0, -5, 0]
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        duration: 1.5,
        times: [0, 0.2, 0.8, 1],
        ease: "easeOut"
      }}
      onAnimationComplete={onComplete}
    >
      <div className={`flex items-center gap-1 font-bold text-2xl ${getColorClass(damage.type)} drop-shadow-lg`}>
        <span>{getIcon(damage.type)}</span>
        <span className="font-mono">
          {damage.type === 'damage' ? '-' : '+'}
          {damage.value}
        </span>
      </div>
    </motion.div>
  )
}

function ParticleEffect({ effect, onComplete }: { effect: BattleEffect; onComplete: () => void }) {
  const particleCount = Math.min(effect.intensity * 3, 15)
  
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-game-accent rounded-full"
          style={{
            left: '50%',
            top: '50%',
          }}
          initial={{ 
            scale: 0,
            x: 0,
            y: 0,
            opacity: 1
          }}
          animate={{
            scale: [0, 1, 0],
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 200,
            opacity: [1, 0.8, 0]
          }}
          transition={{
            duration: effect.duration / 1000,
            delay: i * 0.05,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  )
}

function ImpactWave({ effect, onComplete }: { effect: BattleEffect; onComplete: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        className="border-4 border-game-accent rounded-full"
        initial={{ 
          scale: 0,
          opacity: 0.8,
          borderWidth: 8
        }}
        animate={{ 
          scale: effect.intensity * 2,
          opacity: 0,
          borderWidth: 0
        }}
        transition={{
          duration: effect.duration / 1000,
          ease: "easeOut"
        }}
        style={{
          width: 100,
          height: 100
        }}
      />
    </motion.div>
  )
}