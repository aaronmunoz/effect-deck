import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHealth(current: number, max: number): string {
  return `${current}/${max}`
}

export function getHealthPercentage(current: number, max: number): number {
  return Math.max(0, Math.min(100, (current / max) * 100))
}

export function getCardTypeColor(type: string): string {
  switch (type) {
    case 'attack':
      return 'border-attack'
    case 'defense':
      return 'border-defense'
    case 'context':
      return 'border-context'
    case 'dependent':
      return 'border-dependent'
    default:
      return 'border-game-border'
  }
}

export function getCardTypeIcon(type: string): string {
  switch (type) {
    case 'attack':
      return '⚔️'
    case 'defense':
      return '🛡️'
    case 'context':
      return '⚙️'
    case 'dependent':
      return '🔗'
    default:
      return '❓'
  }
}