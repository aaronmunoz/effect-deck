#!/usr/bin/env node

import { Effect, Console } from 'effect'
import { GameEngine, AppLayer } from '@effect-deck/core'
import { GameRenderer } from './renderer.js'
import { PlayerInput } from './input.js'

// Main game program using Effect Context/Layer pattern
const program = Effect.gen(function* () {
  yield* Console.log('🃏 Welcome to Effect Deck!')
  yield* Console.log('A deck-building game built with Effect\n')
  
  const gameEngine = yield* GameEngine
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
    const actionResult = yield* Effect.either(gameEngine.processAction(action))
    
    if (actionResult._tag === 'Left') {
      yield* Console.log(`❌ Error: ${actionResult.left.message}`)
      continue
    }
    
    gameResponse = actionResult.right
  }
  
  renderer.render(gameResponse.gameState)
  
  if (gameResponse.gameState.victory) {
    yield* Console.log('\n🎉 Victory! You defeated the enemy!')
  } else {
    yield* Console.log('\n💀 Game Over! You were defeated.')
  }
})

// Run the program with dependency injection
const main = Effect.provide(program, AppLayer)

Effect.runPromise(main).catch(console.error)