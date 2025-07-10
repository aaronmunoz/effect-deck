'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Settings, Info } from 'lucide-react'

export default function HomePage() {
  const [isStarting, setIsStarting] = useState(false)

  const handleStartGame = () => {
    setIsStarting(true)
    // TODO: Navigate to game or initialize game state
    setTimeout(() => {
      setIsStarting(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-4 terminal-text">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            EFFECT
          </motion.span>
          <br />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="glow-effect"
          >
            DECK
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-muted-foreground text-lg font-mono"
        >
          Strategic card combat powered by Effect-TS
        </motion.p>
      </motion.div>

      {/* Menu Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <motion.button
          onClick={handleStartGame}
          disabled={isStarting}
          className={`game-button-primary flex items-center justify-center gap-3 py-4 ${
            isStarting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          whileHover={{ scale: isStarting ? 1 : 1.05 }}
          whileTap={{ scale: isStarting ? 1 : 0.95 }}
        >
          {isStarting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <span className="text-lg font-semibold">
            {isStarting ? 'Starting...' : 'Start Game'}
          </span>
        </motion.button>

        <motion.button
          className="game-button flex items-center justify-center gap-3 py-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </motion.button>

        <motion.button
          className="game-button flex items-center justify-center gap-3 py-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Info className="w-5 h-5" />
          <span>How to Play</span>
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 text-center"
      >
        <p className="text-muted-foreground text-sm font-mono">
          Built with Next.js 14 • TypeScript • Effect-TS • Tailwind CSS
        </p>
      </motion.div>
    </div>
  )
}