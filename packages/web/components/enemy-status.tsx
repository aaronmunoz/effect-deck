'use client'

import { motion } from 'framer-motion'
import type { Enemy } from '@effect-deck/core'
import { formatHealth, getHealthPercentage } from '@/lib/utils'
import { useEffect, useRef } from 'react'

interface EnemyStatusProps {
  enemy: Enemy
}

export function EnemyStatus({ enemy }: EnemyStatusProps) {
  const healthPercentage = getHealthPercentage(enemy.health, enemy.maxHealth)
  const previousHealthRef = useRef(enemy.health)
  const previousShieldRef = useRef(enemy.shield)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Damage shake animation when health decreases
  useEffect(() => {
    if (enemy.health < previousHealthRef.current) {
      // Health decreased - trigger damage shake
      if (containerRef.current) {
        containerRef.current.style.animation = 'none'
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.animation = 'damage-shake 0.4s ease-out'
          }
        }, 10)
      }
    }
    previousHealthRef.current = enemy.health
  }, [enemy.health])

  // Shield flash animation when shield changes
  useEffect(() => {
    if (enemy.shield !== previousShieldRef.current) {
      // Shield changed
      previousShieldRef.current = enemy.shield
    }
  }, [enemy.shield])

  return (
    <motion.div
      ref={containerRef}
      className="game-card p-4 lg:p-6 relative"
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring" }}
    >
      {/* Enemy Name */}
      <motion.div 
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <motion.span
            className="text-2xl"
            animate={{ 
              rotate: [0, -5, 5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          >
            👹
          </motion.span>
          <h2 className="text-lg lg:text-xl font-bold terminal-text">{enemy.name}</h2>
        </div>
        <span className="text-xs lg:text-sm text-muted-foreground font-mono">#{enemy.id}</span>
      </motion.div>
      
      {/* Health Bar */}
      <motion.div 
        className="mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-red-500">❤️</span>
            <span className="text-xs lg:text-sm font-mono text-muted-foreground">Health</span>
          </div>
          <motion.span 
            className="text-xs lg:text-sm font-mono font-bold"
            key={enemy.health}
            initial={{ scale: 1.2, color: "rgb(239 68 68)" }}
            animate={{ scale: 1, color: "rgb(255 255 255)" }}
            transition={{ duration: 0.3 }}
          >
            {formatHealth(enemy.health, enemy.maxHealth)}
          </motion.span>
        </div>
        <div className="health-bar relative overflow-hidden">
          <motion.div
            className="health-fill"
            style={{ width: `${healthPercentage}%` }}
            initial={{ width: '100%' }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {/* Damage flash overlay */}
          <motion.div
            className="absolute inset-0 bg-red-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: enemy.health < previousHealthRef.current ? [0, 0.8, 0] : 0 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Shield */}
      {enemy.shield > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mb-4 bg-defense/10 border border-defense/30 rounded-lg p-3"
        >
          <div className="flex items-center gap-2">
            <motion.span
              className="text-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🛡️
            </motion.span>
            <span className="text-xs lg:text-sm font-mono text-muted-foreground">Shield</span>
            <motion.span 
              className="text-xs lg:text-sm font-mono text-defense font-bold"
              key={enemy.shield}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {enemy.shield}
            </motion.span>
          </div>
        </motion.div>
      )}

      {/* Intent */}
      <motion.div 
        className="bg-game-border/30 rounded-lg p-3 lg:p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <motion.span 
            className="text-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💭
          </motion.span>
          <span className="text-xs lg:text-sm font-mono text-muted-foreground">Intent</span>
        </div>
        <motion.p
          className="text-xs lg:text-sm terminal-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {enemy.intent}
        </motion.p>
        
        {/* Damage Preview */}
        {enemy.damage !== undefined && enemy.damage > 0 && (
          <motion.div
            className="mt-2 flex items-center gap-2 bg-attack/10 border border-attack/30 rounded p-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.span 
              className="text-base lg:text-lg"
              animate={{ 
                rotate: [0, -10, 10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ⚔️
            </motion.span>
            <span className="text-base lg:text-lg font-bold text-attack">{enemy.damage}</span>
            <span className="text-xs text-muted-foreground font-mono">damage</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}