#!/usr/bin/env node

import { Effect, Console } from 'effect'
import { createGameEngine } from '@effect-deck/core'
import { GameRenderer } from './renderer.js'
import { PlayerInput } from './input.js'

const main = Effect.gen(function* () {
  yield* Console.log('🃏 Welcome to Effect Deck!')
  yield* Console.log('A deck-building game built with Effect\n')
  
  const gameEngine = yield* createGameEngine()
  const renderer = new GameRenderer()
  const input = new PlayerInput()
  
  let gameResponse = yield* gameEngine.startNewGame()
  
  while (!gameResponse.gameState.isGameOver) {
    renderer.render(gameResponse.gameState)
    
    if (gameResponse.validActions.length === 0) {
      yield* Console.log('No valid actions available.')
      break
    }
    
    const action = yield* input.getPlayerAction([...gameResponse.validActions])
    gameResponse = yield* gameEngine.processAction(action)
  }
  
  renderer.render(gameResponse.gameState)
  
  if (gameResponse.gameState.victory) {
    yield* Console.log('\n🎉 Victory! You defeated the enemy!')
  } else {
    yield* Console.log('\n💀 Game Over! You were defeated.')
  }
})

Effect.runPromise(main).catch(console.error)