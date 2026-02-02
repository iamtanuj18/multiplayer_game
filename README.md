# Multiplayer Chess

A real-time multiplayer chess platform with integrated video chat and messaging. Create or join game rooms, play chess with friends, and communicate through video and text while playing.

---

## 🚀 **[Try the Live Demo Here]()** 🚀

---

## Overview

Multiplayer Chess provides a complete online chess experience with real-time synchronization, video calling, and chat functionality. Players can create private rooms or join existing games, with all moves synchronized instantly across clients.

## Key Features

- **Real-time Chess Gameplay**: Full chess implementation with legal move validation
- **Video Chat Integration**: Built-in video calling to see your opponent while playing
- **Text Messaging**: Real-time chat system for communication during games
- **Room Management**: Create private rooms or join with room codes
- **Move Validation**: Client-side and server-side validation for all chess pieces
- **Check Detection**: Automatic check and checkmate detection
- **Turn-based System**: Visual indicators for whose turn it is
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **Framework**: React 17 with TypeScript
- **Build Tool**: Create React App (react-app-rewired)
- **Real-time Communication**: Socket.io Client
- **API Layer**: GraphQL with Apollo Client (Code Generation via graphql-codegen)
- **Video/Audio**: WebRTC
- **Styling**: CSS Modules + Bootstrap
- **Routing**: React Router DOM

### Backend
- **Runtime**: Node.js with TypeScript
- **API**: GraphQL (Type-GraphQL)
- **Database**: PostgreSQL with TypeORM
- **Real-time Engine**: Socket.io Server
- **ORM**: TypeORM with entity relationships

### Infrastructure
- **Database**: PostgreSQL
- **WebSocket Server**: Socket.io for real-time events
- **GraphQL Server**: Apollo Server Express

## Project Structure

```
multiplayer_game/
├── client/                    # React TypeScript frontend
│   ├── src/
│   │   ├── pages/            # Route components
│   │   │   ├── HomeScreen.tsx           # Landing page with room creation/join
│   │   │   ├── GameInfoScreen.tsx       # Game lobby screen
│   │   │   └── ChessGameScreen.tsx      # Main chess board with video/chat
│   │   ├── game-components/  # Chess game logic
│   │   │   ├── Board/        # Chess board rendering
│   │   │   ├── Piece/        # Chess piece components
│   │   │   ├── Pawn/         # Pawn movement logic
│   │   │   ├── Rook/         # Rook movement logic
│   │   │   ├── Knight/       # Knight movement logic
│   │   │   ├── Bishop/       # Bishop movement logic
│   │   │   ├── Queen/        # Queen movement logic
│   │   │   ├── King/         # King movement logic
│   │   │   ├── CheckDisplay/ # Check indicator
│   │   │   └── TurnDisplay/  # Turn indicator
│   │   ├── Chat-Screen/      # Chat component
│   │   ├── Video-Screen/     # Video call component
│   │   ├── services/         # Socket.io configuration
│   │   ├── graphql/          # GraphQL queries/mutations/fragments
│   │   ├── generated/        # Auto-generated GraphQL TypeScript types
│   │   ├── models/           # Chess game models
│   │   ├── constants/        # Game constants (initial positions, piece types)
│   │   └── utils/            # Helper functions (move validation, check detection)
│   └── README.md             # Frontend-specific documentation
├── server/                   # Node.js TypeScript backend
│   ├── src/
│   │   ├── entity/          # TypeORM entities
│   │   │   ├── User.ts      # User entity
│   │   │   ├── Room.ts      # Room entity
│   │   │   └── Lobby.ts     # Lobby entity
│   │   ├── resolvers/       # GraphQL resolvers
│   │   │   ├── UserResolver.ts
│   │   │   └── RoomResolver.ts
│   │   ├── socket-service/  # Socket.io event handlers
│   │   │   └── IO-socket.ts
│   │   └── utils/           # Helper utilities
│   └── README.md            # Backend-specific documentation

```

## Architecture Flow

### Room Creation & Join Flow
```
User creates room → GraphQL Mutation → PostgreSQL (Room entity)
  ↓
Room code generated → User redirects to Game Info screen
  ↓
Second user joins with code → Socket.io connection established
  ↓
Both users enter Chess Game screen → WebRTC peer connection initiated
```

### Chess Move Flow
```
User drags piece → Client-side validation → Legal move check
  ↓
Emit move via Socket.io → Server broadcasts to opponent
  ↓
Board state synchronized → Check detection → Turn switches
```

### Video Chat Flow
```
User joins room → WebRTC offer/answer exchange via Socket.io
  ↓
STUN/TURN negotiation → Direct peer-to-peer connection
  ↓
Real-time video/audio streams
```

## Chess Rules Implementation

### Piece Movement
- **Pawn**: Forward movement (1 or 2 squares on first move), diagonal capture, en passant
- **Rook**: Horizontal and vertical movement
- **Knight**: L-shaped movement (jumps over pieces)
- **Bishop**: Diagonal movement
- **Queen**: Combined rook and bishop movement
- **King**: One square in any direction, castling

### Game Logic
- Legal move validation for all pieces
- Check detection with visual indicators
- Turn-based system (white moves first)
- Board state persistence across sessions

## Setup & Deployment

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 12.x or higher
- npm or yarn

### Frontend Setup
```bash
cd client
npm install
npm start
```

See `client/README.md` for detailed instructions.

### Backend Setup
```bash
cd server
npm install

# Configure database in server/.env
npm run dev
```

See `server/README.md` for detailed instructions.

### Database Setup
1. Create PostgreSQL database
2. Update `server/.env` with your database credentials
3. TypeORM will auto-create tables on first run

## Environment Variables

### Frontend (.env)
```
REACT_APP_GRAPHQL_URL=http://localhost:5000/graphql
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/chess_db
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

## Socket.io Events

### Client → Server
- `move`: Send chess move to opponent
- `message`: Send chat message
- `offer`, `answer`, `ice-candidate`: WebRTC signaling

### Server → Client
- `move`: Receive opponent's move
- `message`: Receive chat message
- `offer`, `answer`, `ice-candidate`: WebRTC signaling

## GraphQL API

### Mutations
- `createRoom(username: String!)`: Create new game room
- `joinRoom(username: String!, roomCode: String!)`: Join existing room
- `createUser(username: String!)`: Register new user

### Queries
- `rooms`: List all active rooms
- `room(roomCode: String!)`: Get room details
- `users`: List all users

## Performance Optimizations

- Client-side move validation to reduce server load
- Memoized chess board rendering
- WebRTC peer-to-peer connections (no media server)
- GraphQL code generation for type safety
- Socket.io binary protocol for efficient data transfer
- Lazy loading of game components

## Security Features

- Room code-based access control
- Input validation on all GraphQL mutations
- CORS configuration for API endpoints
- Environment variable-based configuration
- No hardcoded credentials in codebase
- Comprehensive `.gitignore` protection

## Contributing

This is an open-source project. Contributions are welcome!


