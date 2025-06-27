# Project Brief: Effect Deck

## Core Requirements

**Primary Goal**: A functional deck-building roguelike card game built with Effect-TS that demonstrates functional programming patterns and composable effect systems.

**Key Deliverables**:
1. **Core Game Engine** (`@effect-deck/core`) - Pure functional game logic with Effect-TS
2. **CLI Interface** (`@effect-deck/cli`) - Terminal-based playable game
3. **Web Interface** (`@effect-deck/web`) - React-based web client
4. **Testing Framework** - Comprehensive test coverage using Mocha + Chai + @effect/test

## Project Scope

### MVP Features (Current Focus)
- Turn-based card combat system
- Deck building mechanics with card upgrades
- Effect composition system inspired by dependency injection
- JSON Schema responses for all game state changes
- Programming-themed cards and enemies
- Save/load game state functionality

### Architecture Requirements
- **Nx Monorepo** with proper package boundaries
- **Strict TypeScript** with exactOptionalPropertyTypes and strict null checks
- **Effect-TS Patterns** throughout - no thrown exceptions, structured error handling
- **Immutable State Management** with pure functions
- **Schema Validation** using Effect Schema for runtime safety

### Quality Standards
- 90% test coverage minimum (per user's coding rules)
- ESLint + Prettier code formatting
- No dependencies on global state or service locators
- CI/CD pipeline with automated testing and builds

## Success Criteria

**Technical Success**:
- All packages build and run without errors
- Comprehensive test suite passes
- CLI game is fully playable from start to finish
- Web interface provides equivalent functionality to CLI
- Core engine can be used by any frontend implementation

**User Experience Success**:
- Intuitive gameplay that teaches Effect-TS concepts
- Clear visual feedback for all game actions
- Responsive and engaging interface (both CLI and web)
- Programming themes that resonate with developers

## Constraints

- Must follow user's coding rules (TypeScript strict mode, Effect-TS patterns, Mocha/Chai testing)
- Cannot use thrown exceptions - all errors must be modeled as Effect failures
- Must maintain functional programming principles throughout
- Deployment-ready code with proper CI/CD setup

## Non-Goals (Out of Scope)

- Multiplayer functionality (server package is optional stretch goal)
- Mobile applications
- Complex animations or 3D graphics
- Real-time gameplay mechanics
- External API integrations beyond basic web deployment