import { Schema } from 'effect'

// Base game error type
export type GameError =
  | CardNotFound
  | InsufficientEnergy
  | InvalidGamePhase
  | RequiredContextMissing
  | InvalidAction

export class CardNotFound extends Schema.TaggedError<CardNotFound>()("CardNotFound", {
  cardId: Schema.String,
  availableCards: Schema.Array(Schema.String),
}) {
  override get message() {
    return `Card '${this.cardId}' not found. Available cards: ${this.availableCards.join(', ')}`
  }
}

export class InsufficientEnergy extends Schema.TaggedError<InsufficientEnergy>()("InsufficientEnergy", {
  required: Schema.Number,
  available: Schema.Number,
}) {
  override get message() {
    return `Insufficient energy. Required: ${this.required}, Available: ${this.available}`
  }
}

export class InvalidGamePhase extends Schema.TaggedError<InvalidGamePhase>()("InvalidGamePhase", {
  expected: Schema.Array(Schema.String),
  actual: Schema.String,
}) {
  override get message() {
    return `Invalid game phase. Expected: ${this.expected.join(' or ')}, Actual: ${this.actual}`
  }
}

export class RequiredContextMissing extends Schema.TaggedError<RequiredContextMissing>()("RequiredContextMissing", {
  required: Schema.String,
  available: Schema.Array(Schema.String),
}) {
  override get message() {
    return `Required context '${this.required}' is missing. Available contexts: ${this.available.join(', ')}`
  }
}

export class InvalidAction extends Schema.TaggedError<InvalidAction>()("InvalidAction", {
  action: Schema.String,
  reason: Schema.String,
}) {
  override get message() {
    return `Invalid action '${this.action}': ${this.reason}`
  }
}