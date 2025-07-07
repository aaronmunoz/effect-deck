import { Effect, Ref, Layer } from 'effect'
import type { GameState, GameAction, GameResponse, Card, Player, Enemy } from './schema'
import { BASIC_CARDS, applyDamage } from './cards'
import { 
  GameError, 
  CardNotFound, 
  InvalidAction 
} from './errors'
import { GameEngine, GameStateRef } from './services'
import { CardRegistry } from './card-effects'

const createInitialPlayer = (): Player => ({
  id: 'player',
  health: 50,
  maxHealth: 50,
  energy: 3,
  maxEnergy: 3,
  shield: 0,
  hand: [],
  deck: [...BASIC_CARDS.slice(0, 10)],
  discard: [],
  contexts: [],
})

const createBasicEnemy = (): Enemy => ({
  id: 'basic_enemy',
  name: 'Corrupted Process',
  health: 30,
  maxHealth: 30,
  shield: 0,
  intent: 'Attack for 8',
  damage: 8,
})

const createInitialGameState = (): GameState => ({
  id: 'game_1',
  turn: 1,
  phase: 'draw',
  player: createInitialPlayer(),
  enemy: createBasicEnemy(),
  log: ['Game started'],
  isGameOver: false,
  victory: false,
})

const drawCards = (player: Player, count: number): Player => {
  const cardsToDraw = Math.min(count, player.deck.length)
  const drawnCards = player.deck.slice(0, cardsToDraw)
  const remainingDeck = player.deck.slice(cardsToDraw)
  
  return {
    ...player,
    hand: [...player.hand, ...drawnCards],
    deck: remainingDeck,
  }
}

const playCard = (gameState: GameState, cardId: string): Effect.Effect<GameState, GameError, CardRegistry> =>
  Effect.gen(function* () {
    const cardRegistry = yield* CardRegistry
    const { player } = gameState
    const cardIndex = player.hand.findIndex((c) => c.id === cardId)
    
    if (cardIndex === -1) {
      return yield* Effect.fail(new CardNotFound({
        cardId,
        availableCards: player.hand.map(c => c.id)
      }))
    }
    
    const card = player.hand[cardIndex]
    
    // Get the card effect from the registry
    const cardEffect = yield* cardRegistry.getEffect(cardId)
    
    // Validate the card play using the card effect's validation
    yield* cardEffect.validate(card, gameState)
    
    // Remove card from hand, add to discard, spend energy
    const newHand = player.hand.filter((_, i) => i !== cardIndex)
    const newDiscard = [...player.discard, card]
    const newEnergy = player.energy - card.cost
    
    const intermediateState = {
      ...gameState,
      player: {
        ...player,
        hand: newHand,
        discard: newDiscard,
        energy: newEnergy,
      },
      log: [...gameState.log, `Player plays ${card.name}`]
    }
    
    // Execute the card effect
    const finalState = yield* cardEffect.execute(intermediateState, cardId)
    
    // Check for victory condition
    const isEnemyDefeated = finalState.enemy ? finalState.enemy.health <= 0 : false
    
    return {
      ...finalState,
      isGameOver: isEnemyDefeated,
      victory: isEnemyDefeated,
    }
  })

const enemyTurn = (gameState: GameState): GameState => {
  if (!gameState.enemy || gameState.enemy.health <= 0) return gameState
  
  const { player, enemy } = gameState
  const damagedPlayer = applyDamage(player, enemy.damage) as Player
  const isPlayerDefeated = damagedPlayer.health <= 0
  
  return {
    ...gameState,
    player: damagedPlayer,
    log: [...gameState.log, `${enemy.name} deals ${enemy.damage} damage to player`],
    phase: 'cleanup',
    isGameOver: isPlayerDefeated,
    victory: false,
  }
}

const getValidActions = (gameState: GameState): GameAction[] => {
  const actions: GameAction[] = []
  
  if (gameState.isGameOver) return actions
  
  if (gameState.phase === 'action') {
    gameState.player.hand.forEach((card) => {
      if (canPlayCardSync(card, gameState.player)) {
        actions.push({ type: 'play_card', cardId: card.id })
      }
    })
    actions.push({ type: 'end_turn' })
  }
  
  return actions
}

export const canPlayCard = (card: Card, gameState: GameState): Effect.Effect<boolean, never, CardRegistry> =>
  Effect.gen(function* () {
    const cardRegistry = yield* CardRegistry
    
    // Try to get the card effect
    const cardEffectResult = yield* Effect.either(cardRegistry.getEffect(card.id))
    
    if (cardEffectResult._tag === 'Left') {
      // Card effect not found, assume it can't be played
      return false
    }
    
    const cardEffect = cardEffectResult.right
    
    // Try to validate the card
    const validationResult = yield* Effect.either(cardEffect.validate(card, gameState))
    
    // Return true if validation succeeds, false if it fails
    return validationResult._tag === 'Right'
  })

// Backward compatibility function (synchronous version)
export const canPlayCardSync = (card: Card, player: Player): boolean => {
  if (player.energy < card.cost) return false
  
  if (card.type === 'dependent') {
    switch (card.id) {
      case 'overclock_attack':
        return player.contexts.includes('HighEnergy')
      case 'shield_slam':
        return player.shield > 0
      case 'execute_algorithm':
        return player.contexts.includes('Algorithm')
      default:
        return true
    }
  }
  
  return true
}

// Layer that provides GameStateRef
export const GameStateRefLive: Layer.Layer<GameStateRef> = 
  Layer.effect(
    GameStateRef,
    Effect.gen(function* () {
      const ref = yield* Ref.make(createInitialGameState())
      return { ref }
    })
  )

// Layer that provides GameEngine service
export const GameEngineLive: Layer.Layer<GameEngine, never, GameStateRef | CardRegistry> =
  Layer.effect(
    GameEngine,
    Effect.gen(function* () {
      const { ref: gameStateRef } = yield* GameStateRef

      const startNewGame = (): Effect.Effect<GameResponse, GameError> =>
        Effect.gen(function* () {
          const initialState = createInitialGameState()
          const playerWithCards = drawCards(initialState.player, 5)
          const newState = {
            ...initialState,
            player: playerWithCards,
            phase: 'action' as const,
          }
          
          yield* Ref.set(gameStateRef, newState)
          
          return {
            gameState: newState,
            validActions: getValidActions(newState),
          }
        })
      
      const processAction = (action: GameAction): Effect.Effect<GameResponse, GameError, CardRegistry> =>
        Effect.gen(function* () {
          const currentState = yield* Ref.get(gameStateRef)
          
          let newState: GameState
          
          switch (action.type) {
            case 'play_card':
              newState = yield* playCard(currentState, action.cardId)
              break
            case 'end_turn':
              const afterEnemy = enemyTurn(currentState)
              const playerWithCards = drawCards(afterEnemy.player, 2)
              newState = {
                ...afterEnemy,
                turn: afterEnemy.turn + 1,
                phase: 'action',
                player: {
                  ...playerWithCards,
                  energy: playerWithCards.maxEnergy,
                  shield: 0,
                },
              }
              break
            case 'start_game':
              return yield* startNewGame()
            default:
              return yield* Effect.fail(new InvalidAction({
                action: (action as any).type || 'unknown',
                reason: 'Unknown action type'
              }))
          }
          
          yield* Ref.set(gameStateRef, newState)
          
          return {
            gameState: newState,
            validActions: getValidActions(newState),
          }
        })
      
      const getGameState = (): Effect.Effect<GameState> => Ref.get(gameStateRef)
      
      return {
        processAction,
        getGameState,
        startNewGame,
      }
    })
  )

// Combined layer for the full game engine  
export const GameEngineLayer = Layer.provide(
  GameEngineLive, 
  GameStateRefLive
)

// Backward compatibility function (deprecated)
export const createGameEngine = (): Effect.Effect<GameEngine, never, GameEngine> =>
  Effect.gen(function* () {
    const engine = yield* GameEngine
    return engine
  })