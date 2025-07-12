'use client'

import { motion } from 'framer-motion'
import type { Enemy } from '@effect-deck/core'
import { formatHealth, getHealthPercentage } from '@/lib/utils'

interface EnemyStatusProps {
  enemy: Enemy
}

export function EnemyStatus({ enemy }: EnemyStatusProps) {
  const healthPercentage = getHealthPercentage(enemy.health, enemy.maxHealth)
  
  return (
    <motion.div
      className="game-card p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Enemy Name */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold terminal-text">{enemy.name}</h2>
        <span className="text-sm text-muted-foreground font-mono">#{enemy.id}</span>
      </div>
      
      {/* Health Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-mono text-muted-foreground">Health</span>
          <span className="text-sm font-mono">
            {formatHealth(enemy.health, enemy.maxHealth)}
          </span>
        </div>
        <div className="health-bar">
          <motion.div
            className="health-fill"
            style={{ width: `${healthPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Shield */}
      {enemy.shield > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span className="text-sm font-mono text-muted-foreground">Shield</span>
            <span className="text-sm font-mono text-defense">{enemy.shield}</span>
          </div>
        </div>
      )}

      {/* Intent */}
      <div className="bg-game-border/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">💭</span>
          <span className="text-sm font-mono text-muted-foreground">Intent</span>
        </div>
        <motion.p
          className="text-sm terminal-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {enemy.intent}
        </motion.p>
        
        {/* Damage Preview */}
        {enemy.damage !== undefined && enemy.damage > 0 && (
          <motion.div
            className="mt-2 flex items-center gap-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-lg">⚔️</span>
            <span className="text-lg font-bold text-attack">{enemy.damage}</span>
            <span className="text-xs text-muted-foreground font-mono">damage</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}