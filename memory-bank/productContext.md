# Product Context: Effect Deck

## Why This Project Exists

**Educational Purpose**: Effect Deck serves as a practical demonstration of Effect-TS patterns in a real-world application. It bridges the gap between functional programming theory and engaging software that developers actually want to use.

**Problem Statement**: Most functional programming examples are either trivial (todo apps) or overly academic. Developers need a substantial, entertaining project that showcases:
- Effect composition and chaining
- Dependency injection without service locators
- Immutable state management
- Structured error handling without exceptions
- Pure functional game logic

## Target Audience

**Primary Users**: TypeScript developers interested in functional programming and Effect-TS
**Secondary Users**: Game development enthusiasts who want to explore functional approaches

## How It Should Work

### Core Game Loop
1. **Turn Start**: Player draws cards, gains energy
2. **Card Play Phase**: Player selects and plays cards from hand
3. **Effect Resolution**: Cards trigger composable effects that modify game state
4. **Enemy Turn**: AI enemy executes its intent
5. **Turn End**: Cleanup effects, advance turn counter

### Programming-Themed Mechanics
- **Cards represent programming concepts**: Functions, Contexts, Dependencies, Algorithms
- **Context System**: Cards can provide or require specific programming contexts (Algorithm, HighEnergy, Debug, etc.)
- **Dependency Injection**: Powerful cards depend on having the right contexts available
- **Effect Composition**: Multiple cards can chain together for complex interactions

### User Experience Goals

**CLI Interface**:
- Rich terminal UI with clear visual hierarchy
- Keyboard navigation that feels natural
- ASCII art that enhances rather than clutters
- Real-time game state visualization

**Web Interface**:
- Responsive design that works on desktop and tablet
- Drag-and-drop card playing
- Smooth animations for effect resolution
- Clear visual feedback for all game actions

**Shared Experience**:
- Consistent game mechanics across all interfaces
- Save games that work between CLI and web
- JSON responses that make the core engine interface-agnostic
- Programming humor and references that developers appreciate

## Core Value Propositions

1. **Learn Effect-TS Through Play**: Complex functional programming concepts become intuitive through game mechanics
2. **Reference Implementation**: Shows how to structure a real TypeScript/Effect-TS application
3. **Extensible Architecture**: Demonstrates proper monorepo setup and package boundaries
4. **Quality Standards**: Shows comprehensive testing, CI/CD, and deployment practices

## Success Metrics

**Engagement**: Players complete full games and want to play again
**Learning**: Developers understand Effect-TS patterns better after playing
**Code Quality**: Other developers can read and understand the implementation
**Reusability**: Core engine can be easily extended with new cards and mechanics