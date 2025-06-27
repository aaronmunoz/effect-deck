import { Effect, Ref } from 'effect'
import type { GameState, GameAction, GameResponse, Card, Player, Enemy } from './schema.js'
import { BASIC_CARDS, applyDamage } from './cards.js'

export interface GameEngine {
  processAction: (action: GameAction) => Effect.Effect<GameResponse, string>
  getGameState: () => Effect.Effect<GameState>
  startNewGame: () => Effect.Effect<GameResponse>
}

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

const canPlayCard = (card: Card, player: Player): boolean => {
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

const playCard = (gameState: GameState, cardId: string): Effect.Effect<GameState, string> =>
  Effect.gen(function* () {
    const { player, enemy } = gameState
    const cardIndex = player.hand.findIndex((c) => c.id === cardId)
    
    if (cardIndex === -1) {
      return yield* Effect.fail('Card not found in hand')
    }
    
    const card = player.hand[cardIndex]
    
    if (!canPlayCard(card, player)) {
      return yield* Effect.fail('Cannot play this card')
    }
    
    const newHand = player.hand.filter((_, i) => i !== cardIndex)
    const newDiscard = [...player.discard, card]
    const newEnergy = player.energy - card.cost
    
    let updatedPlayer = {
      ...player,
      hand: newHand,
      discard: newDiscard,
      energy: newEnergy,
    }
    
    let updatedEnemy = enemy
    let newLog = [...gameState.log, `Player plays ${card.name}`]
    
    switch (card.id) {
      case 'strike':
        if (enemy) {
          updatedEnemy = applyDamage(enemy, 6) as Enemy
          newLog.push(`Player deals 6 damage to ${enemy.name}`)
        }
        break
      case 'heavy_strike':
        if (enemy) {
          updatedEnemy = applyDamage(enemy, 12) as Enemy
          newLog.push(`Player deals 12 damage to ${enemy.name}`)
        }
        break
      case 'quick_strike':
        if (enemy) {
          updatedEnemy = applyDamage(enemy, 3) as Enemy
          newLog.push(`Player deals 3 damage to ${enemy.name}`)
        }
        break
      case 'precise_strike':
        if (enemy) {
          updatedEnemy = applyDamage(enemy, 8, true) as Enemy
          newLog.push(`Player deals 8 damage to ${enemy.name} (ignoring shield)`)
        }
        break
      case 'block':
        updatedPlayer = { ...updatedPlayer, shield: updatedPlayer.shield + 5 }
        newLog.push('Player gains 5 shield')
        break
      case 'shield_up':
        updatedPlayer = { ...updatedPlayer, shield: updatedPlayer.shield + 8 }
        newLog.push('Player gains 8 shield')
        break
      case 'init_algorithm':
        updatedPlayer = { ...updatedPlayer, contexts: [...updatedPlayer.contexts, 'Algorithm'] }
        newLog.push('Algorithm context initialized')
        break
      case 'energy_surge':
        updatedPlayer = { ...updatedPlayer, contexts: [...updatedPlayer.contexts, 'HighEnergy'] }
        newLog.push('HighEnergy context activated')
        break
      case 'overclock_attack':
        if (enemy) {
          updatedEnemy = applyDamage(enemy, 15) as Enemy
          newLog.push(`Player deals 15 damage to ${enemy.name} (overclocked)`)
        }
        break
    }
    
    const isEnemyDefeated = updatedEnemy ? updatedEnemy.health <= 0 : false
    
    return {
      ...gameState,
      player: updatedPlayer,
      enemy: updatedEnemy,
      log: newLog,
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
      if (canPlayCard(card, gameState.player)) {
        actions.push({ type: 'play_card', cardId: card.id })
      }
    })
    actions.push({ type: 'end_turn' })
  }
  
  return actions
}

export const createGameEngine = (): Effect.Effect<GameEngine> =>
  Effect.gen(function* () {
    const gameStateRef = yield* Ref.make(createInitialGameState())
    
    const startNewGame = (): Effect.Effect<GameResponse> =>
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
    
    const processAction = (action: GameAction): Effect.Effect<GameResponse, string> =>
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
            return yield* Effect.fail('Invalid action type')
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