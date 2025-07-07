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
    
    const cardContent = [
      chalk.bold(cardColor(card.name.toUpperCase())),
      '',
      cardColor(cardArt),
      '',
      chalk.dim(card.description),
      '',
      `${costIcon} ${chalk.bold(card.cost)} Energy`
    ].join('\n')

    return boxen(cardContent, {
      padding: 1,
      margin: { left: 1, right: 1 },
      borderStyle: selected ? 'double' : 'round',
      borderColor: borderColor as any,
      width: 22,
      textAlignment: 'center'
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
    
    // Ensure all cards have the same number of lines
    cardLines.forEach(lines => {
      while (lines.length < maxLines) {
        lines.push(' '.repeat(24)) // Approximate card width
      }
    })

    const combinedLines: string[] = []
    for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
      const line = cardLines
        .map(lines => lines[lineIndex] || ' '.repeat(24))
        .join(' ')
      combinedLines.push(line)
    }

    return combinedLines.join('\n')
  }

  /**
   * Create a card selection prompt display
   */
  renderCardSelection(cards: Card[], gameState: GameState, hoveredIndex: number): string {
    const title = chalk.bold.cyan('🃏 Select a Card to Play 🃏')
    const handDisplay = this.renderHand(cards, gameState, hoveredIndex)
    
    const instructions = [
      chalk.dim('Use ↑/↓ to navigate, Enter to select, Q to end turn'),
      ''
    ].join('\n')

    return [title, '', handDisplay, '', instructions].join('\n')
  }
}