import chalk from 'chalk'
import type { GameState, GameAction } from '@effect-deck/core'
import { canPlayCardSync } from '@effect-deck/core'
import { CardDisplay } from './card-display'
import { type TextDisplayMode, getNextDisplayMode } from './text-display-mode'

export class InteractiveInput {
  private cardDisplay = new CardDisplay()
  private displayMode: TextDisplayMode = 'normal' // Default to normal mode

  /**
   * Get user input with enhanced interactive card selection
   */
  async getGameAction(gameState: GameState): Promise<GameAction | null> {
    const { player } = gameState
    
    // Show enhanced prompt
    this.renderActionPrompt(gameState)
    
    return new Promise((resolve) => {
      const stdin = process.stdin
      if (typeof stdin.setRawMode === "function") { stdin.setRawMode(true) }
      stdin.resume()
      stdin.setEncoding('utf8')
      
      let selectedCardIndex = 0
      
      const updateDisplay = () => {
        console.clear()
        console.log(this.renderInteractiveCardSelection(gameState, selectedCardIndex))
      }
      
      // Initial display
      updateDisplay()
      
      const onKeyPress = (key: string) => {
        switch (key) {
          case '\u0003': // Ctrl+C
            process.exit(0)
            break
            
          case 'q':
          case 'Q':
            if (typeof stdin.setRawMode === "function") { stdin.setRawMode(false) }
            stdin.pause()
            stdin.removeListener('data', onKeyPress)
            resolve(null) // Quit
            break
            
          case 'e':
          case 'E':
            if (typeof stdin.setRawMode === "function") { stdin.setRawMode(false) }
            stdin.pause()
            stdin.removeListener('data', onKeyPress)
            resolve({ type: 'end_turn' })
            break
            
          case '\u001b[A': // Up arrow
            selectedCardIndex = Math.max(0, selectedCardIndex - 1)
            updateDisplay()
            break
            
          case '\u001b[B': // Down arrow
            selectedCardIndex = Math.min(player.hand.length - 1, selectedCardIndex + 1)
            updateDisplay()
            break
            
          case '\u001b[D': // Left arrow
            selectedCardIndex = Math.max(0, selectedCardIndex - 1)
            updateDisplay()
            break
            
          case '\u001b[C': // Right arrow
            selectedCardIndex = Math.min(player.hand.length - 1, selectedCardIndex + 1)
            updateDisplay()
            break
            
          case '\r': // Enter
          case '\n':
            if (player.hand[selectedCardIndex] && canPlayCardSync(player.hand[selectedCardIndex], player)) {
              if (typeof stdin.setRawMode === "function") { stdin.setRawMode(false) }
              stdin.pause()
              stdin.removeListener('data', onKeyPress)
              resolve({
                type: 'play_card',
                cardId: player.hand[selectedCardIndex].id
              })
            } else {
              this.showError('Cannot play this card!')
              setTimeout(updateDisplay, 1000)
            }
            break
            
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            const cardIndex = parseInt(key) - 1
            if (player.hand[cardIndex] && canPlayCardSync(player.hand[cardIndex], player)) {
              if (typeof stdin.setRawMode === "function") { stdin.setRawMode(false) }
              stdin.pause()
              stdin.removeListener('data', onKeyPress)
              resolve({
                type: 'play_card',
                cardId: player.hand[cardIndex].id
              })
            } else {
              this.showError('Invalid card selection!')
              setTimeout(updateDisplay, 1000)
            }
            break
            
          case 't':
          case 'T':
            this.displayMode = getNextDisplayMode(this.displayMode)
            updateDisplay()
            break
            
          case 'h':
          case 'H':
            this.showHelp()
            setTimeout(updateDisplay, 2000)
            break
            
          default:
            // Ignore other keys
            break
        }
      }
      
      stdin.on('data', onKeyPress)
    })
  }

  private renderActionPrompt(gameState: GameState): void {
    const { player } = gameState
    const playableCards = player.hand.filter(card => canPlayCardSync(card, player))
    
    if (playableCards.length === 0) {
      console.log(chalk.yellow.bold('⚠️ No playable cards - you must end your turn'))
    } else {
      console.log(chalk.green.bold(`✨ You have ${playableCards.length} playable card(s)`))
    }
  }

  private renderInteractiveCardSelection(gameState: GameState, selectedIndex: number): string {
    const { player } = gameState
    
    const title = chalk.bold.cyan('🎮 ═══ CHOOSE YOUR ACTION ═══ 🎮')
    const cardSelection = this.cardDisplay.renderCardSelection([...player.hand], gameState, selectedIndex, this.displayMode)
    
    const energyDisplay = chalk.yellow(`⚡ Energy: ${player.energy}/${player.maxEnergy}`)
    
    return [
      title,
      '',
      energyDisplay,
      '',
      cardSelection
    ].join('\n')
  }

  private showError(message: string): void {
    console.log(chalk.red.bold(`❌ ${message}`))
  }

  private showHelp(): void {
    console.clear()
    const helpText = [
      chalk.bold.cyan('🎮 EFFECT DECK - HELP 🎮'),
      '',
      chalk.yellow('GAME OBJECTIVE:'),
      '• Defeat the enemy by reducing their health to 0',
      '• Use cards wisely - they cost energy!',
      '• Survive enemy attacks by using shields and healing',
      '',
      chalk.yellow('CARD TYPES:'),
      '• ⚔️  Attack cards - Deal damage to enemies',
      '• 🛡️  Defense cards - Gain shield or heal',
      '• ⚙️  Skill cards - Special effects and utilities',
      '',
      chalk.yellow('ENERGY SYSTEM:'),
      '• Each card costs energy to play',
      '• Energy resets at the start of your turn',
      '• Plan your turns carefully!',
      '',
      chalk.yellow('CONTROLS:'),
      '• Arrow keys or 1-9 to select cards',
      '• Enter to play selected card',
      '• E to end turn',
      '• Q to quit',
      '',
      chalk.dim('Press any key to continue...')
    ].join('\n')
    
    console.log(helpText)
  }

  /**
   * Simple yes/no prompt with enhanced styling
   */
  async promptYesNo(question: string): Promise<boolean> {
    console.log(chalk.yellow.bold(`❓ ${question}`))
    console.log(chalk.dim('(y/n)'))
    
    return new Promise((resolve) => {
      const stdin = process.stdin
      if (typeof stdin.setRawMode === "function") { stdin.setRawMode(true) }
      stdin.resume()
      stdin.setEncoding('utf8')
      
      const onKeyPress = (key: string) => {
        if (typeof stdin.setRawMode === "function") { stdin.setRawMode(false) }
        stdin.pause()
        stdin.removeListener('data', onKeyPress)
        
        const response = key.toLowerCase()
        if (response === 'y' || response === 'yes') {
          resolve(true)
        } else if (response === 'n' || response === 'no') {
          resolve(false)
        } else {
          // Invalid input, ask again
          setTimeout(() => this.promptYesNo(question).then(resolve), 100)
        }
      }
      
      stdin.on('data', onKeyPress)
    })
  }

  /**
   * Wait for any key press
   */
  async waitForKeyPress(message = 'Press any key to continue...'): Promise<void> {
    console.log(chalk.dim(message))
    
    return new Promise((resolve) => {
      const stdin = process.stdin
      if (typeof stdin.setRawMode === "function") { stdin.setRawMode(true) }
      stdin.resume()
      stdin.setEncoding('utf8')
      
      const onKeyPress = () => {
        if (typeof stdin.setRawMode === "function") { stdin.setRawMode(false) }
        stdin.pause()
        stdin.removeListener('data', onKeyPress)
        resolve()
      }
      
      stdin.on('data', onKeyPress)
    })
  }
}