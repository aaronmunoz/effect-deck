import { Effect, Runtime } from 'effect'
import type { GameState, GameAction, GameResponse } from '@effect-deck/core'
import { AppLayer, GameEngine, CardRegistry } from '@effect-deck/core'

export type GameStateSubscriber = (state: GameState) => void

// Create a single runtime instance that persists across all operations
let sharedRuntime: any | null = null

/**
 * In-process game backend that manages all game state and business logic.
 * Acts as a mini-server that the frontend can send commands to.
 */
export class GameBackend {
  private gameState: GameState | null = null
  private subscribers: GameStateSubscriber[] = []
  private isInitialized = false
  
  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      if (!sharedRuntime) {
        // Create the shared runtime once
        const makeRuntime = Effect.gen(function* () {
          return yield* Effect.runtime()
        })
        
        sharedRuntime = await Effect.runPromise(Effect.provide(makeRuntime, AppLayer))
        
        // Test that our runtime has populated services
        const testProgram = Effect.gen(function* () {
          const registry = yield* CardRegistry
          const allEffects = yield* registry.getAllEffects()
          console.log('Shared runtime CardRegistry has', allEffects.size, 'cards:', Array.from(allEffects.keys()))
          
          const heavyStrikeResult = yield* Effect.either(registry.getEffect('heavy_strike'))
          if (heavyStrikeResult._tag === 'Left') {
            console.error('heavy_strike not found in shared runtime!')
          } else {
            console.log('heavy_strike found in shared runtime')
          }
        })
        
        await Runtime.runPromise(sharedRuntime)(testProgram)
      }
      
      this.isInitialized = true
      console.log('GameBackend initialized with shared runtime')
    } catch (error) {
      console.error('Failed to initialize GameBackend:', error)
      throw error
    }
  }

  private notifySubscribers() {
    if (this.gameState) {
      this.subscribers.forEach(callback => callback(this.gameState!))
    }
  }

  // Public API Methods

  /**
   * Subscribe to game state changes
   */
  subscribe(callback: GameStateSubscriber): () => void {
    this.subscribers.push(callback)
    
    // Immediately notify with current state if available
    if (this.gameState) {
      callback(this.gameState)
    }

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  /**
   * Get current game state (synchronous)
   */
  getCurrentState(): GameState | null {
    return this.gameState
  }

  /**
   * Start a new game
   */
  async startNewGame(): Promise<GameState> {
    if (!this.isInitialized || !sharedRuntime) {
      throw new Error('GameBackend not initialized')
    }

    const program = Effect.gen(function* () {
      const engine = yield* GameEngine
      const response = yield* engine.startNewGame()
      return response
    })

    const response = await Runtime.runPromise(sharedRuntime)(program)
    this.gameState = response.gameState
    this.notifySubscribers()
    
    return response.gameState
  }

  /**
   * Play a card by ID
   */
  async playCard(cardId: string, targetId?: string): Promise<GameState> {
    if (!this.isInitialized) {
      throw new Error('GameBackend not initialized')
    }
    
    if (!this.gameState) {
      throw new Error('No active game. Start a new game first.')
    }

    const action: GameAction = {
      type: 'play_card',
      cardId,
      targetId
    }

    const program = Effect.gen(function* () {
      const engine = yield* GameEngine
      const registry = yield* CardRegistry
      
      // Debug: Check registry state at runtime
      const allEffects = yield* registry.getAllEffects()
      console.log(`[playCard] Registry has ${allEffects.size} cards when playing ${cardId}`)
      
      if (allEffects.size === 0) {
        console.error('[playCard] Registry is empty! This is the problem.')
      }
      
      const response = yield* engine.processAction(action)
      return response
    })

    const response = await Runtime.runPromise(sharedRuntime!)(program)
    this.gameState = response.gameState
    this.notifySubscribers()
    
    return response.gameState
  }

  /**
   * End the current turn
   */
  async endTurn(): Promise<GameState> {
    if (!this.isInitialized) {
      throw new Error('GameBackend not initialized')
    }
    
    if (!this.gameState) {
      throw new Error('No active game. Start a new game first.')
    }

    const action: GameAction = {
      type: 'end_turn'
    }

    const program = Effect.gen(function* () {
      const engine = yield* GameEngine
      const response = yield* engine.processAction(action)
      return response
    })

    const response = await Runtime.runPromise(sharedRuntime!)(program)
    this.gameState = response.gameState
    this.notifySubscribers()
    
    return response.gameState
  }

  /**
   * Reset the game state (for testing or restart)
   */
  reset(): void {
    this.gameState = null
    this.notifySubscribers()
  }

  /**
   * Check if backend is ready to process commands
   */
  isReady(): boolean {
    return this.isInitialized
  }
}

// Singleton instance - acts like our "server"
export const gameBackend = new GameBackend()