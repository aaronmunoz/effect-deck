'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface GameLogProps {
  entries: readonly string[]
}

export function GameLog({ entries }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  const getTypeFromMessage = (message: string) => {
    const lower = message.toLowerCase()
    if (lower.includes('damage') || lower.includes('attack')) return 'damage'
    if (lower.includes('heal') || lower.includes('restore')) return 'heal'
    if (lower.includes('play') || lower.includes('cast')) return 'action'
    if (lower.includes('error') || lower.includes('fail')) return 'error'
    return 'info'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'damage':
        return 'text-attack'
      case 'heal':
        return 'text-game-success'
      case 'action':
        return 'text-game-accent'
      case 'error':
        return 'text-game-danger'
      default:
        return 'text-muted-foreground'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'damage':
        return '⚔️'
      case 'heal':
        return '💚'
      case 'action':
        return '🎯'
      case 'error':
        return '❌'
      default:
        return '📝'
    }
  }

  return (
    <div className="game-card h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-game-border">
        <span className="text-lg">📜</span>
        <h3 className="font-bold terminal-text">Game Log</h3>
      </div>
      
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-game-border scrollbar-track-transparent"
      >
        <AnimatePresence mode="popLayout">
          {entries.map((message, index) => {
            const type = getTypeFromMessage(message)
            return (
              <motion.div
                key={`${message}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-2 p-2 rounded bg-game-border/20 hover:bg-game-border/30 transition-colors"
              >
                <span className="text-xs mt-1 flex-shrink-0">
                  {getTypeIcon(type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${getTypeColor(type)}`}>
                    {message}
                  </p>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {entries.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-4xl mb-2">⚔️</div>
            <p className="text-sm">Game actions will appear here...</p>
          </div>
        )}
      </div>
    </div>
  )
}