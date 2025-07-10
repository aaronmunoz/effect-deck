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
}

export function GameCard({ 
  card, 
  isSelected = false, 
  isPlayable = true, 
  onClick, 
  className 
}: CardProps) {
  return (
    <motion.div
      layout
      onClick={isPlayable ? onClick : undefined}
      className={cn(
        'game-card relative cursor-pointer select-none',
        'w-48 h-64 flex flex-col',
        getCardTypeColor(card.type),
        {
          'game-card-selected': isSelected,
          'opacity-50 cursor-not-allowed': !isPlayable,
          'hover:scale-105': isPlayable,
        },
        className
      )}
      whileHover={isPlayable ? { y: -8 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCardTypeIcon(card.type)}</span>
          <span className="text-xs uppercase tracking-wide text-muted-foreground font-mono">
            {card.type}
          </span>
        </div>
        <div className="energy-orb energy-available">
          {card.cost}
        </div>
      </div>

      {/* Card Name */}
      <h3 className="text-lg font-bold mb-2 text-foreground leading-tight">
        {card.name}
      </h3>

      {/* Card Description */}
      <div className="flex-1 mb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {card.description}
        </p>
      </div>

      {/* Card Footer */}
      <div className="mt-auto">
        <div className="text-xs text-muted-foreground font-mono opacity-60">
          ID: {card.id}
        </div>
      </div>

      {/* Selection Glow Effect */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-game-accent opacity-50 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Playability Indicator */}
      {!isPlayable && (
        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
          <span className="text-xs font-mono text-game-danger">
            Cannot Play
          </span>
        </div>
      )}
    </motion.div>
  )
}