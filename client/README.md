# Chess Game Client - React Frontend

Modern React 17 application with TypeScript for real-time multiplayer chess.

## Live Preview

Deployed frontend (CloudFront): https://d2t52e0eyp62q6.cloudfront.net


## Overview

The Chess Game Client is a single-page application (SPA) that provides an interface for playing chess online with real-time move synchronization, live chat messaging, and peer-to-peer video calling.

## Tech Stack

- **React 17.0.2**: UI library with hooks
- **TypeScript 4.5.4**: Type-safe development
- **Apollo Client 3.5.6**: GraphQL client for API calls
- **Socket.io-client 4.4.0**: Real-time WebSocket communication
- **React Router DOM 5.2.0**: Client-side routing
- **Material-UI 5.3.1**: UI component library
- **React Bootstrap 2.0.3**: Bootstrap components for React
- **Simple-peer 9.11.0**: WebRTC peer-to-peer connections

## Project Structure

```
client/
├── public/              # Static assets
│   ├── index.html       # HTML entry point
│   ├── manifest.json    # PWA manifest
│   └── robots.txt       # SEO robots file
├── src/
│   ├── Chat-Screen/     # Chat messaging components
│   │   ├── Chat.jsx     # Main chat interface
│   │   ├── Message.js   # Message component
│   │   └── chat.css     # Chat styles
│   ├── Video-Screen/    # Video call components
│   │   ├── VideoCall.jsx # WebRTC video interface
│   │   └── video.css    # Video styles
│   ├── game-components/ # Chess game UI
│   │   ├── App/         # Main game app
│   │   ├── Board/       # Chess board component
│   │   ├── Piece/       # Chess piece components
│   │   ├── Tile/        # Board tile component
│   │   ├── Bishop/      # Bishop piece logic
│   │   ├── King/        # King piece logic
│   │   ├── Knight/      # Knight piece logic
│   │   ├── Pawn/        # Pawn piece logic
│   │   ├── Queen/       # Queen piece logic
│   │   ├── Rook/        # Rook piece logic
│   │   ├── CheckDisplay/    # Check notification
│   │   └── TurnDisplay/     # Turn indicator
│   ├── pages/           # Route-level components
│   │   ├── HomeScreen.tsx       # Landing/lobby page
│   │   ├── ChessGameScreen.tsx  # Game play screen
│   │   ├── GameInfoScreen.tsx   # Game info display
│   │   └── TestScreen.tsx       # Testing screen
│   ├── constants/       # Game constants
│   │   ├── arrayOfTiles.ts      # Board tile positions
│   │   ├── filesLetters.ts      # Chess file notation
│   │   ├── initialPositions.tsx # Starting piece positions
│   │   ├── pieces.ts            # Piece definitions
│   │   └── pieceTypes.ts        # Piece type enums
│   ├── models/          # TypeScript models
│   │   ├── pieceController.ts   # Piece movement logic
│   │   ├── tileInformation.ts   # Tile data model
│   │   └── tilePosition.ts      # Position model
│   ├── utils/           # Helper functions
│   │   ├── getValidMoves.ts     # Move validation
│   │   ├── isCheck.ts           # Check detection
│   │   └── positionUtils.ts     # Position utilities
│   ├── services/        # API services
│   │   ├── config.js    # API endpoints
│   │   └── socket.js    # Socket.io setup
│   ├── graphql/         # GraphQL queries/mutations
│   ├── generated/       # Auto-generated GraphQL types
│   ├── App.tsx          # Main app component
│   ├── App.css          # App styles
│   ├── index.tsx        # React entry point
│   └── index.css        # Global styles
├── .env                 # Environment variables (not committed)
├── .gitignore           # Git exclusions
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## Features

### Game Rooms
- Create new game room with unique code
- Join existing room via room code
- 2-player games only
- Room admin controls

### Chess Gameplay
- Full chess rules implementation
- Legal move validation
- Check and checkmate detection
- Turn-based gameplay
- Move history tracking
- Piece capture logic

### Real-time Features
- **Move Synchronization**: Instant move updates via Socket.io
- **Live Chat**: Send messages to opponent during game
- **Video Calling**: Peer-to-peer video chat using WebRTC

### Pages

#### HomeScreen
- Create new game room
- Join existing room by code
- Room code input and validation

#### ChessGameScreen
Main gameplay screen with:
- Interactive chess board
- Drag-and-drop piece movement
- Turn indicator
- Check notification display
- Chat panel
- Video call integration

#### GameInfoScreen
- Display game status
- Show player information
- Room details

## Setup & Installation

### Prerequisites
- Node.js 14.x or higher
- npm 6.x or higher

### Install Dependencies
```bash
cd client
npm install
```

### Environment Configuration

Create a `.env` file in the `client/` directory:

```env
# Backend API Endpoints
REACT_APP_GRAPHQL_URL=http://localhost:5000/graphql
REACT_APP_SOCKET_URL=http://localhost:5000
```

For production (AWS deployment), create `.env.production`:

```env
# Production Backend (AWS Elastic Beanstalk)
REACT_APP_GRAPHQL_URL=https://your-backend.us-east-1.elasticbeanstalk.com/graphql
REACT_APP_SOCKET_URL=https://your-backend.us-east-1.elasticbeanstalk.com
```

### Development Server
```bash
npm start
```

Access at: `http://localhost:3000`

### Production Build
```bash
npm run build
```

Output in `build/` directory.

## Configuration Files

### tsconfig.json
TypeScript compiler configuration:
- Target: ES5
- JSX: react
- Strict mode enabled
- Module resolution: node

### package.json Scripts
- `npm start` - Development server with hot-reload
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run gen` - Generate GraphQL types from schema

## API Integration

All API calls use environment variables from `services/config.js`:

```javascript
// config.js
export const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL;
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;
```

### GraphQL Mutations

Used for room management:
- `createRoom(adminId, username)` - Create new game
- `joinRoom(userId, username, roomId)` - Join existing game
- `destroyRoomAndLobby(roomCode)` - Clean up room

### Socket.io Events

**Client → Server**:
```javascript
// Join room
socket.emit('joinRoom', { roomId, users });

// Send move
socket.emit('move', { newPos, oldPos, roomId, player, nextTurn });

// Send chat message
socket.emit('sendMessage', message, roomId, username, callback);

// Video call
socket.emit('callUser', { userToCall, signalData, from, roomId });
socket.emit('acceptCall', { signal, to, roomId });
```

**Server → Client**:
```javascript
// Receive move
socket.on('userMove', (data) => { /* Update board */ });

// Receive message
socket.on('message', (msg) => { /* Display in chat */ });

// Video call events
socket.on('hello', (data) => { /* Incoming call */ });
socket.on('callAccepted', (signal) => { /* Connect */ });
socket.on('opponent-left', () => { /* Handle disconnect */ });
```

## Chess Logic

### Move Validation
Each piece has a controller (`src/game-components/<Piece>/`) that:
- Validates legal moves based on chess rules
- Handles piece-specific logic (castling, en passant, etc.)
- Checks for board boundaries
- Detects piece captures

### Check Detection
Uses `isCheck()` utility to:
- Scan all opponent pieces
- Check if any can attack the king
- Highlight king in check

## Deployment

### Option 1: AWS S3 + CloudFront (Recommended)
```bash
# Build
npm run build

# Upload to S3
aws s3 sync build/ s3://your-chess-frontend-bucket --delete

# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name your-chess-frontend-bucket.s3.amazonaws.com \
  --default-root-object index.html

# Invalidate cache after updates
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

**S3 Bucket Configuration**:
- Enable static website hosting
- Set index document: `index.html`
- Set error document: `index.html` (for SPA routing)

### Option 2: AWS Amplify
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

### Option 3: Vercel
```bash
npm run build
vercel --prod
```

## Testing

### Manual Testing Checklist
- [ ] Create new game room
- [ ] Join room with second player
- [ ] Make valid chess moves
- [ ] Send chat messages
- [ ] Initiate video call
- [ ] Test illegal move blocking
- [ ] Verify check detection
- [ ] Test opponent disconnect handling

### Chess Logic Testing
Test piece movement:
- Pawn: Forward movement, diagonal captures, first move 2 squares
- Knight: L-shaped movement
- Bishop: Diagonal movement
- Rook: Horizontal/vertical movement
- Queen: All directions
- King: One square in any direction

## Troubleshooting

### Common Issues

**1. "Cannot connect to server"**
- Verify `REACT_APP_SOCKET_URL` in `.env`
- Check backend server is running
- Check CORS configuration on backend

**2. "GraphQL errors"**
- Verify `REACT_APP_GRAPHQL_URL` is correct
- Check backend GraphQL endpoint is accessible
- Inspect network tab for error details

**3. "Video call not connecting"**
- Check WebRTC browser support
- Verify camera/microphone permissions
- Check firewall allows UDP connections
- Test STUN/TURN server configuration

**4. "Moves not syncing"**
- Check Socket.io connection status
- Verify both players in same room
- Check network connectivity
- Inspect browser console for errors

**5. "Build fails"**
- Run `npm install` to update dependencies
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`
