'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RotateCcw, Pause } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameState, type WebGameAction } from '@/hooks/use-game-state'
import { PlayerStatus } from '@/components/player-status'
import { EnemyStatus } from '@/components/enemy-status'
import { GameCard } from '@/components/card'
import { GameLog } from '@/components/game-log'
import { ActionButtons } from '@/components/action-buttons'

export default function GamePage() {
  const router = useRouter()
  const { gameState, isLoading, error, initializeGame, processAction } = useGameState()
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  const handleCardSelect = (index: number) => {
    if (selectedCardIndex === index) {
      setSelectedCardIndex(null)
    } else {
      setSelectedCardIndex(index)
    }
  }

  const handlePlayCard = async () => {
    if (selectedCardIndex !== null && gameState?.player.hand[selectedCardIndex]) {
      try {
        await processAction({
          type: 'play_card',
          cardIndex: selectedCardIndex,
        })
        setSelectedCardIndex(null)
      } catch (error) {
        console.error('Failed to play card:', error)
      }
    }
  }

  const handleEndTurn = async () => {
    try {
      await processAction({
        type: 'end_turn',
      })
    } catch (error) {
      console.error('Failed to end turn:', error)
    }
  }

  const handleBackToMenu = () => {
    router.push('/')
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="game-card p-8 text-center">
          <h2 className="text-2xl font-bold text-game-danger mb-4">Game Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={handleBackToMenu}
            className="game-button-primary"
          >
            Back to Menu
          </button>
        </div>
      </div>
    )
  }

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-game-accent border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-game-bg bg-game-grid bg-game-grid p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <button
          onClick={handleBackToMenu}
          className="game-button flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Menu
        </button>
        
        <div className="flex items-center gap-4">
          <div className="terminal-text font-mono text-lg">
            Turn {gameState.turn}
          </div>
          <div className="flex items-center gap-2">
            <button className="game-button p-2">
              <Pause className="w-4 h-4" />
            </button>
            <button className="game-button p-2">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Game Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
        {/* Left Panel - Player Status */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <PlayerStatus player={gameState.player} />
        </motion.div>

        {/* Center Panel - Battle Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 flex flex-col"
        >
          {/* Enemy Area */}
          <div className="flex-1 flex items-start justify-center p-4">
            {gameState.enemy && <EnemyStatus enemy={gameState.enemy} />}
          </div>

          {/* Battle Effects Area */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="text-center">
              <div className="text-6xl mb-4">⚔️</div>
              <div className="terminal-text text-lg">
                {gameState.phase === 'action' ? 'Your Turn' : 
                 gameState.phase === 'enemy' ? 'Enemy Turn' : 
                 gameState.phase === 'draw' ? 'Draw Phase' : 'Cleanup'}
              </div>
            </div>
          </div>

          {/* Player Hand */}
          <div className="flex-1 flex items-end justify-center p-4">
            <div className="w-full max-w-4xl">
              <div className="text-center mb-4">
                <span className="terminal-text font-mono">Your Hand</span>
              </div>
              <div className="flex justify-center gap-2 overflow-x-auto pb-4">
                <AnimatePresence mode="popLayout">
                  {gameState.player.hand.map((card, index) => (
                    <motion.div
                      key={`${card.id}-${index}`}
                      layout
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -100 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <GameCard
                        card={card}
                        isSelected={selectedCardIndex === index}
                        isPlayable={card.cost <= gameState.player.energy}
                        onClick={() => handleCardSelect(index)}
                        className="w-40 h-56 text-sm"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Game Log & Actions */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-1 flex flex-col gap-4"
        >
          {/* Action Buttons */}
          <ActionButtons
            selectedCard={selectedCardIndex !== null ? gameState.player.hand[selectedCardIndex] || null : null}
            canPlayCard={selectedCardIndex !== null && (gameState.player.hand[selectedCardIndex]?.cost || 0) <= gameState.player.energy}
            canEndTurn={gameState.phase === 'action'}
            onPlayCard={handlePlayCard}
            onEndTurn={handleEndTurn}
            isLoading={isLoading}
          />

          {/* Game Log */}
          <div className="flex-1">
            <GameLog entries={gameState.log} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}