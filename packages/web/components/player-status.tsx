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
      className="game-card p-4 lg:p-6 space-y-4 lg:space-y-5"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
    >
      {/* Player Title */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2"
      >
        <motion.span
          className="text-2xl"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        >
          🧙‍♂️
        </motion.span>
        <h2 className="text-lg lg:text-xl font-bold terminal-text">{title}</h2>
      </motion.div>
      
      {/* Health Bar */}
      <motion.div
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
            key={player.health}
            initial={{ scale: 1.2, color: "rgb(239 68 68)" }}
            animate={{ scale: 1, color: "rgb(255 255 255)" }}
            transition={{ duration: 0.3 }}
          >
            {formatHealth(player.health, player.maxHealth)}
          </motion.span>
        </div>
        <div className="health-bar relative overflow-hidden">
          <motion.div
            className="health-fill"
            style={{ width: `${healthPercentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </motion.div>

      {/* Shield */}
      {player.shield > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="bg-defense/10 border border-defense/30 rounded-lg p-3"
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
              key={player.shield}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {player.shield}
            </motion.span>
          </div>
        </motion.div>
      )}

      {/* Energy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-400">⚡</span>
            <span className="text-xs lg:text-sm font-mono text-muted-foreground">Energy</span>
          </div>
          <motion.span 
            className="text-xs lg:text-sm font-mono font-bold"
            key={player.energy}
            initial={{ scale: 1.2, color: "rgb(59 130 246)" }}
            animate={{ scale: 1, color: "rgb(255 255 255)" }}
            transition={{ duration: 0.3 }}
          >
            {player.energy}/{player.maxEnergy}
          </motion.span>
        </div>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: player.maxEnergy }, (_, i) => (
            <motion.div
              key={i}
              className={`energy-orb ${
                i < player.energy ? 'energy-available' : 'energy-used'
              }`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: i * 0.1, 
                duration: 0.3,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ scale: 1.1, y: -2 }}
            >
              {i + 1}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Active Contexts */}
      {player.contexts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <motion.span
              className="text-lg"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              ⚙️
            </motion.span>
            <span className="text-xs lg:text-sm font-mono text-muted-foreground">Active Effects</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {player.contexts.map((context, index) => (
              <motion.span
                key={index}
                className="text-xs bg-context/20 text-context border border-context/50 rounded px-2 py-1 font-mono hover:bg-context/30 transition-colors"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.05, y: -1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {context}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Deck & Discard Info */}
      <motion.div 
        className="flex justify-between pt-4 border-t border-game-border/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div 
          className="text-center group cursor-pointer"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-xs text-muted-foreground font-mono group-hover:text-game-accent transition-colors">📚 Deck</div>
          <motion.div 
            className="text-base lg:text-lg font-bold terminal-text"
            key={player.deck.length}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {player.deck.length}
          </motion.div>
        </motion.div>
        <motion.div 
          className="text-center group cursor-pointer"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-xs text-muted-foreground font-mono group-hover:text-game-accent transition-colors">🃏 Hand</div>
          <motion.div 
            className="text-base lg:text-lg font-bold terminal-text"
            key={player.hand.length}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {player.hand.length}
          </motion.div>
        </motion.div>
        <motion.div 
          className="text-center group cursor-pointer"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="text-xs text-muted-foreground font-mono group-hover:text-game-accent transition-colors">🗂️ Discard</div>
          <motion.div 
            className="text-base lg:text-lg font-bold terminal-text"
            key={player.discard.length}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {player.discard.length}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}