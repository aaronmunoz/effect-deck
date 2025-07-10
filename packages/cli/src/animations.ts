import chalk from 'chalk'
import ora from 'ora'

export class BattleAnimations {
  
  /**
   * Show damage animation
   */
  async showDamageAnimation(damage: number, target: 'player' | 'enemy'): Promise<void> {
    const targetIcon = target === 'enemy' ? '👾' : '🧑‍💻'
    const damageColor = target === 'enemy' ? chalk.red : chalk.yellow
    
    console.log(chalk.bold(`\n${targetIcon} Taking damage...`))
    
    // Damage number animation
    const frames = [
      `    ${damageColor('💥')}    `,
      `   ${damageColor('💥💥')}   `,
      `  ${damageColor('💥💥💥')}  `,
      ` ${damageColor(`💥-${damage}💥`)} `,
      `  ${damageColor('💥💥💥')}  `,
      `   ${damageColor('💥💥')}   `,
      `    ${damageColor('💥')}    `,
      `     ${chalk.dim('...')}     `
    ]
    
    for (const frame of frames) {
      console.log(frame)
      await this.sleep(150)
      process.stdout.write('\u001b[1A\u001b[2K') // Move up and clear line
    }
    
    console.log(damageColor.bold(`💀 ${damage} damage dealt!`))
    await this.sleep(500)
  }

  /**
   * Show shield animation
   */
  async showShieldAnimation(shieldAmount: number): Promise<void> {
    console.log(chalk.bold('\n🧑‍💻 Gaining shield...'))
    
    const frames = [
      `    ${chalk.cyan('🛡️')}    `,
      `   ${chalk.cyan('🛡️🛡️')}   `,
      `  ${chalk.cyan('🛡️🛡️🛡️')}  `,
      ` ${chalk.cyan(`🛡️+${shieldAmount}🛡️`)} `,
      `  ${chalk.cyan('🛡️🛡️🛡️')}  `,
      `   ${chalk.cyan('🛡️🛡️')}   `,
      `    ${chalk.cyan('🛡️')}    `
    ]
    
    for (const frame of frames) {
      console.log(frame)
      await this.sleep(150)
      process.stdout.write('\u001b[1A\u001b[2K')
    }
    
    console.log(chalk.cyan.bold(`🛡️ +${shieldAmount} shield gained!`))
    await this.sleep(500)
  }

  /**
   * Show card play animation
   */
  async showCardPlayAnimation(cardName: string): Promise<void> {
    const spinner = ora({
      text: chalk.yellow(`Playing ${chalk.bold(cardName)}...`),
      spinner: 'dots12'
    }).start()
    
    await this.sleep(800)
    
    spinner.succeed(chalk.green(`✨ ${cardName} played successfully!`))
    await this.sleep(300)
  }

  /**
   * Show enemy attack animation
   */
  async showEnemyAttackAnimation(): Promise<void> {
    console.log(chalk.bold('\n👾 Enemy prepares to attack...'))
    
    const attackFrames = [
      '👾     🧑‍💻',
      '👾 ⚡  🧑‍💻',
      '👾  ⚡ 🧑‍💻',
      '👾   ⚡🧑‍💻',
      '👾    💥🧑‍💻',
      '👾     🧑‍💻'
    ]
    
    for (const frame of attackFrames) {
      console.log(`    ${frame}`)
      await this.sleep(200)
      process.stdout.write('\u001b[1A\u001b[2K')
    }
    
    console.log(chalk.red.bold('💥 Enemy attacks!'))
    await this.sleep(500)
  }

  /**
   * Show turn transition animation
   */
  async showTurnTransition(turnNumber: number): Promise<void> {
    console.clear()
    
    const turnText = `TURN ${turnNumber}`
    const frames = [
      chalk.dim(turnText),
      chalk.white(turnText),
      chalk.bold.white(turnText),
      chalk.bold.cyan(turnText),
      chalk.bold.blue(turnText)
    ]
    
    for (const frame of frames) {
      console.log(`\n\n    ${frame}\n`)
      await this.sleep(200)
      console.clear()
    }
  }

  /**
   * Show victory animation
   */
  async showVictoryAnimation(): Promise<void> {
    const victoryFrames = [
      '🎉',
      '🎉✨',
      '🎉✨🎉',
      '✨🎉✨🎉✨',
      '🎊🎉✨🎉🎊',
      '🎊✨🎉✨🎊',
      '🎉🎊🎉🎊🎉'
    ]
    
    console.log(chalk.bold.green('\n🎉 VICTORY! 🎉'))
    
    for (const frame of victoryFrames) {
      console.log(`    ${chalk.yellow(frame)}`)
      await this.sleep(300)
      process.stdout.write('\u001b[1A\u001b[2K')
    }
    
    console.log(chalk.bold.green('🏆 You are victorious! 🏆'))
  }

  /**
   * Show defeat animation
   */
  async showDefeatAnimation(): Promise<void> {
    const defeatFrames = [
      '💀',
      '💀👻',
      '👻💀👻',
      '💀👻💀👻💀',
      '👻💀👻💀👻'
    ]
    
    console.log(chalk.bold.red('\n💀 DEFEAT 💀'))
    
    for (const frame of defeatFrames) {
      console.log(`    ${chalk.red(frame)}`)
      await this.sleep(300)
      process.stdout.write('\u001b[1A\u001b[2K')
    }
    
    console.log(chalk.bold.red('😵 You have been defeated...'))
  }

  /**
   * Show energy restoration animation
   */
  async showEnergyRestoreAnimation(energy: number): Promise<void> {
    console.log(chalk.bold('\n⚡ Restoring energy...'))
    
    const energyFrames = Array.from({length: energy}, (_, i) => 
      '⚡'.repeat(i + 1) + '○'.repeat(energy - i - 1)
    )
    
    for (const frame of energyFrames) {
      console.log(`    ${chalk.yellow(frame)}`)
      await this.sleep(200)
      process.stdout.write('\u001b[1A\u001b[2K')
    }
    
    console.log(chalk.yellow.bold(`⚡ Energy restored to ${energy}!`))
    await this.sleep(500)
  }

  /**
   * Show card draw animation
   */
  async showCardDrawAnimation(cardCount: number): Promise<void> {
    const spinner = ora({
      text: chalk.blue(`Drawing ${cardCount} card(s)...`),
      spinner: 'bouncingBall'
    }).start()
    
    await this.sleep(600)
    
    spinner.succeed(chalk.green(`📚 Drew ${cardCount} card(s)!`))
    await this.sleep(300)
  }

  /**
   * Show loading animation
   */
  async showLoadingAnimation(message: string, duration = 1000): Promise<void> {
    const spinner = ora({
      text: chalk.cyan(message),
      spinner: 'dots'
    }).start()
    
    await this.sleep(duration)
    spinner.stop()
  }

  /**
   * Show typing effect for text
   */
  async showTypingEffect(text: string, speed = 50): Promise<void> {
    for (let i = 0; i <= text.length; i++) {
      process.stdout.write('\r' + text.substring(0, i))
      await this.sleep(speed)
    }
    console.log() // New line after typing
  }

  /**
   * Show pulsing effect
   */
  async showPulseEffect(text: string, pulses = 3): Promise<void> {
    for (let i = 0; i < pulses; i++) {
      console.log(chalk.bold.white(text))
      await this.sleep(200)
      process.stdout.write('\u001b[1A\u001b[2K')
      console.log(chalk.dim(text))
      await this.sleep(200)
      process.stdout.write('\u001b[1A\u001b[2K')
    }
    console.log(chalk.bold.white(text))
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}