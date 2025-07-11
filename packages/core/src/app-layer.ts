import { Layer } from 'effect'
import { GameEngineLayer } from './game-engine'
import { CardRegistryLive } from './card-registry'
import { GameEffectsLive } from './game-effects'
import { CardBootstrapLayer } from './card-bootstrap'

// First provide the basic services
const BaseServicesLayer = Layer.mergeAll(
  CardRegistryLive,
  GameEffectsLive
)

// Then provide services that depend on the base services
// GameEngineLayer needs CardRegistry, so we need to provide it properly
const GameWithCardsLayer = Layer.provide(
  GameEngineLayer,
  Layer.mergeAll(
    BaseServicesLayer,
    CardBootstrapLayer
  )
)

// Complete application layer that provides ALL required services
export const AppLayer = Layer.mergeAll(
  GameWithCardsLayer,
  BaseServicesLayer
)

// Debug: Let's explicitly list what services this layer should provide
// It should provide: GameEngine, GameStateRef, CardRegistry, GameEffects