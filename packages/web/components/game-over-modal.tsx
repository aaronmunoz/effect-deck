'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Trophy, Skull, RotateCcw, Home } from 'lucide-react'

interface GameOverModalProps {
  isVisible: boolean
  isVictory: boolean
  onRestart: () => void
  onBackToMenu: () => void
}

export function GameOverModal({ isVisible, isVictory, onRestart, onBackToMenu }: GameOverModalProps) {
  const router = useRouter()

  const handleBackToMenu = () => {
    onBackToMenu()
    router.push('/')
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`relative bg-game-card border-2 ${
              isVictory ? 'border-game-success' : 'border-game-danger'
            } rounded-xl p-8 text-center max-w-md mx-4 overflow-hidden`}
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: -50, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              delay: 0.1 
            }}
          >
            {/* Background Effect */}
            <motion.div
              className={`absolute inset-0 ${
                isVictory 
                  ? 'bg-gradient-to-br from-game-success/10 to-game-success/5' 
                  : 'bg-gradient-to-br from-game-danger/10 to-game-danger/5'
              }`}
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                className="mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.3, 
                  type: "spring", 
                  stiffness: 200 
                }}
              >
                {isVictory ? (
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="inline-block"
                  >
                    <Trophy className="w-20 h-20 mx-auto text-game-success" />
                  </motion.div>
                ) : (
                  <motion.div
                    animate={{
                      rotate: [0, -5, 5, 0],
                      scale: [1, 0.95, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="inline-block"
                  >
                    <Skull className="w-20 h-20 mx-auto text-game-danger" />
                  </motion.div>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                className={`text-3xl font-bold mb-4 ${
                  isVictory ? 'text-game-success' : 'text-game-danger'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {isVictory ? 'Victory!' : 'Defeat!'}
              </motion.h1>

              {/* Message */}
              <motion.p
                className="text-muted-foreground mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {isVictory 
                  ? "Congratulations! You've mastered the art of functional programming and emerged victorious from this battle!"
                  : "The battle is lost, but every defeat brings wisdom. Study your cards and strategies, then return stronger!"
                }
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button
                  onClick={onRestart}
                  className="game-button game-button-primary flex items-center justify-center gap-2 px-6 py-3 flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Play Again</span>
                </motion.button>

                <motion.button
                  onClick={handleBackToMenu}
                  className="game-button flex items-center justify-center gap-2 px-6 py-3 flex-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home className="w-4 h-4" />
                  <span>Main Menu</span>
                </motion.button>
              </motion.div>
            </div>

            {/* Particle Effects for Victory */}
            {isVictory && (
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-game-success rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      y: [0, -30, -60]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}