'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, RotateCcw, Pause } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGameState } from '@/hooks/use-game-state'
import { useBattleEffects, battleAnimations } from '@/hooks/use-battle-effects'
import { useTurnFlow } from '@/hooks/use-turn-flow'
import { cn } from '@/lib/utils'
import { PlayerStatus } from '@/components/player-status'
import { EnemyStatus } from '@/components/enemy-status'
import { GameCard } from '@/components/card'
import { GameLog } from '@/components/game-log'
import { ActionButtons } from '@/components/action-buttons'
import { BattleEffects } from '@/components/battle-effects'
import { TurnIndicator, PhaseTransition } from '@/components/turn-indicator'
import { GameOverModal } from '@/components/game-over-modal'
import { EnemyTurnSequence } from '@/components/enemy-turn-sequence'

export default function GamePage() {
  const router = useRouter()
  const { gameState, isLoading, error, initializeGame, processAction } = useGameState()
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [playingCardIndex, setPlayingCardIndex] = useState<number | null>(null)
  const battleEffects = useBattleEffects()
  const turnFlow = useTurnFlow(gameState)
  const playerRef = useRef<HTMLDivElement>(null)
  const enemyRef = useRef<HTMLDivElement>(null)
  const previousHealthRef = useRef<{ player: number; enemy: number } | null>(null)

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  // Monitor health changes for automatic damage animations
  useEffect(() => {
    if (gameState && previousHealthRef.current) {
      const prev = previousHealthRef.current
      
      // Check for player health changes
      if (gameState.player.health < prev.player) {
        const damage = prev.player - gameState.player.health
        battleAnimations.takeDamage(battleEffects, damage, playerRef.current || undefined)
      } else if (gameState.player.health > prev.player) {
        const healing = gameState.player.health - prev.player
        battleAnimations.heal(battleEffects, healing, playerRef.current || undefined)
      }
      
      // Check for enemy health changes
      if (gameState.enemy && gameState.enemy.health < prev.enemy) {
        const damage = prev.enemy - gameState.enemy.health
        if (damage >= 10) {
          battleAnimations.majorImpact(battleEffects, damage, enemyRef.current || undefined)
        } else {
          battleAnimations.takeDamage(battleEffects, damage, enemyRef.current || undefined)
        }
      }
    }
    
    // Update previous health values
    if (gameState) {
      previousHealthRef.current = {
        player: gameState.player.health,
        enemy: gameState.enemy?.health || 0
      }
    }
  }, [gameState?.player.health, gameState?.enemy?.health, battleEffects])

  const handleCardSelect = (index: number) => {
    if (selectedCardIndex === index) {
      setSelectedCardIndex(null)
    } else {
      setSelectedCardIndex(index)
    }
  }

  const handlePlayCard = async () => {
    if (selectedCardIndex !== null && gameState?.player.hand[selectedCardIndex]) {
      const card = gameState.player.hand[selectedCardIndex]
      
      try {
        // Start card playing animation
        setPlayingCardIndex(selectedCardIndex)
        
        // Small delay to show the card animation
        await new Promise(resolve => setTimeout(resolve, 300))
        
        await processAction({
          type: 'play_card',
          cardIndex: selectedCardIndex,
        })
        
        // Trigger appropriate battle animation based on card type
        if (card.type === 'attack') {
          battleAnimations.playAttackCard(battleEffects, card.cost * 2, enemyRef.current || undefined)
        } else if (card.type === 'defense') {
          battleAnimations.playDefenseCard(battleEffects, card.cost, playerRef.current || undefined)
        } else if (card.type === 'context') {
          battleAnimations.playEnergyCard(battleEffects, card.cost, playerRef.current || undefined)
        }
        
        setSelectedCardIndex(null)
        setPlayingCardIndex(null)
      } catch (error) {
        console.error('Failed to play card:', error)
        setPlayingCardIndex(null)
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
      <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-120px)] max-w-7xl mx-auto">
        {/* Left Panel - Player Status */}
        <motion.div
          ref={playerRef}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-1 lg:col-span-1 order-2 lg:order-1"
        >
          <PlayerStatus player={gameState.player} />
        </motion.div>

        {/* Center Panel - Battle Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 lg:col-span-2 col-span-1 flex flex-col order-1 lg:order-2"
        >
          {/* Enemy Area */}
          <div className="flex-1 flex items-start justify-center p-4">
            <div ref={enemyRef}>
              {gameState.enemy && <EnemyStatus enemy={gameState.enemy} />}
            </div>
          </div>

          {/* Battle Effects Area */}
          <div className="flex-1 flex items-center justify-center relative">
            <TurnIndicator 
              phase={gameState.phase}
              turnNumber={gameState.turn}
              onPhaseComplete={() => {
                // Phase auto-completion logic could go here
                console.log(`${gameState.phase} phase completed`)
              }}
            />
          </div>

          {/* Player Hand */}
          <div className="flex-1 flex items-end justify-center p-2 lg:p-4">
            <div className="w-full max-w-5xl">
              <div className="text-center mb-3 lg:mb-4">
                <span className="terminal-text font-mono text-sm lg:text-base">Your Hand</span>
              </div>
              <div className="flex justify-center gap-1 sm:gap-2 lg:gap-3 overflow-x-auto pb-4 px-2">
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
                        isPlayable={card.cost <= gameState.player.energy && !isLoading}
                        isPlaying={playingCardIndex === index}
                        onClick={() => handleCardSelect(index)}
                        className={cn(
                          "transition-all duration-200",
                          "w-32 h-44 text-xs sm:w-36 sm:h-50 sm:text-sm",
                          "lg:w-40 lg:h-56 lg:text-sm xl:w-44 xl:h-60"
                        )}
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
          className="xl:col-span-1 lg:col-span-1 col-span-1 flex flex-col gap-3 lg:gap-4 order-3"
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
      
      {/* Battle Effects Overlay */}
      <BattleEffects
        damageNumbers={battleEffects.damageNumbers}
        effects={battleEffects.effects}
        onEffectComplete={battleEffects.clearEffect}
      />
      
      {/* Phase Transition Overlay */}
      <AnimatePresence>
        {turnFlow.showPhaseTransition && turnFlow.turnFlow.previousPhase && (
          <PhaseTransition
            fromPhase={turnFlow.turnFlow.previousPhase}
            toPhase={turnFlow.turnFlow.currentPhase}
            onComplete={turnFlow.completePhaseTransition}
          />
        )}
      </AnimatePresence>
      
      {/* Enemy Turn Sequence */}
      {gameState?.enemy && (
        <EnemyTurnSequence
          enemy={gameState.enemy}
          isEnemyTurn={gameState.phase === 'enemy'}
          onSequenceComplete={() => {
            console.log('Enemy turn sequence completed')
            // The game engine will handle the actual turn progression
          }}
        />
      )}
      
      {/* Game Over Modal */}
      <GameOverModal
        isVisible={gameState?.isGameOver || false}
        isVictory={gameState?.victory || false}
        onRestart={() => {
          initializeGame()
        }}
        onBackToMenu={() => {
          router.push('/')
        }}
      />
    </div>
  )
}