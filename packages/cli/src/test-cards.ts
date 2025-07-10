#!/usr/bin/env node

import { CardDisplay } from './card-display'
import type { Card, GameState } from '@effect-deck/core'

// Create test data
const testCards: Card[] = [
  { id: 'strike', name: 'Strike', cost: 1, description: 'Deal 6 damage', type: 'attack' },
  { id: 'block', name: 'Block', cost: 1, description: 'Gain 5 shield', type: 'defense' },
  { id: 'energy_surge', name: 'Energy Surge', cost: 0, description: 'Gain HighEnergy context', type: 'context' }
]

const testGameState: GameState = {
  id: 'test',
  player: {
    id: 'player',
    health: 50,
    maxHealth: 50,
    energy: 3,
    maxEnergy: 3,
    shield: 0,
    hand: testCards,
    deck: [],
    discard: [],
    contexts: []
  },
  enemy: {
    id: 'enemy',
    name: 'Test Enemy',
    health: 30,
    maxHealth: 30,
    shield: 0,
    intent: 'Attack for 8',
    damage: 8
  },
  phase: 'action',
  turn: 1,
  isGameOver: false,
  victory: false,
  log: []
}

const cardDisplay = new CardDisplay()

console.log('=== Testing Single Card ===')
console.log(cardDisplay.renderCard(testCards[0], testGameState))

console.log('\n=== Testing Hand Display ===')
console.log(cardDisplay.renderHand(testCards, testGameState))

console.log('\n=== Testing Card Selection ===')  
console.log(cardDisplay.renderCardSelection(testCards, testGameState, 1))