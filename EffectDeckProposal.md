# EffectDeck - A Functional Effect-Based Deck Builder

## Project Overview
**Goal**: Implement a functional roguelike deck-builder game inspired by Effect-TS concepts, featuring composable card effects, dependency injection mechanics, and abstract theming.

**Architecture**: Monorepo with shared core package and separate frontend implementations
**Development Tool**: Claude Code
**Monorepo Tool**: Nx (preferred) or Lerna
**Timeline**: 6-8 weeks for MVP

## Phase 0: Repository Setup & Project Initialization (Day 1)

### 0.1 GitHub Repository Setup
```bash
# Create and initialize repository
git init effectdeck
cd effectdeck

# Create initial README
echo "# EffectDeck - A Functional Effect-Based Deck Builder" > README.md
echo "An abstract roguelike deck-builder inspired by Effect-TS and functional programming concepts" >> README.md

# Initialize git
git add README.md
git commit -m "Initial commit"

# Create GitHub repo (using GitHub CLI)
gh repo create effectdeck --public --description "Roguelike deck-builder with composable effect system inspired by Effect-TS"

# Set up remote
git remote add origin https://github.com/YOUR_USERNAME/effectdeck.git
git branch -M main
git push -u origin main
```

### 0.2 Repository Structure
```
effectdeck/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml             # CI pipeline
│   │   ├── release.yml        # Release automation
│   │   └── deploy.yml         # Deployment workflow
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── .gitignore
├── .nvmrc                     # Node version
├── README.md
├── LICENSE                    # MIT License
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── SECURITY.md
```

### 0.3 Initial Files Setup
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: '.nvmrc'
          cache: 'npm'
      - run: npm ci
      - run: npx nx affected:lint --base=origin/main
      - run: npx nx affected:test --base=origin/main --coverage
      - run: npx nx affected:build --base=origin/main
```

### 0.4 Branch Protection & Workflows
- **main**: Protected, requires PR reviews
- **develop**: Integration branch
- **feature/***: Feature branches
- **release/***: Release preparation

GitHub Settings:
- [ ] Enable branch protection on main
- [ ] Require PR reviews (1 minimum)
- [ ] Require status checks (CI)
- [ ] Enable auto-delete head branches
- [ ] Set up GitHub Pages for docs

---

## Project Naming

### Proposed Names (Effect-TS & Programming Inspired)
1. **EffectDeck** - Simple, direct reference to Effect-TS
2. **Compositor** - References effect composition and deck building
3. **StackTrace** - Programming term + card stacking mechanic
4. **Monadeck** - Monad + Deck (functional programming reference)
5. **Pipeline** - Matches the card chaining mechanic
6. **Context Runner** - References DI context + roguelike runs
7. **AbstractEngine** - Emphasizes abstract theme + game engine
8. **EffectChain** - Clear reference to chaining effects
9. **DependencyQuest** - DI reference + adventure aspect
10. **FunctionDeck** - Functional programming + deck builder

### Recommended: **EffectDeck**
- Direct reference to Effect-TS inspiration
- Clear combination of "Effect" (functional programming) + "Deck" (card game)
- Memorable and descriptive
- Good for SEO/discoverability
- Professional sounding

### Package Names
- npm: `@effectdeck/core`, `@effectdeck/web`, `@effectdeck/cli`
- GitHub: `effectdeck` or `effectdeck-game`

---

## Monorepo Structure

```
effectdeck/
├── nx.json                    # Nx configuration
├── package.json               # Root package.json
├── packages/
│   ├── core/                  # Shared game logic
│   ├── web/                   # React web client
│   ├── cli/                   # Terminal client
│   └── server/                # Optional multiplayer server
├── libs/
│   ├── ui-components/         # Shared UI components
│   └── testing-utils/         # Shared testing utilities
└── tools/
    └── scripts/               # Build and deployment scripts
```

---

## Phase 1: Monorepo Setup & Core Architecture (Week 1-2)

### 1.1 Monorepo Initialization
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/effectdeck.git
cd effectdeck

# Using Nx
npx create-nx-workspace@latest . --preset=ts --packageManager=npm

# Configure packages
nx g @nx/js:library core --publishable --importPath=@effectdeck/core
nx g @nx/react:application web --e2eTestRunner=cypress
nx g @nx/node:application cli
nx g @nx/node:application server

# Update package.json names
# packages/core/package.json -> "@effectdeck/core"
# packages/web/package.json -> "@effectdeck/web"
# packages/cli/package.json -> "@effectdeck/cli"
# packages/server/package.json -> "@effectdeck/server"

# Commit initial structure
git add .
git commit -m "feat: initialize Nx monorepo structure"
git push
```

### 1.2 Core Package Structure (@effectdeck/core)
```
packages/core/
├── src/
│   ├── engine/
│   │   ├── GameState.ts       # Central game state management
│   │   ├── GameLoop.ts        # Turn-based game loop
│   │   └── SaveManager.ts     # Save/load functionality
│   ├── effects/
│   │   ├── Effect.ts          # Base effect system
│   │   ├── Context.ts         # DI context system
│   │   ├── Composer.ts        # Effect composition
│   │   └── primitives/        # Basic effect types
│   ├── cards/
│   │   ├── Card.ts            # Card interfaces
│   │   ├── CardFactory.ts     # Card creation
│   │   └── CardRegistry.ts    # Card definitions
│   ├── encounters/
│   │   ├── Encounter.ts       # Encounter system
│   │   ├── Generator.ts       # Procedural generation
│   │   └── Rewards.ts         # Reward system
│   └── index.ts               # Public API exports
├── package.json
└── tsconfig.json
```

**Key Tasks:**
- [ ] Set up Nx workspace with TypeScript preset
- [ ] Configure shared TypeScript settings
- [ ] Implement Effect base class with compose/chain methods
- [ ] Create Context system for dependency injection
- [ ] Build GameState manager with immutable updates
- [ ] Design Card interface with effect definitions
- [ ] Implement turn-based game loop as pure functions
- [ ] Set up GitHub Actions CI/CD

### 1.3 Package Dependencies
```json
// packages/core/package.json
{
  "name": "@effectdeck/core",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/effectdeck.git",
    "directory": "packages/core"
  },
  "dependencies": {
    "immer": "^10.x",
    "nanoid": "^5.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vitest": "^1.x"
  }
}
```

**Deliverable**: Published @effectdeck/core package with working effect system

---

## Phase 2: Backend Implementation (Week 2-3)

### 2.1 Server Package (@effectdeck/server) - Optional
```
packages/server/
├── src/
│   ├── api/
│   │   ├── gameRoutes.ts      # REST/GraphQL endpoints
│   │   └── websocket.ts       # Real-time updates
│   ├── services/
│   │   ├── GameService.ts     # Game instance management
│   │   ├── MatchMaking.ts     # Player matching
│   │   └── Leaderboard.ts     # Score tracking
│   ├── persistence/
│   │   ├── Database.ts        # Save game storage
│   │   └── Redis.ts           # Session management
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 2.2 Core Game Logic Implementation
In the @effectdeck/core package:

**Card System:**
- [ ] Implement 20 initial cards with effect definitions
- [ ] Create card validation and testing framework
- [ ] Build deck management utilities
- [ ] Implement card upgrade system

**Effect Primitives:**
```typescript
// packages/core/src/effects/primitives/
- DamageEffect.ts
- HealEffect.ts
- DrawCardEffect.ts
- ResourceEffect.ts
- ContextProviderEffect.ts
- ConditionalEffect.ts
- ChainedEffect.ts
- ParallelEffect.ts
```

**Encounter System:**
- [ ] Create encounter generation algorithms
- [ ] Implement 10 enemy types with behavior patterns
- [ ] Build reward calculation system
- [ ] Design difficulty scaling

**Deliverable**: Fully functional game logic as npm package

---

## Phase 3: Web Client Package (Week 3-4)

### 3.1 Web Package Structure (@effectdeck/web)
```
packages/web/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── store/             # State management
│   │   └── hooks/             # Custom React hooks
│   ├── features/
│   │   ├── game/
│   │   │   ├── GameBoard.tsx
│   │   │   ├── Hand.tsx
│   │   │   └── EffectLog.tsx
│   │   ├── cards/
│   │   │   ├── Card.tsx
│   │   │   ├── CardDetails.tsx
│   │   │   └── CardAnimations.ts
│   │   └── ui/
│   │       ├── ContextIndicators.tsx
│   │       └── ResourceDisplay.tsx
│   ├── pages/
│   │   ├── MainMenu.tsx
│   │   ├── Game.tsx
│   │   └── Settings.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 3.2 Web Dependencies
```json
// packages/web/package.json
{
  "name": "@effectdeck/web",
  "dependencies": {
    "@effectdeck/core": "workspace:*",
    "react": "^18.x",
    "react-dom": "^18.x",
    "zustand": "^4.x",
    "framer-motion": "^11.x",
    "react-query": "^3.x",
    "tailwindcss": "^3.x"
  }
}
```

### 3.3 Web Implementation Tasks
- [ ] Create responsive game board layout
- [ ] Implement drag-and-drop card playing
- [ ] Build effect visualization system
- [ ] Add sound effects and music
- [ ] Create settings persistence
- [ ] Implement progressive web app features

**Deliverable**: Deployable web application

---

## Phase 4: CLI Client Package (Week 4-5)

### 4.1 CLI Package Structure (@effectdeck/cli)
```
packages/cli/
├── src/
│   ├── ui/
│   │   ├── GameRenderer.ts    # Terminal rendering
│   │   ├── InputHandler.ts    # Keyboard input
│   │   └── components/        # Blessed/Ink components
│   ├── commands/
│   │   ├── play.ts           # Main game command
│   │   ├── deck.ts           # Deck management
│   │   └── stats.ts          # Statistics viewer
│   ├── adapters/
│   │   └── GameAdapter.ts     # Core to CLI adapter
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 4.2 CLI Dependencies
```json
// packages/cli/package.json
{
  "name": "@effectdeck/cli",
  "bin": {
    "effectdeck": "./dist/index.js"
  },
  "dependencies": {
    "@effectdeck/core": "workspace:*",
    "blessed": "^0.1.x",
    "chalk": "^5.x",
    "commander": "^12.x",
    "inquirer": "^9.x"
  }
}
```

### 4.3 CLI Implementation Tasks
- [ ] Create terminal-based UI with blessed
- [ ] Implement ASCII art for cards and enemies
- [ ] Build keyboard navigation system
- [ ] Add color themes for accessibility
- [ ] Create save game management
- [ ] Implement multiplayer via SSH (stretch goal)

**Deliverable**: Installable CLI game via npm

---

## Phase 5: Shared Libraries & Testing (Week 5-6)

### 5.1 UI Components Library (@effectdeck/ui-components)
```
libs/ui-components/
├── src/
│   ├── Card/
│   ├── Board/
│   ├── Effects/
│   └── index.ts
└── package.json
```

### 5.2 Testing Utilities (@effectdeck/testing-utils)
```
libs/testing-utils/
├── src/
│   ├── mocks/
│   │   ├── cards.ts
│   │   ├── encounters.ts
│   │   └── gameStates.ts
│   ├── factories/
│   └── assertions/
└── package.json
```

### 5.3 Cross-Package Testing Strategy
```typescript
// Example test structure
packages/core/src/effects/__tests__/
packages/web/src/features/game/__tests__/
packages/cli/src/ui/__tests__/

// Integration tests
e2e/
├── web.spec.ts
├── cli.spec.ts
└── cross-platform.spec.ts
```

**Testing Tasks:**
- [ ] Unit tests for all core game logic
- [ ] Integration tests for package interactions
- [ ] E2E tests for both web and CLI
- [ ] Performance benchmarks
- [ ] Accessibility testing for web

---

## Phase 6: Build, Deploy & Distribution (Week 6-7)

### 6.1 Build Configuration
```typescript
// nx.json
{
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist"]
    }
  }
}
```

### 6.2 CI/CD Pipeline
```yaml
# .github/workflows/main.yml
- Build all packages
- Run all tests
- Publish @roguelike/core to npm
- Deploy web to Vercel/Netlify
- Build CLI binaries for multiple platforms
- Create Docker images
```

### 6.3 Distribution Strategy
- **NPM Packages**: @effectdeck/core, @effectdeck/cli
- **Web Deployment**: Vercel/Netlify at effectdeck.com or effectdeck.game
- **CLI Distribution**: npm install -g @effectdeck/cli
- **Docker**: Containerized server and CLI versions
- **GitHub Releases**: Binary distributions for major platforms

---

## Development Workflow

### Local Development Commands
```bash
# Install dependencies
npm install

# Build all packages
nx run-many --target=build --all

# Run specific package
nx serve web
nx serve cli

# Test specific package
nx test core
nx test-e2e web-e2e

# Generate new card type
nx generate @roguelike/core:card --name=NewEffect

# Check affected packages
nx affected:test --base=main
```

### Package Communication
```typescript
// Web using core
import { GameEngine, Card, Effect } from '@effectdeck/core';

// CLI using core
import { GameEngine, TextRenderer } from '@effectdeck/core';

// Shared types
import type { GameState, CardDefinition } from '@effectdeck/core';
```

---

## Advantages of Monorepo Approach

1. **Code Sharing**: Core game logic used by all frontends
2. **Atomic Changes**: Update core and clients in one commit
3. **Consistent Tooling**: Shared ESLint, TypeScript, test configs
4. **Optimized Builds**: Nx caches and only rebuilds changed packages
5. **Easy Refactoring**: Move code between packages safely
6. **Unified CI/CD**: Single pipeline for all packages

---

## MVP Milestones

### Week 2 Checkpoint
- [ ] Core package with basic game engine
- [ ] 10 working cards with effects
- [ ] Unit tests passing for core

### Week 4 Checkpoint
- [ ] Web client playable with basic UI
- [ ] CLI client functional with text interface
- [ ] Cross-platform game saves

### Week 6 Checkpoint
- [ ] All packages integrated and tested
- [ ] Deployed web version
- [ ] Published CLI to npm
- [ ] Documentation complete

---

## Next Steps for Claude Code

1. **Create GitHub repository**:
   ```bash
   gh repo create effectdeck --public
   git init
   git add README.md
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Initialize Nx workspace**: 
   ```bash
   npx create-nx-workspace@latest . --preset=ts
   ```

3. **Generate packages**: Use Nx generators for consistent structure
4. **Implement core Effect class**: Start in @effectdeck/core
5. **Create first card**: Test core functionality
6. **Build minimal web UI**: Verify core integration
7. **Add CLI renderer**: Test same game logic

The monorepo approach ensures maximum code reuse while allowing independent deployment of each frontend!