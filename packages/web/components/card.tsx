'use client'

import { motion } from 'framer-motion'
import type { Card } from '@effect-deck/core'
import { cn, getCardTypeColor, getCardTypeIcon } from '@/lib/utils'

interface CardProps {
  card: Card
  isSelected?: boolean
  isPlayable?: boolean
  onClick?: () => void
  className?: string
  isPlaying?: boolean
}

export function GameCard({ 
  card, 
  isSelected = false, 
  isPlayable = true, 
  onClick, 
  className,
  isPlaying = false
}: CardProps) {
  return (
    <motion.div
      layout
      onClick={isPlayable ? onClick : undefined}
      className={cn(
        'game-card group relative cursor-pointer select-none overflow-hidden',
        'w-48 h-64 flex flex-col',
        'backdrop-blur-sm bg-game-card/90 border-2',
        'transition-all duration-300 ease-out',
        getCardTypeColor(card.type),
        {
          'game-card-selected ring-2 ring-game-accent/50 shadow-lg shadow-game-accent/25': isSelected,
          'opacity-60 cursor-not-allowed grayscale': !isPlayable,
          'hover:shadow-xl hover:shadow-black/20 hover:-translate-y-2': isPlayable,
          'hover:border-opacity-80': isPlayable,
        },
        className
      )}
      whileHover={isPlayable && !isPlaying ? { 
        scale: 1.02,
        rotateY: 2,
        rotateX: -2
      } : {}}
      whileTap={isPlayable && !isPlaying ? { scale: 0.98 } : {}}
      animate={isPlaying ? {
        scale: [1, 1.1, 0.9, 1.2, 0],
        rotateY: [0, 15, -15, 0],
        opacity: [1, 1, 1, 0.8, 0]
      } : {
        opacity: 1, 
        y: 0, 
        rotateX: 0,
        scale: 1,
        rotateY: 0
      }}
      initial={{ opacity: 0, y: 20, rotateX: -10 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ 
        duration: 0.4,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <motion.span 
            className="text-xl transition-transform duration-200 group-hover:scale-110"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {getCardTypeIcon(card.type)}
          </motion.span>
          <span className="text-xs uppercase tracking-widest text-muted-foreground/80 font-mono font-semibold">
            {card.type}
          </span>
        </div>
        <motion.div 
          className={cn(
            "energy-orb transition-all duration-300",
            isPlayable ? "energy-available" : "energy-used"
          )}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          {card.cost}
        </motion.div>
      </div>

      {/* Card Name */}
      <motion.h3 
        className="text-lg font-bold mb-3 text-foreground leading-tight tracking-wide relative z-10"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
      >
        {card.name}
      </motion.h3>

      {/* Card Description */}
      <motion.div 
        className="flex-1 mb-4 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <p className="text-sm text-muted-foreground/90 leading-relaxed font-medium">
          {card.description}
        </p>
      </motion.div>

      {/* Card Footer */}
      <motion.div 
        className="mt-auto relative z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="text-xs text-muted-foreground/50 font-mono opacity-60 group-hover:opacity-80 transition-opacity">
          ID: {card.id}
        </div>
      </motion.div>

      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none" />
      
      {/* Selection Glow Effect */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 rounded-lg border-2 border-game-accent/60 shadow-[0_0_20px_rgba(0,255,65,0.3)]" />
          <div className="absolute inset-0 rounded-lg bg-game-accent/5" />
        </motion.div>
      )}

      {/* Playability Indicator */}
      {!isPlayable && (
        <motion.div 
          className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-2xl mb-1">🚫</div>
            <span className="text-xs font-mono text-game-danger font-semibold tracking-wide">
              Cannot Play
            </span>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}