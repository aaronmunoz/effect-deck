'use client'

import { motion } from 'framer-motion'
import { Play, Square, Zap, Clock } from 'lucide-react'
import type { Card } from '@effect-deck/core'

interface ActionButtonsProps {
  selectedCard: Card | null
  canPlayCard: boolean
  canEndTurn: boolean
  onPlayCard: () => void
  onEndTurn: () => void
  isLoading: boolean
}

export function ActionButtons({
  selectedCard,
  canPlayCard,
  canEndTurn,
  onPlayCard,
  onEndTurn,
  isLoading,
}: ActionButtonsProps) {
  return (
    <div className="game-card">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-game-border">
        <span className="text-lg">🎮</span>
        <h3 className="font-bold terminal-text">Actions</h3>
      </div>

      <div className="space-y-3">
        {/* Play Card Button */}
        <motion.button
          onClick={onPlayCard}
          disabled={!canPlayCard || isLoading}
          className={`w-full game-button p-4 relative overflow-hidden ${
            canPlayCard ? 'game-button-primary' : 'opacity-50 cursor-not-allowed'
          }`}
          whileHover={canPlayCard ? { scale: 1.02 } : {}}
          whileTap={canPlayCard ? { scale: 0.98 } : {}}
        >
          <div className="flex items-center justify-center gap-3">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
              />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span className="font-semibold">
              Play Card
            </span>
          </div>
          
          {/* Card Preview */}
          {selectedCard && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-xs text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-muted-foreground">Playing:</span>
                <span className="font-mono">{selectedCard.name}</span>
                <div className="energy-orb energy-available text-xs">
                  {selectedCard.cost}
                </div>
              </div>
            </motion.div>
          )}
        </motion.button>

        {/* End Turn Button */}
        <motion.button
          onClick={onEndTurn}
          disabled={!canEndTurn || isLoading}
          className={`w-full game-button p-4 ${
            canEndTurn ? 'hover:border-game-warning hover:bg-game-warning/10' : 'opacity-50 cursor-not-allowed'
          }`}
          whileHover={canEndTurn ? { scale: 1.02 } : {}}
          whileTap={canEndTurn ? { scale: 0.98 } : {}}
        >
          <div className="flex items-center justify-center gap-3">
            <Square className="w-5 h-5" />
            <span className="font-semibold">End Turn</span>
          </div>
        </motion.button>

        {/* Quick Actions */}
        <div className="border-t border-game-border pt-3">
          <div className="text-xs text-muted-foreground mb-2 font-mono">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              className="game-button p-2 text-xs"
              disabled={isLoading}
            >
              <Zap className="w-4 h-4 mx-auto mb-1" />
              <div>Skip</div>
            </button>
            <button
              className="game-button p-2 text-xs"
              disabled={isLoading}
            >
              <Clock className="w-4 h-4 mx-auto mb-1" />
              <div>Wait</div>
            </button>
          </div>
        </div>
      </div>

      {/* Action Hints */}
      <div className="mt-4 pt-3 border-t border-game-border">
        <div className="text-xs text-muted-foreground space-y-1">
          {!selectedCard && (
            <div>• Select a card from your hand to play</div>
          )}
          {selectedCard && !canPlayCard && (
            <div className="text-game-warning">• Not enough energy to play this card</div>
          )}
          {canPlayCard && (
            <div className="text-game-success">• Ready to play selected card</div>
          )}
        </div>
      </div>
    </div>
  )
}