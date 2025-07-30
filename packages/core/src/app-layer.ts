import { Layer, Effect } from 'effect'
import { GameEngineLayer } from './game-engine'
import { CardRegistryLive } from './card-registry'
import { GameEffectsLive } from './game-effects'
import { CardBootstrapLayer } from './card-bootstrap-new'

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

// Phase 2: Core Services + Bootstrap (ensures cards are registered)
const BootstrappedServicesLayer = Layer.provide(
  Layer.mergeAll(
    CoreServicesLayer,
    CardBootstrapLayer
  ),
  CoreServicesLayer
)

// Phase 3: Complete Application Layer with all services
export const AppLayer = Layer.provide(
  Layer.mergeAll(
    BootstrappedServicesLayer,
    GameEngineLayer
  ),
  BootstrappedServicesLayer
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