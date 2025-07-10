#!/usr/bin/env node

import { Effect, Console } from 'effect'
import { GameEngine, AppLayer } from '@effect-deck/core'
import { FlashyRenderer } from './flashy-renderer'
import { InteractiveInput } from './interactive-input'
import { BattleAnimations } from './animations'
import chalk from 'chalk'
import figlet from 'figlet'
import gradient from 'gradient-string'

// Enhanced main game program with flashy UI
const program = Effect.gen(function* () {
  const renderer = new FlashyRenderer()
  const input = new InteractiveInput()
  const animations = new BattleAnimations()
  
  // Show spectacular welcome screen
  yield* Effect.promise(() => showWelcomeScreen())
  
  const gameEngine = yield* GameEngine
  let gameResponse = yield* gameEngine.startNewGame()
  
  yield* Console.log(chalk.green.bold('🎮 Game started! Get ready for battle...'))
  yield* Effect.promise(() => animations.showLoadingAnimation('Initializing game...', 1500))
  
  let previousHealth = {
    player: gameResponse.gameState.player.health,
    enemy: gameResponse.gameState.enemy?.health || 0
  }
  
  while (!gameResponse.gameState.isGameOver) {
    // Show turn transition if turn changed
    const currentTurn = gameResponse.gameState.turn
    yield* Effect.promise(() => animations.showTurnTransition(currentTurn))
    
    // Render the current game state with flashy UI
    yield* Effect.promise(() => renderer.render(gameResponse.gameState))
    
    if (gameResponse.validActions.length === 0) {
      yield* Console.log(chalk.red.bold('❌ No valid actions available.'))
      break
    }
    
    // Get player action with interactive UI
    const action = yield* Effect.promise(() => input.getGameAction(gameResponse.gameState))
    
    if (!action) {
      yield* Console.log(chalk.yellow('👋 Thanks for playing!'))
      break
    }
    
    // Show card play animation if playing a card
    if (action.type === 'play_card') {
      const card = gameResponse.gameState.player.hand.find(c => c.id === action.cardId)
      if (card) {
        yield* Effect.promise(() => animations.showCardPlayAnimation(card.name))
      }
    }
    
    // Process the action
    const actionResult = yield* Effect.either(gameEngine.processAction(action))
    
    if (actionResult._tag === 'Left') {
      yield* Console.log(chalk.red.bold(`❌ Error: ${actionResult.left.message}`))
      yield* Effect.promise(() => input.waitForKeyPress())
      continue
    }
    
    gameResponse = actionResult.right
    
    // Show battle animations based on what happened
    yield* Effect.promise(() => showBattleAnimations(
      gameResponse.gameState, 
      previousHealth, 
      animations,
      action
    ))
    
    // Update previous health for next comparison
    previousHealth = {
      player: gameResponse.gameState.player.health,
      enemy: gameResponse.gameState.enemy?.health || 0
    }
  }
  
  // Show final game state
  yield* Effect.promise(() => renderer.render(gameResponse.gameState))
  
  // Show victory/defeat animation
  if (gameResponse.gameState.victory) {
    yield* Effect.promise(() => animations.showVictoryAnimation())
    yield* Effect.promise(() => renderer.renderGameEnd(gameResponse.gameState))
  } else {
    yield* Effect.promise(() => animations.showDefeatAnimation())
    yield* Effect.promise(() => renderer.renderGameEnd(gameResponse.gameState))
  }
  
  yield* Effect.promise(() => input.waitForKeyPress('Press any key to exit...'))
})

async function showWelcomeScreen(): Promise<void> {
  console.clear()
  
  // Show ASCII title with gradient
  const title = figlet.textSync('EFFECT DECK', {
    font: 'Big',
    horizontalLayout: 'default'
  })
  
  console.log(gradient.rainbow(title))
  console.log()
  console.log(chalk.cyan.bold('🃏 A Strategic Card Battle Game 🃏'))
  console.log(chalk.dim('Built with Effect-TS and Enhanced CLI'))
  console.log()
  console.log(chalk.yellow('⚡ Features:'))
  console.log(chalk.white('• Interactive card selection'))
  console.log(chalk.white('• Beautiful ASCII card displays'))
  console.log(chalk.white('• Animated battle effects'))
  console.log(chalk.white('• Rich terminal UI'))
  console.log()
  console.log(chalk.green('🎮 Use arrow keys, numbers, or Enter to play!'))
  console.log()
  console.log(chalk.dim('Press any key to start...'))
  
  // Wait for input (with fallback for environments without setRawMode)
  await new Promise<void>((resolve) => {
    const stdin = process.stdin
    
    if (typeof stdin.setRawMode === 'function') {
      stdin.setRawMode(true)
    }
    
    stdin.resume()
    stdin.setEncoding('utf8')
    
    const onKeyPress = () => {
      if (typeof stdin.setRawMode === 'function') {
        stdin.setRawMode(false)
      }
      stdin.pause()
      stdin.removeListener('data', onKeyPress)
      resolve()
    }
    
    stdin.on('data', onKeyPress)
  })
}

async function showBattleAnimations(
  currentState: any,
  previousHealth: { player: number; enemy: number },
  animations: BattleAnimations,
  action: any
): Promise<void> {
  // Check for player damage
  if (currentState.player.health < previousHealth.player) {
    const damage = previousHealth.player - currentState.player.health
    await animations.showDamageAnimation(damage, 'player')
  }
  
  // Check for enemy damage
  if (currentState.enemy && currentState.enemy.health < previousHealth.enemy) {
    const damage = previousHealth.enemy - currentState.enemy.health
    await animations.showDamageAnimation(damage, 'enemy')
  }
  
  // Check for shield gain
  if (action.type === 'play_card') {
    const card = currentState.player.hand.find((c: any) => c.id === action.cardId) ||
                currentState.player.discard.find((c: any) => c.id === action.cardId)
    
    if (card && card.type === 'defense' && currentState.player.shield > 0) {
      await animations.showShieldAnimation(currentState.player.shield)
    }
  }
  
  // Show enemy attack animation if it's end of turn
  if (action.type === 'end_turn' && currentState.enemy && !currentState.isGameOver) {
    await animations.showEnemyAttackAnimation()
  }
  
  // Show energy restore animation at start of turn
  if (action.type === 'end_turn' && currentState.player.energy === currentState.player.maxEnergy) {
    await animations.showEnergyRestoreAnimation(currentState.player.energy)
  }
}

// Run the enhanced program with dependency injection
const main = Effect.provide(program, AppLayer)

Effect.runPromise(main).catch((error) => {
  console.error(chalk.red.bold('💥 Fatal Error:'), error)
  process.exit(1)
})