import { Schema } from 'effect'

export const CardSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  cost: Schema.Number,
  description: Schema.String,
  type: Schema.Literal('attack', 'defense', 'context', 'dependent'),
})

export const PlayerSchema = Schema.Struct({
  id: Schema.String,
  health: Schema.Number,
  maxHealth: Schema.Number,
  energy: Schema.Number,
  maxEnergy: Schema.Number,
  shield: Schema.Number,
  hand: Schema.Array(CardSchema),
  deck: Schema.Array(CardSchema),
  discard: Schema.Array(CardSchema),
  contexts: Schema.Array(Schema.String),
})

export const EnemySchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  health: Schema.Number,
  maxHealth: Schema.Number,
  shield: Schema.Number,
  intent: Schema.String,
  damage: Schema.Number,
})

export const GameStateSchema = Schema.Struct({
  id: Schema.String,
  turn: Schema.Number,
  phase: Schema.Literal('draw', 'action', 'enemy', 'cleanup'),
  player: PlayerSchema,
  enemy: Schema.optional(EnemySchema),
  log: Schema.Array(Schema.String),
  isGameOver: Schema.Boolean,
  victory: Schema.Boolean,
})

export const GameActionSchema = Schema.Union(
  Schema.Struct({
    type: Schema.Literal('play_card'),
    cardId: Schema.String,
    targetId: Schema.optional(Schema.String),
  }),
  Schema.Struct({
    type: Schema.Literal('end_turn'),
  }),
  Schema.Struct({
    type: Schema.Literal('start_game'),
  })
)

export const GameResponseSchema = Schema.Struct({
  gameState: GameStateSchema,
  validActions: Schema.Array(GameActionSchema),
  error: Schema.optional(Schema.String),
})

export type Card = Schema.Schema.Type<typeof CardSchema>
export type Player = Schema.Schema.Type<typeof PlayerSchema>
export type Enemy = Schema.Schema.Type<typeof EnemySchema>
export type GameState = Schema.Schema.Type<typeof GameStateSchema>
export type GameAction = Schema.Schema.Type<typeof GameActionSchema>
export type GameResponse = Schema.Schema.Type<typeof GameResponseSchema>