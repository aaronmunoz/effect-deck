declare module 'figlet' {
  interface FontOptions {
    font?: string
    horizontalLayout?: 'default' | 'full' | 'fitted' | 'controlled smushing' | 'universal smushing'
    verticalLayout?: 'default' | 'full' | 'fitted' | 'controlled smushing' | 'universal smushing'
    width?: number
    whitespaceBreak?: boolean
  }

  function textSync(text: string, options?: FontOptions): string
  function text(text: string, options: FontOptions, callback: (err: Error | null, data?: string) => void): void
  function text(text: string, callback: (err: Error | null, data?: string) => void): void

  export { textSync, text }
}

declare module 'gradient-string' {
  interface GradientFunction {
    (text: string): string
    multiline(text: string): string
  }

  function gradient(colors: string[]): GradientFunction
  function gradient(options: { colors: string[], interpolation?: 'rgb' | 'hsv' }): GradientFunction
  
  const rainbow: GradientFunction
  const pastel: GradientFunction
  const cristal: GradientFunction
  const teen: GradientFunction
  const mind: GradientFunction
  const morning: GradientFunction
  const vice: GradientFunction
  const passion: GradientFunction
  const fruit: GradientFunction
  const instagram: GradientFunction
  const atlas: GradientFunction
  const retro: GradientFunction
  const summer: GradientFunction

  export = gradient
  export { rainbow, pastel, cristal, teen, mind, morning, vice, passion, fruit, instagram, atlas, retro, summer }
}

declare module 'boxen' {
  interface BoxenOptions {
    borderColor?: string
    borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'singleDouble' | 'doubleSingle' | 'classic'
    dimBorder?: boolean
    padding?: number | { top?: number, right?: number, bottom?: number, left?: number }
    margin?: number | { top?: number, right?: number, bottom?: number, left?: number }
    float?: 'left' | 'right' | 'center'
    backgroundColor?: string
    textAlignment?: 'left' | 'center' | 'right'
    title?: string
    titleAlignment?: 'left' | 'center' | 'right'
    width?: number
    height?: number
    fullscreen?: boolean | ((width: number, height: number) => { width: number, height: number })
  }

  function boxen(text: string, options?: BoxenOptions): string
  export = boxen
}

declare module 'cli-table3' {
  interface TableOptions {
    head?: string[]
    colWidths?: number[]
    style?: {
      'padding-left'?: number
      'padding-right'?: number
      head?: string[]
      border?: string[]
      compact?: boolean
    }
    colAligns?: ('left' | 'center' | 'right')[]
    wordWrap?: boolean
  }

  class Table extends Array {
    constructor(options?: TableOptions)
    toString(): string
  }

  export = Table
}

declare module 'ora' {
  interface Options {
    text?: string
    spinner?: string | object
    color?: string
    hideCursor?: boolean
    indent?: number
    interval?: number
    stream?: NodeJS.WriteStream
    isEnabled?: boolean
    isSilent?: boolean
    discardStdin?: boolean
  }

  interface Ora {
    start(text?: string): Ora
    stop(): Ora
    succeed(text?: string): Ora
    fail(text?: string): Ora
    warn(text?: string): Ora
    info(text?: string): Ora
    text: string
    color: string
    isSpinning: boolean
  }

  function ora(options?: Options | string): Ora
  export = ora
}