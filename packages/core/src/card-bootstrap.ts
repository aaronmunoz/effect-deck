import { Effect, Layer } from 'effect'
import { CardRegistry, CardEffect } from './card-effects'
import { GameEffects } from './card-effects'
import { InsufficientEnergy, RequiredContextMissing } from './errors'

// Create individual card effects with proper typing
const createStrikeEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      const updatedEnemy = yield* gameEffects.dealDamage(gameState.enemy, 6)
      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Player deals 6 damage to ${gameState.enemy.name}`]
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'strike',
    category: 'attack'
  }
})

const createBlockEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      const updatedPlayer = yield* gameEffects.gainShield(gameState.player, 5)
      return {
        ...gameState,
        player: updatedPlayer,
        log: [...gameState.log, 'Player gains 5 shield']
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'block',
    category: 'defense'
  }
})

const createInitAlgorithmEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      const updatedPlayer = yield* gameEffects.addContext(gameState.player, 'Algorithm')
      return {
        ...gameState,
        player: updatedPlayer,
        log: [...gameState.log, 'Algorithm context initialized']
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'init_algorithm',
    category: 'context'
  }
})

const createHeavyStrikeEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      const updatedEnemy = yield* gameEffects.dealDamage(gameState.enemy, 12)
      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Player deals 12 damage to ${gameState.enemy.name}`]
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'heavy_strike',
    category: 'attack'
  }
})

const createEnergySurgeEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      const updatedPlayer = yield* gameEffects.addContext(gameState.player, 'HighEnergy')
      return {
        ...gameState,
        player: updatedPlayer,
        log: [...gameState.log, 'HighEnergy context activated']
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'energy_surge',
    category: 'context'
  }
})

// Attack Cards
const createQuickStrikeEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      const updatedEnemy = yield* gameEffects.dealDamage(gameState.enemy, 3)
      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Player deals 3 damage to ${gameState.enemy.name}`]
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'quick_strike',
    category: 'attack'
  }
})

const createPreciseStrikeEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      const updatedEnemy = yield* gameEffects.dealDamage(gameState.enemy, 8, true)
      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Player deals 8 damage to ${gameState.enemy.name} (ignoring shield)`]
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'precise_strike',
    category: 'attack'
  }
})

const createWildStrikeEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      const damage = Math.floor(Math.random() * 7) + 3 // 3-9 damage
      const updatedEnemy = yield* gameEffects.dealDamage(gameState.enemy, damage)
      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Player deals ${damage} damage to ${gameState.enemy.name} (wild)`]
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'wild_strike',
    category: 'attack'
  }
})

// Defense Cards
const createShieldUpEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      const updatedPlayer = yield* gameEffects.gainShield(gameState.player, 8)
      return {
        ...gameState,
        player: updatedPlayer,
        log: [...gameState.log, 'Player gains 8 shield']
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'shield_up',
    category: 'defense'
  }
})

const createDodgeEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      const updatedPlayer = yield* gameEffects.addContext(gameState.player, 'Dodge')
      return {
        ...gameState,
        player: updatedPlayer,
        log: [...gameState.log, 'Player prepares to dodge the next attack']
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'dodge',
    category: 'defense'
  }
})

// Context Cards
const createLoadBalancerEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      const updatedPlayer = yield* gameEffects.addContext(gameState.player, 'LoadBalancer')
      return {
        ...gameState,
        player: updatedPlayer,
        log: [...gameState.log, 'LoadBalancer context activated']
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'load_balancer',
    category: 'context'
  }
})

const createDataCacheEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      const updatedPlayer = yield* gameEffects.addContext(gameState.player, 'Cache')
      return {
        ...gameState,
        player: updatedPlayer,
        log: [...gameState.log, 'Cache context activated']
      }
    }),
  
  validate: (card, gameState) =>
    gameState.player.energy >= card.cost
      ? Effect.void
      : Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        })),
  
  metadata: {
    id: 'data_cache',
    category: 'context'
  }
})

// Dependent Cards
const createOverclockAttackEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      const updatedEnemy = yield* gameEffects.dealDamage(gameState.enemy, 15)
      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Player deals 15 damage to ${gameState.enemy.name} (overclocked)`]
      }
    }),
  
  validate: (card, gameState) =>
    Effect.gen(function* () {
      if (gameState.player.energy < card.cost) {
        return yield* Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        }))
      }
      
      if (!gameState.player.contexts.includes('HighEnergy')) {
        return yield* Effect.fail(new RequiredContextMissing({
          required: 'HighEnergy',
          available: [...gameState.player.contexts]
        }))
      }
    }),
  
  metadata: {
    id: 'overclock_attack',
    category: 'dependent'
  }
})

const createShieldSlamEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      const damage = gameState.player.shield
      const updatedEnemy = yield* gameEffects.dealDamage(gameState.enemy, damage)
      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Player deals ${damage} damage to ${gameState.enemy.name} (shield slam)`]
      }
    }),
  
  validate: (card, gameState) =>
    Effect.gen(function* () {
      if (gameState.player.energy < card.cost) {
        return yield* Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        }))
      }
      
      if (gameState.player.shield === 0) {
        return yield* Effect.fail(new RequiredContextMissing({
          required: 'Shield > 0',
          available: [`Shield: ${gameState.player.shield}`]
        }))
      }
    }),
  
  metadata: {
    id: 'shield_slam',
    category: 'dependent'
  }
})

const createExecuteAlgorithmEffect = (gameEffects: GameEffects): CardEffect => ({
  execute: (gameState, cardId, targetId) =>
    Effect.gen(function* () {
      if (!gameState.enemy) return gameState
      
      const updatedEnemy = yield* gameEffects.dealDamage(gameState.enemy, 20)
      return {
        ...gameState,
        enemy: updatedEnemy,
        log: [...gameState.log, `Player deals 20 damage to ${gameState.enemy.name} (algorithm executed)`]
      }
    }),
  
  validate: (card, gameState) =>
    Effect.gen(function* () {
      if (gameState.player.energy < card.cost) {
        return yield* Effect.fail(new InsufficientEnergy({
          required: card.cost,
          available: gameState.player.energy
        }))
      }
      
      if (!gameState.player.contexts.includes('Algorithm')) {
        return yield* Effect.fail(new RequiredContextMissing({
          required: 'Algorithm',
          available: [...gameState.player.contexts]
        }))
      }
    }),
  
  metadata: {
    id: 'execute_algorithm',
    category: 'dependent'
  }
})

// Bootstrap layer that registers all card effects
export const CardBootstrapLayer = Layer.effectDiscard(
  Effect.gen(function* () {
    const registry = yield* CardRegistry
    const gameEffects = yield* GameEffects
    
    // Register all card effects
    const strikeEffect = createStrikeEffect(gameEffects)
    const heavyStrikeEffect = createHeavyStrikeEffect(gameEffects)
    const quickStrikeEffect = createQuickStrikeEffect(gameEffects)
    const preciseStrikeEffect = createPreciseStrikeEffect(gameEffects)
    const wildStrikeEffect = createWildStrikeEffect(gameEffects)
    const blockEffect = createBlockEffect(gameEffects)
    const shieldUpEffect = createShieldUpEffect(gameEffects)
    const dodgeEffect = createDodgeEffect(gameEffects)
    const initAlgorithmEffect = createInitAlgorithmEffect(gameEffects)
    const energySurgeEffect = createEnergySurgeEffect(gameEffects)
    const loadBalancerEffect = createLoadBalancerEffect(gameEffects)
    const dataCacheEffect = createDataCacheEffect(gameEffects)
    const overclockAttackEffect = createOverclockAttackEffect(gameEffects)
    const shieldSlamEffect = createShieldSlamEffect(gameEffects)
    const executeAlgorithmEffect = createExecuteAlgorithmEffect(gameEffects)
    
    // Attack Cards
    yield* registry.registerEffect('strike', strikeEffect)
    yield* registry.registerEffect('heavy_strike', heavyStrikeEffect)
    yield* registry.registerEffect('quick_strike', quickStrikeEffect)
    yield* registry.registerEffect('precise_strike', preciseStrikeEffect)
    yield* registry.registerEffect('wild_strike', wildStrikeEffect)
    
    // Defense Cards
    yield* registry.registerEffect('block', blockEffect)
    yield* registry.registerEffect('shield_up', shieldUpEffect)
    yield* registry.registerEffect('dodge', dodgeEffect)
    
    // Context Cards
    yield* registry.registerEffect('init_algorithm', initAlgorithmEffect)
    yield* registry.registerEffect('energy_surge', energySurgeEffect)
    yield* registry.registerEffect('load_balancer', loadBalancerEffect)
    yield* registry.registerEffect('data_cache', dataCacheEffect)
    
    // Dependent Cards
    yield* registry.registerEffect('overclock_attack', overclockAttackEffect)
    yield* registry.registerEffect('shield_slam', shieldSlamEffect)
    yield* registry.registerEffect('execute_algorithm', executeAlgorithmEffect)
  })
)