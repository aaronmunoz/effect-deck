import chalk from 'chalk'
import gradient from 'gradient-string'
import figlet from 'figlet'
import boxen from 'boxen'
import Table from 'cli-table3'
import type { GameState } from '@effect-deck/core'

export class FlashyRenderer {

  async render(gameState: GameState): Promise<void> {
    console.clear()
    
    await this.renderBanner()
    this.renderGameInfo(gameState)
    this.renderBattlefield(gameState)
    this.renderPlayerStatus(gameState)
    this.renderHandCards(gameState)
    this.renderGameLog(gameState)
    this.renderControls()
  }

  private async renderBanner(): Promise<void> {
    const title = figlet.textSync('EFFECT DECK', {
      font: 'Small',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    })
    
    const gradientTitle = gradient.rainbow(title)
    console.log(gradientTitle)
    console.log(chalk.dim('═'.repeat(80)))
  }

  private renderGameInfo(gameState: GameState): void {
    const turnInfo = chalk.bold.cyan(`🎮 Turn ${gameState.turn}`)
    const phaseInfo = chalk.bold.yellow(`📋 Phase: ${gameState.phase.toUpperCase()}`)
    const statusInfo = gameState.isGameOver 
      ? (gameState.victory ? chalk.bold.green('🎉 VICTORY!') : chalk.bold.red('💀 DEFEAT'))
      : chalk.bold.white('⚡ In Progress')

    const infoTable = new Table({
      head: [turnInfo, phaseInfo, statusInfo],
      style: { 
        head: [], 
        border: ['cyan'],
        'padding-left': 2,
        'padding-right': 2
      },
      colWidths: [20, 20, 20]
    })

    console.log(infoTable.toString())
  }

  private renderBattlefield(gameState: GameState): void {
    if (!gameState.enemy) return

    const { enemy } = gameState
    
    // Enemy display
    const enemyHealth = this.createStyledHealthBar(enemy.health, enemy.maxHealth, 30, 'red')
    const enemyShield = enemy.shield > 0 ? chalk.blue(`🛡️ ${enemy.shield}`) : ''
    const enemyName = chalk.bold.red(`👾 ${enemy.name} ${enemyShield}`)
    
    const enemyBox = boxen(
      [
        enemyName,
        '',
        `Health: ${enemyHealth} ${chalk.white(`${enemy.health}/${enemy.maxHealth}`)}`,
        `Intent: ${chalk.yellow(enemy.intent)}`,
        '',
        this.getEnemyArt()
      ].join('\n'),
      {
        title: '🏟️ BATTLEFIELD',
        titleAlignment: 'center',
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'red'
      }
    )

    console.log(enemyBox)
  }

  private renderPlayerStatus(gameState: GameState): void {
    const { player } = gameState
    
    const playerHealth = this.createStyledHealthBar(player.health, player.maxHealth, 30, 'green')
    const playerShield = player.shield > 0 ? chalk.blue(`🛡️ ${player.shield}`) : ''
    const playerName = chalk.bold.green(`🧑‍💻 You ${playerShield}`)
    
    const energyBalls = '⚡'.repeat(player.energy) + '○'.repeat(player.maxEnergy - player.energy)
    const energyDisplay = chalk.yellow(energyBalls) + chalk.dim(` (${player.energy}/${player.maxEnergy})`)
    
    const contexts = player.contexts.length > 0 
      ? player.contexts.map(c => chalk.bgMagenta.white(` ${c} `)).join(' ')
      : chalk.dim('None')

    const deckInfo = [
      chalk.cyan(`📚 Deck: ${player.deck.length}`),
      chalk.gray(`🗑️ Discard: ${player.discard.length}`)
    ].join('  |  ')

    const playerBox = boxen(
      [
        playerName,
        '',
        `Health: ${playerHealth} ${chalk.white(`${player.health}/${player.maxHealth}`)}`,
        `Energy: ${energyDisplay}`,
        `Status: ${contexts}`,
        `Cards: ${deckInfo}`
      ].join('\n'),
      {
        title: '🛡️ PLAYER STATUS',
        titleAlignment: 'center',
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green'
      }
    )

    console.log(playerBox)
  }

  private renderHandCards(gameState: GameState): void {
    const { player } = gameState
    
    if (player.hand.length === 0) {
      const emptyHand = boxen(
        chalk.dim.italic('No cards in hand'),
        {
          title: '🃏 HAND SUMMARY',
          titleAlignment: 'center',
          padding: 1,
          margin: 1,
          borderStyle: 'single',
          borderColor: 'gray'
        }
      )
      console.log(emptyHand)
      return
    }

    // Create compact hand summary instead of full display
    const handSummary = this.createHandSummary(player.hand, gameState)
    
    const handBox = boxen(handSummary, {
      title: '🃏 HAND SUMMARY',
      titleAlignment: 'center',
      padding: 1,
      margin: 1,
      borderStyle: 'single',
      borderColor: 'magenta'
    })
    
    console.log(handBox)
  }

  private createHandSummary(hand: readonly any[], gameState: GameState): string {
    const { player } = gameState
    
    // Count card types
    const counts = {
      attack: hand.filter(c => c.type === 'attack').length,
      defense: hand.filter(c => c.type === 'defense').length,  
      context: hand.filter(c => c.type === 'context').length,
      dependent: hand.filter(c => c.type === 'dependent').length
    }
    
    // Count playable vs unplayable
    const playableCount = hand.filter(card => player.energy >= card.cost).length
    const totalCount = hand.length
    
    const typeDisplay = [
      counts.attack > 0 ? `⚔️ ${counts.attack} Attack` : '',
      counts.defense > 0 ? `🛡️ ${counts.defense} Defense` : '',
      counts.context > 0 ? `⚙️ ${counts.context} Context` : '',
      counts.dependent > 0 ? `🔗 ${counts.dependent} Dependent` : ''
    ].filter(Boolean).join('  |  ')
    
    const playabilityDisplay = `${chalk.green(playableCount)} playable / ${chalk.dim(totalCount)} total`
    
    const cardList = hand.map((card, index) => {
      const playable = player.energy >= card.cost
      const icon = playable ? chalk.green('✓') : chalk.red('✗')
      const name = card.name.length > 12 ? card.name.substring(0, 12) + '...' : card.name
      const cost = playable ? chalk.yellow(`⚡${card.cost}`) : chalk.gray(`⚡${card.cost}`)
      return `${chalk.dim((index + 1) + '.')} ${icon} ${name} ${cost}`
    }).join('\n')
    
    return [
      `Cards: ${playabilityDisplay}`,
      typeDisplay ? `Types: ${typeDisplay}` : '',
      '',
      cardList,
      '',
      chalk.dim('💡 Use interactive mode to see full card details')
    ].filter(Boolean).join('\n')
  }

  private renderGameLog(gameState: GameState): void {
    const recentLogs = gameState.log.slice(-3) // Show last 3 actions
    
    if (recentLogs.length === 0) {
      return
    }

    const logEntries = recentLogs.map((log, index) => {
      const icon = this.getLogIcon(log)
      const styledLog = this.styleLogMessage(log)
      return `${icon} ${styledLog}`
    })

    const logBox = boxen(
      logEntries.join('\n'),
      {
        title: '📜 BATTLE LOG',
        titleAlignment: 'center',
        padding: 1,
        margin: 1,
        borderStyle: 'single',
        borderColor: 'yellow'
      }
    )

    console.log(logBox)
  }

  private renderControls(): void {
    const controls = [
      chalk.cyan('1-9') + chalk.dim(' - Play card by number'),
      chalk.cyan('e') + chalk.dim(' - End turn'),
      chalk.cyan('q') + chalk.dim(' - Quit game'),
      chalk.cyan('h') + chalk.dim(' - Show help')
    ]

    const controlsBox = boxen(
      controls.join('  |  '),
      {
        title: '🎮 CONTROLS',
        titleAlignment: 'center',
        padding: 0,
        margin: 1,
        borderStyle: 'single',
        borderColor: 'cyan'
      }
    )

    console.log(controlsBox)
  }

  private createStyledHealthBar(current: number, max: number, width: number, color: 'red' | 'green'): string {
    const percentage = current / max
    const filled = Math.floor(percentage * width)
    const empty = width - filled
    
    const healthColor = percentage > 0.6 ? 'green' : percentage > 0.3 ? 'yellow' : 'red'
    const filledBar = chalk[healthColor]('█'.repeat(filled))
    const emptyBar = chalk.gray('░'.repeat(empty))
    
    return `${filledBar}${emptyBar}`
  }

  private getEnemyArt(): string {
    return [
      chalk.red('    👾    '),
      chalk.red('   /👁️👁️\\   '),
      chalk.red('  ╔═════╗  '),
      chalk.red('  ║ ▄▄▄ ║  '),
      chalk.red('  ╚═════╝  ')
    ].join('\n')
  }

  private getLogIcon(log: string): string {
    if (log.includes('plays')) return '🎴'
    if (log.includes('damage')) return '⚔️'
    if (log.includes('shield')) return '🛡️'
    if (log.includes('energy')) return '⚡'
    if (log.includes('draws')) return '📚'
    if (log.includes('defeated')) return '💀'
    return '📝'
  }

  private styleLogMessage(log: string): string {
    if (log.includes('damage')) {
      return log.replace(/(\d+) damage/, chalk.red.bold('$1 damage'))
    }
    if (log.includes('shield')) {
      return log.replace(/(\d+) shield/, chalk.blue.bold('$1 shield'))
    }
    if (log.includes('energy')) {
      return log.replace(/(\d+) energy/, chalk.yellow.bold('$1 energy'))
    }
    return chalk.white(log)
  }

  /**
   * Render victory/defeat screen with extra flair
   */
  async renderGameEnd(gameState: GameState): Promise<void> {
    console.clear()
    
    if (gameState.victory) {
      const victoryText = figlet.textSync('VICTORY!', { font: 'Big' })
      console.log(gradient.rainbow(victoryText))
      console.log(chalk.green.bold('🎉 Congratulations! You defeated the enemy! 🎉'))
    } else {
      const defeatText = figlet.textSync('DEFEAT', { font: 'Big' })
      console.log(gradient(['red', 'darkred'])(defeatText))
      console.log(chalk.red.bold('💀 You have been defeated... Try again! 💀'))
    }
    
    console.log('\n' + chalk.dim('Press any key to return to menu...'))
  }
}