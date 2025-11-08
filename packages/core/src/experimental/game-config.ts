import { Context, Effect, Layer, Config } from 'effect'

/**
 * GameConfig Service - Centralized game balance and configuration
 *
 * Benefits:
 * - Easy game balancing without code changes
 * - Different difficulty modes
 * - Environment-based configuration
 * - A/B testing different parameters
 */
export interface GameConfig {
  readonly player: {
    readonly initialHealth: number
    readonly maxHealth: number
    readonly initialEnergy: number
    readonly maxEnergy: number
    readonly startingHandSize: number
    readonly cardsPerTurn: number
  }
  readonly enemy: {
    readonly basic: {
      readonly health: number
      readonly damage: number
      readonly name: string
    }
    readonly elite: {
      readonly health: number
      readonly damage: number
      readonly name: string
    }
  }
  readonly cards: {
    readonly strikeDamage: number
    readonly blockShield: number
    readonly heavyStrikeDamage: number
  }
  readonly difficulty: 'easy' | 'normal' | 'hard'
}

export const GameConfig = Context.GenericTag<GameConfig>('GameConfig')

/**
 * Default configuration (normal difficulty)
 */
export const defaultConfig: GameConfig = {
  player: {
    initialHealth: 50,
    maxHealth: 50,
    initialEnergy: 3,
    maxEnergy: 3,
    startingHandSize: 5,
    cardsPerTurn: 2
  },
  enemy: {
    basic: {
      health: 30,
      damage: 8,
      name: 'Corrupted Process'
    },
    elite: {
      health: 60,
      damage: 12,
      name: 'System Administrator'
    }
  },
  cards: {
    strikeDamage: 6,
    blockShield: 5,
    heavyStrikeDamage: 12
  },
  difficulty: 'normal'
}

/**
 * Configuration presets for different difficulty levels
 */
export const DifficultyPresets = {
  easy: {
    ...defaultConfig,
    player: {
      ...defaultConfig.player,
      initialHealth: 75,
      maxHealth: 75,
      initialEnergy: 4
    },
    enemy: {
      basic: {
        ...defaultConfig.enemy.basic,
        health: 20,
        damage: 5
      },
      elite: {
        ...defaultConfig.enemy.elite,
        health: 40,
        damage: 8
      }
    },
    difficulty: 'easy' as const
  },

  normal: defaultConfig,

  hard: {
    ...defaultConfig,
    player: {
      ...defaultConfig.player,
      initialHealth: 35,
      maxHealth: 35,
      initialEnergy: 2,
      startingHandSize: 4
    },
    enemy: {
      basic: {
        ...defaultConfig.enemy.basic,
        health: 40,
        damage: 12
      },
      elite: {
        ...defaultConfig.enemy.elite,
        health: 80,
        damage: 18
      }
    },
    difficulty: 'hard' as const
  }
}

/**
 * Live layer with environment variable support
 */
export const GameConfigLive: Layer.Layer<GameConfig> = Layer.effect(
  GameConfig,
  Effect.gen(function* () {
    // Read difficulty from environment, default to 'normal'
    const difficulty = yield* Config.string("GAME_DIFFICULTY").pipe(
      Config.withDefault("normal"),
      Config.map((d) => {
        if (d === 'easy' || d === 'normal' || d === 'hard') return d
        return 'normal'
      })
    )

    // Start with preset for difficulty
    const preset = DifficultyPresets[difficulty]

    // Allow individual overrides via environment variables
    const playerHealth = yield* Config.number("PLAYER_HEALTH").pipe(
      Config.withDefault(preset.player.initialHealth)
    )

    const playerEnergy = yield* Config.number("PLAYER_ENERGY").pipe(
      Config.withDefault(preset.player.initialEnergy)
    )

    const enemyHealth = yield* Config.number("ENEMY_HEALTH").pipe(
      Config.withDefault(preset.enemy.basic.health)
    )

    const enemyDamage = yield* Config.number("ENEMY_DAMAGE").pipe(
      Config.withDefault(preset.enemy.basic.damage)
    )

    return {
      ...preset,
      player: {
        ...preset.player,
        initialHealth: playerHealth,
        maxHealth: playerHealth,
        initialEnergy: playerEnergy
      },
      enemy: {
        ...preset.enemy,
        basic: {
          ...preset.enemy.basic,
          health: enemyHealth,
          damage: enemyDamage
        }
      },
      difficulty
    }
  })
)

/**
 * Test layer with custom config
 */
export const GameConfigTest = (config: Partial<GameConfig> = {}): Layer.Layer<GameConfig> =>
  Layer.succeed(GameConfig, {
    ...defaultConfig,
    ...config,
    player: {
      ...defaultConfig.player,
      ...config.player
    },
    enemy: {
      basic: {
        ...defaultConfig.enemy.basic,
        ...config.enemy?.basic
      },
      elite: {
        ...defaultConfig.enemy.elite,
        ...config.enemy?.elite
      }
    },
    cards: {
      ...defaultConfig.cards,
      ...config.cards
    }
  })

/**
 * Helper to create a config for specific difficulty
 */
export const GameConfigWithDifficulty = (
  difficulty: 'easy' | 'normal' | 'hard'
): Layer.Layer<GameConfig> =>
  Layer.succeed(GameConfig, DifficultyPresets[difficulty])
