# Technical Context: Effect Deck

## Core Technologies

### Language & Runtime
- **TypeScript 5.8+** with strict mode enabled
- **Node.js** for CLI and build tools
- **ES2022** target with modern JavaScript features

### Functional Programming Stack
- **Effect-TS 3.16+** - Core functional programming library
- **Effect Schema** - Runtime type validation and JSON schema generation
- **Effect Test** - Testing utilities for Effect-based code

### Monorepo & Build Tools
- **Nx 21.2+** - Monorepo orchestration and caching
- **SWC** - Fast TypeScript compilation
- **npm workspaces** - Package dependency management

### Code Quality
- **ESLint 9+** with TypeScript integration
- **Prettier 2.6+** - Code formatting
- **Husky + lint-staged** - Git hooks for quality gates

### Testing Framework
- **Mocha 11+** - Test runner
- **Chai 5+** - Assertion library
- **@effect/test** - Effect-specific testing utilities

### UI Technologies

**CLI Package**:
- **oclif 4+** - CLI framework
- **inquirer 12+** - Interactive prompts
- **chalk** - Terminal colors and styling

**Web Package** (planned):
- **React 18+** - UI framework
- **Vite** - Development server and bundler
- **Tailwind CSS** - Utility-first styling

## Development Setup

### Required Tools
```bash
# Node.js (via nvm)
nvm use  # Uses .nvmrc file

# Dependencies
npm install

# Build all packages
npm run build

# Start CLI game
npm run game
```

### TypeScript Configuration

**Strict Settings**:
- `strict: true`
- `exactOptionalPropertyTypes: true`
- `strictNullChecks: true`
- `noImplicitAny: true`
- `noImplicitReturns: true`

**Module System**:
- `module: "nodenext"`
- `moduleResolution: "nodenext"`
- `target: "es2022"`

**Path Mapping**:
```json
{
  "@effect-deck/core": ["packages/core/src/index.ts"],
  "@effect-deck/cli": ["packages/cli/src/index.ts"],
  "@effect-deck/web": ["packages/web/src/index.ts"]
}
```

## Dependencies Strategy

### Core Dependencies
- **effect** - Peer dependency across all packages
- **@effect/schema** - Schema validation
- **@oclif/core** - CLI framework (CLI package only)
- **inquirer** - User input (CLI package only)

### Development Dependencies
- All build tools, linters, and testing frameworks in root
- Packages only include runtime dependencies
- No duplicate dependencies across packages

### Version Management
- Lock files committed to ensure reproducible builds
- Peer dependencies for shared libraries (Effect-TS)
- Regular dependency updates with automated testing

## Technical Constraints

### Effect-TS Compliance
- All business logic must use Effect primitives
- No thrown exceptions - only Effect errors
- State mutations through Ref within Effect context
- Composable effects for complex operations

### TypeScript Strictness
- No `any` types allowed
- All function parameters and returns explicitly typed
- Exact optional properties required
- No implicit returns from functions

### Package Boundaries
- Core package cannot import from CLI or web
- CLI and web can only import public API from core
- No circular dependencies between packages
- Clear separation of concerns

## Tool Usage Patterns

### Nx Commands
```bash
# Build specific package
nx build core
nx build cli

# Run tests
nx test core

# Lint specific package
nx lint cli

# Check affected packages
nx affected:build --base=main
```

### Development Workflow
```bash
# Watch mode for development
npm run dev  # In package directories

# Format and lint
npm run format
npm run lint:fix

# Full quality check
npm run lint && npm run format:check
```

### Git Workflow
- **main** branch is protected and deployment-ready
- Feature branches use conventional commits
- Husky enforces quality gates pre-commit
- Lint-staged runs formatters and linters automatically

## Performance Considerations

### Build Optimization
- Nx caching for incremental builds
- SWC for fast TypeScript compilation
- Tree-shaking for minimal bundle sizes

### Runtime Performance
- Effect-TS provides efficient functional primitives
- Immutable updates use structural sharing
- JSON serialization is optimized for game state size

### Development Experience
- Fast rebuilds with Nx caching
- Type checking runs in watch mode
- Hot reload for CLI development (via tsc --watch)

## Deployment Architecture

### Package Distribution
- **@effect-deck/core** - Published to npm as library
- **@effect-deck/cli** - Published to npm with binary
- **@effect-deck/web** - Deployed as static site

### CI/CD Pipeline (planned)
- GitHub Actions for automated testing
- Automated npm publishing on release
- Web deployment to Vercel/Netlify
- Binary builds for multiple platforms