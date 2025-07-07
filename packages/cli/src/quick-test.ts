#!/usr/bin/env node

import { Effect } from 'effect'
import { GameEngine, AppLayer } from '@effect-deck/core'
import { FlashyRenderer } from './flashy-renderer'

const quickTest = Effect.gen(function* () {
  console.log('🧪 Quick test of flashy renderer...\n')
  
  const gameEngine = yield* GameEngine
  const renderer = new FlashyRenderer()
  
  const gameResponse = yield* gameEngine.startNewGame()
  
  console.log('=== RENDERING INITIAL GAME STATE ===')
  yield* Effect.promise(() => renderer.render(gameResponse.gameState))
  
  console.log('\n=== TEST COMPLETE ===')
})

const main = Effect.provide(quickTest, AppLayer)
Effect.runPromise(main).catch(console.error)