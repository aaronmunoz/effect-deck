/**
 * Text display modes for card rendering
 */
export type TextDisplayMode = 'compact' | 'normal' | 'full'

/**
 * Configuration for each display mode
 */
export interface DisplayModeConfig {
  readonly cardWidth: number
  readonly maxNameLength: number
  readonly maxDescLength: number
  readonly allowDynamicWidth: boolean
  readonly description: string
}

/**
 * Display mode configurations
 */
export const DISPLAY_MODE_CONFIGS: Record<TextDisplayMode, DisplayModeConfig> = {
  compact: {
    cardWidth: 20,
    maxNameLength: 12,
    maxDescLength: 18,
    allowDynamicWidth: false,
    description: 'Compact - Minimal text for overview'
  },
  normal: {
    cardWidth: 30,
    maxNameLength: 20,
    maxDescLength: 40,
    allowDynamicWidth: false,
    description: 'Normal - Balanced readability'
  },
  full: {
    cardWidth: 50, // Base width, can expand
    maxNameLength: Infinity,
    maxDescLength: Infinity,
    allowDynamicWidth: true,
    description: 'Full - Complete text, no truncation'
  }
}

/**
 * Cycle to the next display mode
 */
export function getNextDisplayMode(current: TextDisplayMode): TextDisplayMode {
  switch (current) {
    case 'compact':
      return 'normal'
    case 'normal':
      return 'full'
    case 'full':
      return 'compact'
    default:
      return 'normal'
  }
}

/**
 * Smart text truncation with word boundary awareness
 */
export function smartTruncate(text: string, maxLength: number, mode: TextDisplayMode): string {
  if (mode === 'full' || text.length <= maxLength) {
    return text
  }
  
  if (mode === 'compact') {
    // Simple truncation for compact mode
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
  }
  
  // Smart truncation for normal mode - try to break at word boundaries
  if (text.length <= maxLength) {
    return text
  }
  
  const truncated = text.substring(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  
  // If we can break at a word boundary and it's not too short, do so
  if (lastSpace > maxLength * 0.7) {
    return text.substring(0, lastSpace) + '...'
  }
  
  // Otherwise, just truncate with ellipsis
  return truncated + '...'
}

/**
 * Calculate optimal card width based on content and mode
 */
export function calculateCardWidth(
  cardName: string, 
  description: string, 
  mode: TextDisplayMode
): number {
  const config = DISPLAY_MODE_CONFIGS[mode]
  
  if (!config.allowDynamicWidth) {
    return config.cardWidth
  }
  
  // For full mode, calculate width based on content
  const nameWidth = cardName.length + 4 // padding
  const descWidth = description.length + 4 // padding
  const maxWidth = Math.max(nameWidth, descWidth, config.cardWidth)
  
  // Reasonable maximum to prevent extremely wide cards
  return Math.min(maxWidth, 80)
}