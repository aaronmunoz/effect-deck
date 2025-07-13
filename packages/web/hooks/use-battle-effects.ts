'use client'

import { useState, useCallback, useRef } from 'react'
import type { DamageNumber, BattleEffect } from '@/components/battle-effects'

interface UseBattleEffectsReturn {
  damageNumbers: DamageNumber[]
  effects: BattleEffect[]
  showDamageNumber: (value: number, type: DamageNumber['type'], targetElement?: HTMLElement) => void
  triggerScreenShake: (intensity?: number, duration?: number) => void
  triggerParticleBurst: (intensity?: number, duration?: number) => void
  triggerImpactWave: (intensity?: number, duration?: number) => void
  clearEffect: (id: string) => void
}

export function useBattleEffects(): UseBattleEffectsReturn {
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([])
  const [effects, setEffects] = useState<BattleEffect[]>([])
  const counterRef = useRef(0)

  const generateId = useCallback(() => {
    return `effect_${Date.now()}_${counterRef.current++}`
  }, [])

  const showDamageNumber = useCallback((
    value: number, 
    type: DamageNumber['type'], 
    targetElement?: HTMLElement
  ) => {
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    }

    // Add some randomness to position
    x += (Math.random() - 0.5) * 100
    y += (Math.random() - 0.5) * 50

    const damageNumber: DamageNumber = {
      id: generateId(),
      value,
      type,
      x,
      y,
      timestamp: Date.now()
    }

    setDamageNumbers(prev => [...prev, damageNumber])

    // Auto-cleanup after animation
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== damageNumber.id))
    }, 2000)
  }, [generateId])

  const triggerScreenShake = useCallback((intensity = 5, duration = 300) => {
    const effect: BattleEffect = {
      id: generateId(),
      type: 'screen-shake',
      duration,
      intensity,
      timestamp: Date.now()
    }

    setEffects(prev => [...prev, effect])
  }, [generateId])

  const triggerParticleBurst = useCallback((intensity = 5, duration = 800) => {
    const effect: BattleEffect = {
      id: generateId(),
      type: 'particle-burst',
      duration,
      intensity,
      timestamp: Date.now()
    }

    setEffects(prev => [...prev, effect])
  }, [generateId])

  const triggerImpactWave = useCallback((intensity = 3, duration = 600) => {
    const effect: BattleEffect = {
      id: generateId(),
      type: 'impact-wave',
      duration,
      intensity,
      timestamp: Date.now()
    }

    setEffects(prev => [...prev, effect])
  }, [generateId])

  const clearEffect = useCallback((id: string) => {
    setDamageNumbers(prev => prev.filter(d => d.id !== id))
    setEffects(prev => prev.filter(e => e.id !== id))
  }, [])

  return {
    damageNumbers,
    effects,
    showDamageNumber,
    triggerScreenShake,
    triggerParticleBurst,
    triggerImpactWave,
    clearEffect
  }
}

// Helper functions for different battle scenarios
export const battleAnimations = {
  // Card play animations
  playAttackCard: (effects: UseBattleEffectsReturn, damage: number, target?: HTMLElement) => {
    effects.showDamageNumber(damage, 'damage', target)
    effects.triggerScreenShake(3, 200)
    effects.triggerParticleBurst(4, 600)
  },

  playDefenseCard: (effects: UseBattleEffectsReturn, shield: number, target?: HTMLElement) => {
    effects.showDamageNumber(shield, 'shield', target)
    effects.triggerImpactWave(2, 400)
  },

  playEnergyCard: (effects: UseBattleEffectsReturn, energy: number, target?: HTMLElement) => {
    effects.showDamageNumber(energy, 'energy', target)
    effects.triggerParticleBurst(2, 400)
  },

  // Damage taken
  takeDamage: (effects: UseBattleEffectsReturn, damage: number, target?: HTMLElement) => {
    effects.showDamageNumber(damage, 'damage', target)
    effects.triggerScreenShake(Math.min(damage, 8), 250)
  },

  // Healing
  heal: (effects: UseBattleEffectsReturn, amount: number, target?: HTMLElement) => {
    effects.showDamageNumber(amount, 'heal', target)
    effects.triggerParticleBurst(3, 500)
  },

  // Major impact (big attacks, special abilities)
  majorImpact: (effects: UseBattleEffectsReturn, damage: number, target?: HTMLElement) => {
    effects.showDamageNumber(damage, 'damage', target)
    effects.triggerScreenShake(8, 400)
    effects.triggerParticleBurst(8, 1000)
    effects.triggerImpactWave(5, 800)
  }
}