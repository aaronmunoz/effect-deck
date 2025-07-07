#!/usr/bin/env node

import { CardDisplay } from './card-display'
import type { TextDisplayMode } from './text-display-mode'

// Create test cards with varying lengths to show the differences
const testCards = [
  {
    id: 'strike',
    name: 'Strike',
    cost: 1,
    description: 'Deal 6 damage',
    type: 'attack' as const
  },
  {
    id: 'overclock_attack',
    name: 'Overclock Attack',
    cost: 2,
    description: 'Deal 15 damage to target enemy. Can only be played if you have HighEnergy context. Consumes HighEnergy context after use.',
    type: 'dependent' as const
  },
  {
    id: 'advanced_shield_protocol',
    name: 'Advanced Shield Protocol System',
    cost: 3,
    description: 'Gain 12 shield points and LoadBalancer context. If you already have Algorithm context active, gain an additional 5 shield points and draw 1 card from your deck.',
    type: 'defense' as const
  }
]

const testGameState = {
  player: { 
    energy: 3,
    contexts: [] // Required by canPlayCardSync
  }
}

const cardDisplay = new CardDisplay()

function testDisplayMode(mode: TextDisplayMode) {
  console.log(`\n=== ${mode.toUpperCase()} MODE ===`)
  
  testCards.forEach((card, index) => {
    console.log(`\nCard ${index + 1}: ${card.name}`)
    console.log(cardDisplay.renderCard(card, testGameState as any, false, mode))
  })
  
  console.log(`\nHand display (${mode} mode):`)
  console.log(cardDisplay.renderHand(testCards, testGameState as any, 1, mode))
}

// Test all three modes
testDisplayMode('compact')
testDisplayMode('normal')
testDisplayMode('full')

console.log('\n=== CARD SELECTION EXAMPLE (Normal Mode) ===')
console.log(cardDisplay.renderCardSelection(testCards, testGameState as any, 1, 'normal'))