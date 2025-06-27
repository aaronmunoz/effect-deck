# Effect Deck

A deck-building card game built with Effect-TS, demonstrating functional programming patterns and Effect composition.

## 🎯 Features

- **Core Game Engine**: Built with Effect-TS for composable, type-safe game logic
- **JSON Schema Responses**: All game state changes return structured JSON responses
- **CLI Interface**: Interactive command-line game interface
- **Monorepo Structure**: Organized packages for core engine, web interface, and CLI
- **Type Safety**: Full TypeScript with strict mode and exact optional property types

## 🚀 Quick Start

```bash
# Clone and install dependencies
git clone <repository-url>
cd effect-deck
npm install

# Build all packages
npm run build

# Start the CLI game
npm run game
```

## 🎮 How to Play

Effect Deck is a turn-based card game where you battle against corrupted processes using programming-themed cards:

### Basic Gameplay
- Start with 50 health and 3 energy per turn
- Draw 5 cards from your deck to start
- Play cards by spending energy
- End your turn to let the enemy attack
- Defeat the enemy to win!

### Card Types
- **Attack Cards**: Deal damage to enemies (Strike, Heavy Strike, etc.)
- **Defense Cards**: Gain shield to block incoming damage
- **Context Cards**: Provide programming contexts (Algorithm, HighEnergy, etc.)
- **Dependent Cards**: Powerful cards that require specific contexts

### Example Cards
- `Strike` (1 ⚡): Deal 6 damage
- `Block` (1 ⚡): Gain 5 shield
- `Initialize Algorithm` (1 ⚡): Gain Algorithm context
- `Overclock Attack` (2 ⚡): Deal 15 damage (requires HighEnergy context)

## 🏗️ Architecture

### Package Structure
```
effect-deck/
├── packages/
│   ├── core/          # Game engine and business logic
│   ├── web/           # Web interface (stub)
│   └── cli/           # Command-line interface
├── tsconfig.base.json # Shared TypeScript configuration
└── package.json       # Root workspace configuration
```

### Core Engine (`@effect-deck/core`)
- **Schema**: JSON Schema definitions for game state and actions
- **Cards**: Card definitions and effect implementations
- **Game Engine**: Turn management, state transitions, and game loop
- **Effect Composition**: All game logic built with Effect primitives

### CLI Interface (`@effect-deck/cli`)
- **Renderer**: Game state visualization
- **Input**: Player action handling with inquirer
- **Game Loop**: Orchestrates game engine and user interface

## 🛠️ Development

### Scripts
```bash
npm run build          # Build all packages
npm run build:core     # Build core package only
npm run build:cli      # Build CLI package only
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run game           # Start CLI game
```

### Architecture Principles
- **Functional Programming**: All logic implemented with pure functions and Effect composition
- **Type Safety**: Comprehensive TypeScript with strict null checks and exact optional properties
- **Error Handling**: Structured error types, no thrown exceptions
- **Dependency Injection**: Effect Context and Layer patterns for modularity
- **Immutable State**: All state changes return new state objects

### Adding New Cards
1. Define card in `packages/core/src/cards.ts`
2. Add effect implementation in the switch statement in `game-engine.ts`
3. Update schema if needed for new card properties

## 🎯 Game Design Goals

1. **Demonstrate Effect Patterns**: Show real-world usage of Effect-TS in a game context
2. **Type-Safe Game Logic**: Leverage TypeScript's type system for game rules
3. **Composable Effects**: Build complex card interactions from simple Effect primitives
4. **JSON API Ready**: Core engine returns structured data suitable for any interface
5. **Programming Themes**: Cards and mechanics inspired by software development concepts

## 🔧 Technical Highlights

- **Effect-TS**: Demonstrates Effect composition, error handling, and dependency injection
- **Strict TypeScript**: `exactOptionalPropertyTypes`, `strictNullChecks`, `noImplicitAny`
- **Monorepo**: Nx workspace with proper package boundaries and dependency management
- **Code Quality**: ESLint, Prettier
- **Schema Validation**: Runtime type safety with Effect Schema

## 📈 Future Enhancements

- Web interface with React/Next.js
- Multiplayer support
- Card deck building and customization
- More enemy types and encounters
- Save/load game state
- Animation and visual effects
- Tournament mode

## 📄 License

MIT License