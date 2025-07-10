'use client'

import { motion } from 'framer-motion'
import type { Player } from '@effect-deck/core'
import { formatHealth, getHealthPercentage } from '@/lib/utils'

interface PlayerStatusProps {
  player: Player
  title?: string
}

export function PlayerStatus({ player, title = 'Player' }: PlayerStatusProps) {
  const healthPercentage = getHealthPercentage(player.health, player.maxHealth)
  
  return (
    <motion.div
      className="game-card p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Player Title */}
      <h2 className="text-xl font-bold mb-4 terminal-text">{title}</h2>
      
      {/* Health Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-mono text-muted-foreground">Health</span>
          <span className="text-sm font-mono">
            {formatHealth(player.health, player.maxHealth)}
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
      {player.shield > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span className="text-sm font-mono text-muted-foreground">Shield</span>
            <span className="text-sm font-mono text-defense">{player.shield}</span>
          </div>
        </div>
      )}

      {/* Energy */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-mono text-muted-foreground">Energy</span>
          <span className="text-sm font-mono">
            {player.energy}/{player.maxEnergy}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: player.maxEnergy }, (_, i) => (
            <motion.div
              key={i}
              className={`energy-orb ${
                i < player.energy ? 'energy-available' : 'energy-used'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.2 }}
            >
              {i + 1}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Contexts */}
      {player.contexts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚙️</span>
            <span className="text-sm font-mono text-muted-foreground">Active Effects</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {player.contexts.map((context, index) => (
              <motion.span
                key={index}
                className="text-xs bg-context/20 text-context border border-context/50 rounded px-2 py-1 font-mono"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {context}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Deck & Discard Info */}
      <div className="flex justify-between mt-4 pt-4 border-t border-game-border">
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-mono">Deck</div>
          <div className="text-lg font-bold terminal-text">{player.deck.length}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-mono">Hand</div>
          <div className="text-lg font-bold terminal-text">{player.hand.length}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-mono">Discard</div>
          <div className="text-lg font-bold terminal-text">{player.discard.length}</div>
        </div>
      </div>
    </motion.div>
  )
}