import { Context, Effect, Layer, Random } from 'effect'

/**
 * GameRandom Service - Abstraction over random number generation
 * Enables deterministic testing and reproducible game sessions
 */
export interface GameRandom {
  readonly nextIntBetween: (min: number, max: number) => Effect.Effect<number>
  readonly nextBoolean: () => Effect.Effect<boolean>
  readonly shuffle: <A>(items: readonly A[]) => Effect.Effect<readonly A[]>
}

export const GameRandom = Context.GenericTag<GameRandom>('GameRandom')

/**
 * Production implementation using Effect's Random
 */
export const GameRandomLive: Layer.Layer<GameRandom> = Layer.succeed(
  GameRandom,
  {
    nextIntBetween: (min, max) => Random.nextIntBetween(min, max),

    nextBoolean: () => Random.nextBoolean,

    shuffle: <A>(items: readonly A[]) =>
      Effect.gen(function* () {
        const array = [...items]
        for (let i = array.length - 1; i > 0; i--) {
          const j = yield* Random.nextIntBetween(0, i)
          ;[array[i], array[j]] = [array[j]!, array[i]!]
        }
        return array
      })
  }
)

/**
 * Test implementation with deterministic behavior
 * Useful for reproducible tests and debugging
 */
export const GameRandomTest = (options?: {
  intValue?: number
  booleanValue?: boolean
}): Layer.Layer<GameRandom> =>
  Layer.succeed(GameRandom, {
    nextIntBetween: (min, _max) => Effect.succeed(options?.intValue ?? min),
    nextBoolean: () => Effect.succeed(options?.booleanValue ?? true),
    shuffle: <A>(items: readonly A[]) => Effect.succeed(items)
  })

/**
 * Seeded random implementation for reproducible randomness
 */
export class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  // Simple LCG (Linear Congruential Generator)
  private next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff
    return this.seed
  }

  nextIntBetween(min: number, max: number): number {
    const range = max - min + 1
    return min + (this.next() % range)
  }
}

/**
 * Seeded implementation for reproducible game sessions
 */
export const GameRandomSeeded = (seed: number): Layer.Layer<GameRandom> => {
  const seededRng = new SeededRandom(seed)

  return Layer.succeed(GameRandom, {
    nextIntBetween: (min, max) =>
      Effect.succeed(seededRng.nextIntBetween(min, max)),

    nextBoolean: () =>
      Effect.succeed(seededRng.nextIntBetween(0, 1) === 1),

    shuffle: <A>(items: readonly A[]) =>
      Effect.sync(() => {
        const array = [...items]
        for (let i = array.length - 1; i > 0; i--) {
          const j = seededRng.nextIntBetween(0, i)
          ;[array[i], array[j]] = [array[j]!, array[i]!]
        }
        return array
      })
  })
}

// Helper function to create reproducible game sessions
export const createReproducibleGame = (sessionId: string) => {
  // Generate seed from session ID (hash function)
  const seed = sessionId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0)
  }, 0)

  return GameRandomSeeded(seed)
}
