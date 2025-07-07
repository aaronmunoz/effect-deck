import chalk from 'chalk'
import boxen from 'boxen'
import type { Card, GameState } from '@effect-deck/core'
import { canPlayCardSync } from '@effect-deck/core'

export class CardDisplay {
  
  /**
   * Render a single card as a beautiful ASCII card
   */
  renderCard(card: Card, gameState: GameState, selected = false): string {
    const playable = canPlayCardSync(card, gameState.player)
    const cardColor = this.getCardColor(card.type, playable)
    const borderColor = selected ? 'yellow' : (playable ? 'green' : 'red')
    
    const cardArt = this.getCardArt(card.type)
    const costIcon = this.getCostIcon(card.cost)
    
    // Truncate name if too long and pad description to consistent length
    const cardName = card.name.length > 12 ? card.name.substring(0, 12) : card.name
    const description = card.description.length > 18 ? 
      card.description.substring(0, 15) + '...' : 
      card.description
    
    const cardContent = [
      chalk.bold(cardColor(cardName.toUpperCase())),
      '',
      cardColor(cardArt),
      '',
      chalk.dim(description),
      '',
      `${costIcon} ${chalk.bold(card.cost)} Energy`
    ].join('\n')

    return boxen(cardContent, {
      padding: 1,
      margin: { top: 0, bottom: 0, left: 1, right: 1 },
      borderStyle: selected ? 'double' : 'round',
      borderColor: borderColor as any,
      textAlignment: 'center',
      width: 20
    })
  }

  /**
   * Render multiple cards in a hand layout
   */
  renderHand(cards: Card[], gameState: GameState, selectedIndex = -1): string {
    if (cards.length === 0) {
      return chalk.dim('No cards in hand')
    }

    const cardDisplays = cards.map((card, index) => 
      this.renderCard(card, gameState, index === selectedIndex)
    )

    // Split into rows of 4 cards maximum
    const rows: string[][] = []
    for (let i = 0; i < cardDisplays.length; i += 4) {
      rows.push(cardDisplays.slice(i, i + 4))
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
  renderCardSelection(cards: Card[], gameState: GameState, hoveredIndex: number): string {
    const title = chalk.bold.cyan('🃏 Select a Card to Play 🃏')
    const handDisplay = this.renderHand(cards, gameState, hoveredIndex)
    
    // Show detailed view of selected card
    const selectedCard = cards[hoveredIndex]
    const cardDetails = selectedCard ? this.renderCardDetails(selectedCard, gameState) : ''
    
    const instructions = [
      chalk.dim('Navigation: ↑/↓ or 1-9 to select, Enter to play, E to end turn, Q to quit'),
      ''
    ].join('\n')

    return [
      title, 
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
    const playable = canPlayCardSync(card, gameState.player)
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