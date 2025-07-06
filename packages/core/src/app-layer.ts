import { Layer } from 'effect'
import { GameEngineLayer } from './game-engine.js'
import { CardRegistryLive } from './card-registry.js'
import { GameEffectsLive } from './game-effects.js'
import { CardBootstrapLayer } from './card-bootstrap.js'

// First provide the basic services
const BaseServicesLayer = Layer.mergeAll(
  CardRegistryLive,
  GameEffectsLive
)

// Then provide services that depend on the base services
const GameWithCardsLayer = Layer.provide(
  Layer.mergeAll(
    GameEngineLayer,
    CardBootstrapLayer
  ),
  BaseServicesLayer
)

// Complete application layer that provides all services
export const AppLayer = Layer.merge(
  GameWithCardsLayer,
  BaseServicesLayer
)