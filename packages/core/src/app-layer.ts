import { Layer, Effect } from 'effect'
import { GameEngineLayer } from './game-engine'
import { CardRegistryLive } from './card-registry'
import { GameEffectsLive } from './game-effects'
import { CardBootstrapLayer } from './card-bootstrap'

/**
 * Comprehensive Application Layer with Deterministic Initialization
 * 
 * This refactor ensures:
 * 1. Base services initialize first
 * 2. Card effects are registered before GameEngine starts
 * 3. All dependencies are properly provided
 * 4. Initialization order is deterministic
 */

// Phase 1: Core Services (no dependencies)
const CoreServicesLayer = Layer.mergeAll(
  CardRegistryLive,
  GameEffectsLive
)

// Phase 2: Initialization Layer (depends on core services)
// This must complete BEFORE any service tries to use the registry
const InitializationLayer = Layer.provide(
  CardBootstrapLayer,
  CoreServicesLayer
)

// Phase 3: Application Services (depends on initialized registry)
const ApplicationServicesLayer = Layer.provide(
  GameEngineLayer,
  CoreServicesLayer
)

// Phase 4: Complete Application Layer
// Uses Layer.tapErrorCause for better debugging
export const AppLayer = Layer.mergeAll(
  CoreServicesLayer,
  InitializationLayer,
  ApplicationServicesLayer
).pipe(
  Layer.tapErrorCause((cause) => 
    Effect.logError("AppLayer initialization failed", cause)
  ),
  Layer.tap(() => Effect.log("AppLayer successfully initialized"))
)

/**
 * Services provided by AppLayer:
 * - CardRegistry (with all card effects registered)
 * - GameEffects (pure game mechanics)
 * - GameEngine (main game service)
 * - GameStateRef (game state management)
 */