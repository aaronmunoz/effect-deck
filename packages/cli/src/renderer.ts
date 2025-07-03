import type { GameState, Card } from '@effect-deck/core'
import { canPlayCard } from '@effect-deck/core'

export class GameRenderer {
  render(gameState: GameState): void {
    console.clear()
    this.renderHeader(gameState)
    this.renderEnemy(gameState)
    this.renderPlayer(gameState)
    this.renderHand(gameState)
    this.renderLog(gameState)
  }

  private renderHeader(gameState: GameState): void {
    console.log('=' .repeat(60))
    console.log(`🃏 EFFECT DECK - Turn ${gameState.turn} - Phase: ${gameState.phase.toUpperCase()}`)
    console.log('='.repeat(60))
  }

  private renderEnemy(gameState: GameState): void {
    if (!gameState.enemy) return

    const { enemy } = gameState
    const healthBar = this.createHealthBar(enemy.health, enemy.maxHealth, 20)
    const shieldText = enemy.shield > 0 ? ` 🛡️${enemy.shield}` : ''

    console.log(`\n👾 ${enemy.name}${shieldText}`)
    console.log(`   Health: ${healthBar} ${enemy.health}/${enemy.maxHealth}`)
    console.log(`   Intent: ${enemy.intent}`)
  }

  private renderPlayer(gameState: GameState): void {
    const { player } = gameState
    const healthBar = this.createHealthBar(player.health, player.maxHealth, 20)
    const energyText = '⚡'.repeat(player.energy) + '○'.repeat(player.maxEnergy - player.energy)
    const shieldText = player.shield > 0 ? ` 🛡️${player.shield}` : ''
    const contextsText = player.contexts.length > 0 ? ` [${player.contexts.join(', ')}]` : ''

    console.log(`\n🧑‍💻 Player${shieldText}${contextsText}`)
    console.log(`   Health: ${healthBar} ${player.health}/${player.maxHealth}`)
    console.log(`   Energy: ${energyText} ${player.energy}/${player.maxEnergy}`)
    console.log(`   Deck: ${player.deck.length} | Discard: ${player.discard.length}`)
  }

  private renderHand(gameState: GameState): void {
    const { player } = gameState
    
    if (player.hand.length === 0) {
      console.log('\n🃏 Hand: (empty)')
      return
    }

    console.log('\n🃏 Hand:')
    player.hand.forEach((card, index) => {
      const playable = this.canPlayCardHelper(card, gameState)
      const prefix = playable ? '✅' : '❌'
      const costText = `⚡${card.cost}`
      console.log(`   ${index + 1}. ${prefix} ${card.name} (${costText}) - ${card.description}`)
    })
  }

  private renderLog(gameState: GameState): void {
    const recentLogs = gameState.log.slice(-5)
    console.log('\n📜 Recent Actions:')
    recentLogs.forEach(log => console.log(`   • ${log}`))
  }

  private createHealthBar(current: number, max: number, width: number): string {
    const filled = Math.floor((current / max) * width)
    const empty = width - filled
    return '█'.repeat(filled) + '░'.repeat(empty)
  }

  private canPlayCardHelper(card: Card, gameState: GameState): boolean {
    return canPlayCard(card, gameState.player)
  }
}