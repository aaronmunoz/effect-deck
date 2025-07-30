import chalk from 'chalk'
import boxen from 'boxen'
import type { Card, GameState, Player } from '@effect-deck/core'
import { 
  type TextDisplayMode, 
  DISPLAY_MODE_CONFIGS, 
  smartTruncate, 
  calculateCardWidth 
} from './text-display-mode'

// Simple synchronous validation for CLI display purposes
const canPlayCardForDisplay = (card: Card, player: Player): boolean => {
  if (player.energy < card.cost) return false
  
  if (card.type === 'dependent') {
    switch (card.id) {
      case 'overclock_attack':
        return player.contexts.includes('HighEnergy')
      case 'shield_slam':
        return player.shield > 0
      case 'execute_algorithm':
        return player.contexts.includes('Algorithm')
      default:
        return true
    }
  }
  
  return true
}

export class CardDisplay {
  
  /**
   * Render a single card as a beautiful ASCII card
   */
  renderCard(
    card: Card, 
    gameState: GameState, 
    selected = false, 
    displayMode: TextDisplayMode = 'normal'
  ): string {
    const playable = canPlayCardForDisplay(card, gameState.player)
    const cardColor = this.getCardColor(card.type, playable)
    const borderColor = selected ? 'yellow' : (playable ? 'green' : 'red')
    
    const config = DISPLAY_MODE_CONFIGS[displayMode]
    const cardArt = this.getCardArt(card.type)
    const costIcon = this.getCostIcon(card.cost)
    
    // Apply smart truncation based on display mode
    const cardName = smartTruncate(card.name, config.maxNameLength, displayMode)
    const description = smartTruncate(card.description, config.maxDescLength, displayMode)
    
    // Calculate card width
    const cardWidth = calculateCardWidth(card.name, card.description, displayMode)
    
    const cardContent = [
      chalk.bold(cardColor(cardName.toUpperCase())),
      '',
      cardColor(cardArt),
      '',
      chalk.dim(description),
      '',
      `${costIcon} ${chalk.bold(card.cost)} Energy`
    ].join('\n')

    const boxenOptions: any = {
      padding: 1,
      margin: { top: 0, bottom: 0, left: 1, right: 1 },
      borderStyle: selected ? 'double' : 'round',
      borderColor: borderColor as any,
      textAlignment: 'center'
    }
    
    // Only set width for non-full modes
    if (displayMode !== 'full') {
      boxenOptions.width = cardWidth
    }

    return boxen(cardContent, boxenOptions)
  }

  /**
   * Render multiple cards in a hand layout
   */
  renderHand(
    cards: Card[], 
    gameState: GameState, 
    selectedIndex = -1, 
    displayMode: TextDisplayMode = 'normal'
  ): string {
    if (cards.length === 0) {
      return chalk.dim('No cards in hand')
    }

    const cardDisplays = cards.map((card, index) => 
      this.renderCard(card, gameState, index === selectedIndex, displayMode)
    )

    // Adjust cards per row based on display mode
    const cardsPerRow = displayMode === 'full' ? 2 : displayMode === 'normal' ? 3 : 4
    
    // Split into rows
    const rows: string[][] = []
    for (let i = 0; i < cardDisplays.length; i += cardsPerRow) {
      rows.push(cardDisplays.slice(i, i + cardsPerRow))
    }

    return rows.map(row => this.combineCardsHorizontally(row)).join('\n\n')
  }

  /**
   * Get ASCII art for different card types
   */
  private getCardArt(type: Card['type']): string {
    switch (type) {
      case 'attack':
        return [
          '    ⚔️    ',
          '  ╱ ╲  ',
          ' ╱   ╲ ',
          '╱_____╲'
        ].join('\n')
      
      case 'defense':
        return [
          '   🛡️   ',
          '  ╭───╮  ',
          ' │ ░░░ │ ',
          '  ╰───╯  '
        ].join('\n')
      
      case 'context':
        return [
          '   ⚙️   ',
          '  ╭─●─╮  ',
          ' │ ●●● │ ',
          '  ╰─●─╯  '
        ].join('\n')
      
      case 'dependent':
        return [
          '   🔗   ',
          '  ╭─◇─╮  ',
          ' │ ◇◇◇ │ ',
          '  ╰─◇─╯  '
        ].join('\n')
      
      default:
        return [
          '   ✨   ',
          '  ╭───╮  ',
          ' │ ??? │ ',
          '  ╰───╯  '
        ].join('\n')
    }
  }

  /**
   * Get cost icon based on energy amount
   */
  private getCostIcon(cost: number): string {
    if (cost === 0) return '🆓'
    if (cost <= 2) return '⚡'
    if (cost <= 4) return '🔥'
    return '💀'
  }

  /**
   * Get color scheme for card type
   */
  private getCardColor(type: Card['type'], playable: boolean) {
    if (!playable) return chalk.gray

    switch (type) {
      case 'attack':
        return chalk.red
      case 'defense':
        return chalk.blue
      case 'context':
        return chalk.green
      case 'dependent':
        return chalk.magenta
      default:
        return chalk.white
    }
  }

  /**
   * Combine multiple card displays horizontally
   */
  private combineCardsHorizontally(cardDisplays: string[]): string {
    if (cardDisplays.length === 0) return ''
    if (cardDisplays.length === 1) return cardDisplays[0]

    const cardLines = cardDisplays.map(card => card.split('\n'))
    const maxLines = Math.max(...cardLines.map(lines => lines.length))
    
    const combinedLines: string[] = []
    for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
      const line = cardLines
        .map(lines => lines[lineIndex] || '')
        .join('  ') // Add spacing between cards
      combinedLines.push(line)
    }

    return combinedLines.join('\n')
  }

  /**
   * Create a card selection prompt display with detailed view
   */
  renderCardSelection(
    cards: Card[], 
    gameState: GameState, 
    hoveredIndex: number, 
    displayMode: TextDisplayMode = 'normal'
  ): string {
    const title = chalk.bold.cyan('🃏 Select a Card to Play 🃏')
    const handDisplay = this.renderHand(cards, gameState, hoveredIndex, displayMode)
    
    // Show detailed view of selected card
    const selectedCard = cards[hoveredIndex]
    const cardDetails = selectedCard ? this.renderCardDetails(selectedCard, gameState) : ''
    
    // Display mode indicator and instructions
    const modeConfig = DISPLAY_MODE_CONFIGS[displayMode]
    const modeIndicator = chalk.yellow(`[${displayMode.toUpperCase()} MODE] ${modeConfig.description}`)
    
    const instructions = [
      chalk.dim('Navigation: ↑/↓ or 1-9 to select, Enter to play, T to toggle display, E to end turn, Q to quit'),
      ''
    ].join('\n')

    return [
      title, 
      modeIndicator,
      '', 
      handDisplay, 
      '', 
      cardDetails,
      '',
      instructions
    ].filter(Boolean).join('\n')
  }

  /**
   * Render detailed view of a specific card with full text
   */
  private renderCardDetails(card: Card, gameState: GameState): string {
    const playable = canPlayCardForDisplay(card, gameState.player)
    const cardColor = this.getCardColor(card.type, playable)
    
    const statusText = playable 
      ? chalk.green('✅ PLAYABLE') 
      : chalk.red(`❌ NEED ${card.cost} ENERGY (have ${gameState.player.energy})`)
    
    const typeText = this.getCardTypeDescription(card.type)
    
    const detailsContent = [
      chalk.bold(cardColor(`${card.name.toUpperCase()}`)),
      chalk.cyan(`Type: ${typeText}`),
      chalk.yellow(`Cost: ⚡ ${card.cost} Energy`),
      '',
      chalk.white('Effect:'),
      chalk.dim(card.description),
      '',
      statusText
    ].join('\n')

    return boxen(detailsContent, {
      title: '📋 CARD DETAILS',
      titleAlignment: 'center',
      padding: 1,
      margin: { top: 0, bottom: 0, left: 1, right: 1 },
      borderStyle: 'single',
      borderColor: playable ? 'green' : 'red',
      textAlignment: 'left'
    })
  }

  /**
   * Get human-readable card type description
   */
  private getCardTypeDescription(type: Card['type']): string {
    switch (type) {
      case 'attack':
        return '⚔️ Attack - Deals damage to enemies'
      case 'defense':
        return '🛡️ Defense - Provides protection or healing'
      case 'context':
        return '⚙️ Context - Grants temporary abilities or states'
      case 'dependent':
        return '🔗 Dependent - Enhanced effects based on contexts'
      default:
        return '✨ Special - Unique effect'
    }
  }
}