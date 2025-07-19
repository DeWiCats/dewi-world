# DEWI World Monorepo

This is a monorepo containing the DEWI World mobile app and backend server, managed with Yarn workspaces.

## Project Structure

```
dewi-world/
├── packages/
│   ├── dewi-world-app/     # Expo mobile application
│   └── dewi-server/        # Fastify backend server
├── package.json            # Root package.json with workspace configuration
├── tsconfig.json          # Shared TypeScript configuration
├── eslint.config.js       # Root ESLint configuration
└── .prettierrc            # Shared Prettier configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- For mobile development: Expo CLI, Android Studio, Xcode

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```

## Development

### Available Scripts

#### Root Level Commands

**Development:**

- `yarn dev` - Start the development server (backend)
- `yarn dev:app` / `yarn start` - Start the Expo development server
- `yarn dev:server` - Start the backend development server

**Mobile App (Convenience Commands):**

- `yarn ios` - Run the app on iOS simulator/device
- `yarn android` - Run the app on Android emulator/device
- `yarn web` - Run the app in web browser

**Build & Quality:**

- `yarn build` - Build all packages
- `yarn lint` - Run linting on all packages
- `yarn clean` - Clean all build artifacts

#### Mobile App (dewi-world-app)

- `yarn workspace @dewi/world-app start` - Start Expo dev server
- `yarn workspace @dewi/world-app android` - Run on Android
- `yarn workspace @dewi/world-app ios` - Run on iOS
- `yarn workspace @dewi/world-app web` - Run on web

#### Server (dewi-server)

- `yarn workspace @dewi/server dev` - Start development server with hot reload
- `yarn workspace @dewi/server build` - Build for production
- `yarn workspace @dewi/server start` - Start production server

### Quick Start Examples

**Start development server and mobile app:**

```bash
# Terminal 1 - Start the backend server
yarn dev:server

# Terminal 2 - Start the mobile app
yarn start
# or yarn dev:app
```

**Run on specific platforms directly:**

```bash
# Run on iOS (starts bundler + iOS app)
yarn ios

# Run on Android (starts bundler + Android app)
yarn android

# Run in web browser
yarn web
```

**Development workflow:**

```bash
# Install dependencies
yarn install

# Start both services
yarn dev:server    # Terminal 1
yarn ios          # Terminal 2 (or android/web)
```

## Package Management

This monorepo uses Yarn workspaces to manage dependencies. Shared dependencies are hoisted to the root level for efficiency.

### Adding Dependencies

- For the app: `yarn workspace @dewi/world-app add <package>`
- For the server: `yarn workspace @dewi/server add <package>`
- For shared dev dependencies: `yarn add -DW <package>`

### Removing Dependencies

- For the app: `yarn workspace @dewi/world-app remove <package>`
- For the server: `yarn workspace @dewi/server remove <package>`

## Code Quality

- **TypeScript**: Shared configuration in root `tsconfig.json`
- **ESLint**: Root configuration with package-specific overrides
- **Prettier**: Shared formatting rules in `.prettierrc`

Run `yarn lint` to check all packages, or target specific packages with workspace commands.

## Contributing

1. Ensure all tests pass: `yarn test`
2. Ensure code is properly formatted: `yarn lint`
3. Build successfully: `yarn build`

## Packages

### @dewi/world-app

The mobile application built with Expo and React Native.

**Key dependencies:**

- Expo SDK 53
- React Native 0.79
- React Navigation
- Mapbox GL

### @dewi/server

The backend API server built with Fastify and TypeScript.

**Key dependencies:**

- Fastify 5.4
- TypeScript 5.7
- Nodemon for development
