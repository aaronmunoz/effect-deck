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
    <motion.div 
      className="game-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="flex items-center gap-2 mb-4 pb-2 border-b border-game-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <motion.span 
          className="text-lg"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          🎮
        </motion.span>
        <h3 className="font-bold terminal-text">Actions</h3>
      </motion.div>

      <div className="space-y-3">
        {/* Play Card Button */}
        <motion.button
          onClick={onPlayCard}
          disabled={!canPlayCard || isLoading}
          className={`w-full game-button p-4 relative overflow-hidden transition-all duration-300 ${
            canPlayCard ? 'game-button-primary shadow-lg hover:shadow-xl' : 'opacity-50 cursor-not-allowed'
          }`}
          whileHover={canPlayCard ? { 
            scale: 1.02,
            y: -2,
            boxShadow: "0 10px 20px rgba(0,255,65,0.3)"
          } : {}}
          whileTap={canPlayCard ? { scale: 0.98 } : {}}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
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
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="mt-3 p-2 bg-black/20 rounded border border-game-accent/30"
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-muted-foreground">Playing:</span>
                <span className="font-mono font-semibold text-game-accent">{selectedCard.name}</span>
                <motion.div 
                  className="energy-orb energy-available text-xs"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {selectedCard.cost}
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.button>

        {/* End Turn Button */}
        <motion.button
          onClick={onEndTurn}
          disabled={!canEndTurn || isLoading}
          className={`w-full game-button p-4 transition-all duration-300 ${
            canEndTurn ? 'hover:border-game-warning hover:bg-game-warning/10 hover:shadow-md' : 'opacity-50 cursor-not-allowed'
          }`}
          whileHover={canEndTurn ? { 
            scale: 1.02,
            y: -1,
            boxShadow: "0 6px 12px rgba(255,170,0,0.2)"
          } : {}}
          whileTap={canEndTurn ? { scale: 0.98 } : {}}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-3">
            <Square className="w-5 h-5" />
            <span className="font-semibold">End Turn</span>
          </div>
        </motion.button>

        {/* Quick Actions */}
        <motion.div 
          className="border-t border-game-border pt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-xs text-muted-foreground mb-2 font-mono">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              className="game-button p-2 text-xs hover:border-game-info hover:bg-game-info/10"
              disabled={isLoading}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 mx-auto mb-1" />
              </motion.div>
              <div>Skip</div>
            </motion.button>
            <motion.button
              className="game-button p-2 text-xs hover:border-game-context hover:bg-game-context/10"
              disabled={isLoading}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-4 h-4 mx-auto mb-1" />
              </motion.div>
              <div>Wait</div>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Action Hints */}
      <motion.div 
        className="mt-4 pt-3 border-t border-game-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-xs text-muted-foreground space-y-2">
          {!selectedCard && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="w-1 h-1 bg-game-accent rounded-full animate-pulse" />
              <span>Select a card from your hand to play</span>
            </motion.div>
          )}
          {selectedCard && !canPlayCard && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-game-warning"
            >
              <span className="w-1 h-1 bg-game-warning rounded-full animate-pulse" />
              <span>Not enough energy to play this card</span>
            </motion.div>
          )}
          {canPlayCard && (
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className="flex items-center gap-2 text-game-success"
            >
              <motion.span 
                className="w-1 h-1 bg-game-success rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span>Ready to play selected card</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}