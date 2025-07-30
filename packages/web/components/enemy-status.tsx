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

      {/* Intent - Enhanced with Threat Level */}
      <motion.div 
        className={`rounded-lg p-3 lg:p-4 relative overflow-hidden ${
          enemy.damage >= 10 ? 'bg-red-500/10 border-2 border-red-500/30' :
          enemy.damage >= 5 ? 'bg-yellow-500/10 border-2 border-yellow-500/30' :
          'bg-game-border/30 border border-game-border'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Danger Warning for High Damage */}
        {enemy.damage >= 10 && (
          <motion.div
            className="absolute top-1 right-1"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <span className="text-red-500 text-lg">⚠️</span>
          </motion.div>
        )}
        <div className="flex items-center gap-2 mb-3">
          <motion.span 
            className="text-lg"
            animate={{ 
              scale: enemy.damage >= 8 ? [1, 1.3, 1] : [1, 1.1, 1],
              rotate: enemy.damage >= 8 ? [0, -15, 15, 0] : [0, 5, -5, 0]
            }}
            transition={{ 
              duration: enemy.damage >= 8 ? 1 : 2, 
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            💭
          </motion.span>
          <span className="text-xs lg:text-sm font-mono text-muted-foreground font-semibold">
            {enemy.damage >= 10 ? 'DANGEROUS INTENT' :
             enemy.damage >= 5 ? 'Threatening Intent' : 'Intent'}
          </span>
        </div>

        <motion.div
          className="mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className={`text-xs lg:text-sm font-semibold ${
            enemy.damage >= 8 ? 'text-red-400' : 'terminal-text'
          }`}>
            {enemy.intent}
          </p>
        </motion.div>
        
        {/* Enhanced Damage Preview */}
        {enemy.damage !== undefined && enemy.damage > 0 && (
          <motion.div
            className={`flex items-center justify-between p-3 rounded-lg ${
              enemy.damage >= 10 ? 'bg-red-500/20 border border-red-500/40' :
              enemy.damage >= 5 ? 'bg-yellow-500/20 border border-yellow-500/40' :
              'bg-attack/10 border border-attack/30'
            }`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, 0],
                  scale: enemy.damage >= 8 ? [1, 1.2, 1] : [1, 1.1, 1]
                }}
                transition={{ 
                  duration: enemy.damage >= 8 ? 0.8 : 1.5, 
                  repeat: Infinity 
                }}
                className="text-2xl"
              >
                {enemy.damage >= 10 ? '💥' : enemy.damage >= 5 ? '⚔️' : '🔥'}
              </motion.div>
              <div>
                <div className={`text-xl font-bold ${
                  enemy.damage >= 10 ? 'text-red-400' :
                  enemy.damage >= 5 ? 'text-yellow-400' : 'text-attack'
                }`}>
                  {enemy.damage}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {enemy.damage >= 10 ? 'MASSIVE DMG' :
                   enemy.damage >= 5 ? 'Heavy Damage' : 'damage'}
                </div>
              </div>
            </div>
            
            {/* Threat Level Indicator */}
            <div className="flex flex-col items-end">
              <div className={`text-xs font-mono font-bold ${
                enemy.damage >= 10 ? 'text-red-400' :
                enemy.damage >= 5 ? 'text-yellow-400' : 'text-muted-foreground'
              }`}>
                {enemy.damage >= 10 ? 'LETHAL' :
                 enemy.damage >= 8 ? 'DANGEROUS' :
                 enemy.damage >= 5 ? 'MODERATE' : 'MINOR'}
              </div>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded-full ${
                      i < Math.ceil(enemy.damage / 3) 
                        ? (enemy.damage >= 10 ? 'bg-red-500' :
                           enemy.damage >= 5 ? 'bg-yellow-500' : 'bg-orange-500')
                        : 'bg-game-border/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}