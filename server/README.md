# Chess Game Server - Node.js Backend

Node.js backend with TypeScript for the multiplayer chess game.

## Overview

The server handles room creation, player matching, real-time chess move synchronization, chat messaging, and video call signaling for the multiplayer chess game.

## Tech Stack

- **Node.js 18+**: Runtime environment
- **TypeScript 4.2.4**: Type-safe development
- **Express 4.17.1**: Web framework
- **Apollo Server 2.25.2**: GraphQL API
- **Socket.io 4.4.0**: Real-time WebSocket communication
- **TypeORM 0.3.20**: Database ORM
- **PostgreSQL**: Database (via pg 8.6.0)
- **Type-GraphQL 1.1.1**: GraphQL schema builder
- **Express-rate-limit 8.2.1**: API rate limiting
- **Helmet 8.1.0**: Security headers

## Project Structure

```
server/
├── src/
│   ├── entity/                # Database entities
│   │   ├── User.ts            # User entity
│   │   ├── Room.ts            # Game room entity
│   │   └── Lobby.ts           # Lobby entity
│   ├── resolvers/             # GraphQL resolvers
│   │   ├── RoomResolver.ts    # Room operations
│   │   ├── UserResolver.ts    # User operations
│   │   └── HelloResolver.ts   # Health check
│   ├── socket-service/        # Socket.io handlers
│   │   └── IO-socket.ts       # WebSocket events
│   ├── utils/                 # Helper functions
│   │   └── createSchema.ts    # Schema builder
│   ├── constants.ts           # App constants
│   └── index.ts               # Server entry point
├── dist/                      # Compiled output (generated)
├── .env                       # Environment variables (not committed)
├── .env.production.example    # Production template
├── .gitignore                 # Git exclusions
├── ormconfig.json             # TypeORM config
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── yarn.lock                  # Dependency lock
```

## Features

### Room Management
- Create room with unique code (5-8 characters)
- Join existing rooms (max 2 players)
- First player is admin
- Auto-cleanup on game end

### Real-time Events (Socket.io)

**Game Events**:
- `joinRoom` - Join game room
- `leaveRoom` - Exit room
- `move` - Chess move sync
- `userMove` - Broadcast to opponent
- `disconnect` - Handle disconnections
- `opponent-left` - Opponent left notification

**Chat**:
- `sendMessage` - Send message
- `message` - Receive message

**Video Call** (WebRTC signaling):
- `callUser` - Initiate call
- `acceptCall` - Accept call
- `hello` - Signal exchange
- `callAccepted` - Connection established

### GraphQL API

**Queries**:
- `hello` - Health check
- `getRoomByRoomCode(roomCode)` - Get room details
- `getLobbyByRoomCode(roomCode)` - Get lobby users
- `getUsersInRoom(roomCode)` - List players

**Mutations**:
- `createRoom(adminId, username)` - Create room
- `joinRoom(userId, username, roomId)` - Join room
- `destroyRoomAndLobby(roomCode)` - Delete room
- `createUser(id, username)` - Create user

## Setup & Installation

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 12+
- npm or yarn

### Install Dependencies
```bash
cd server
npm install
```

### Environment Configuration

Create a `.env` file in the `server/` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/chess_game

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

**Get AWS RDS URL** (for production):
```bash
aws rds describe-db-instances --query 'DBInstances[*].[Endpoint.Address,Endpoint.Port]'
# Format: postgresql://user:pass@host:5432/dbname
```

### Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE chess_game;
\q
```

### Development Server
```bash
npm start
```

Access at:
- GraphQL Playground: `http://localhost:5000/graphql`
- Health Check: `http://localhost:5000/health`

### Production Build
```bash
npm run build
npm run start2
```

Output in `dist/` directory.

## Configuration Files

### ormconfig.json
TypeORM database configuration:
- Auto-sync in development
- Migrations for production
- Entity auto-loading

### tsconfig.json
TypeScript compiler settings:
- Target: ES2017
- Decorators enabled (TypeORM + Type-GraphQL)
- Strict mode
- Output to `dist/`

## API Integration

### GraphQL Examples

```graphql
# Create room
mutation {
  createRoom(adminId: "socket-123", username: "Player1") {
    response {
      values  # Room code
      code    # Status
    }
  }
}

# Join room
mutation {
  joinRoom(userId: "socket-456", username: "Player2", roomId: "ABC123") {
    response {
      values
      error
    }
  }
}

# Get room
query {
  getRoomByRoomCode(roomCode: "ABC123") {
    id
    users
    adminSocketId
  }
}
```

### Socket.io Examples

```javascript
// Client → Server
socket.emit('joinRoom', { roomId: 'ABC123', users: [...] });
socket.emit('move', { newPos: 'e4', oldPos: 'e2', roomId: 'ABC123', player: '1', nextTurn: '2' });
socket.emit('sendMessage', 'Good move!', 'ABC123', 'Player1', callback);
socket.emit('callUser', { userToCall: 'socket-id', signalData: {...}, from: 'me', roomId: 'ABC123' });

// Server → Client
socket.on('userMove', (data) => { /* Update board */ });
socket.on('message', (msg) => { /* Display chat */ });
socket.on('hello', (data) => { /* Incoming call */ });
socket.on('callAccepted', (signal) => { /* Connect */ });
socket.on('opponent-left', () => { /* Handle disconnect */ });
```

## Deployment

### Option 1: AWS Elastic Beanstalk (Recommended)
```bash
# Install EB CLI
pip install awsebcli

# Initialize
cd server
eb init -p node.js-18 chess-server --region us-east-1

# Create environment
eb create chess-prod

# Set environment variables
eb setenv NODE_ENV=production DATABASE_URL=your_db_url ALLOWED_ORIGINS=your_frontend_url

# Deploy
npm run build
eb deploy
```

### Option 2: Heroku
```bash
heroku create chess-server
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production ALLOWED_ORIGINS=your_frontend
git push heroku main
```

### Option 3: AWS EC2
```bash
# SSH into instance
ssh -i key.pem ec2-user@instance-ip

# Install Node.js 18
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone and setup
git clone your-repo
cd server
npm install
npm run build

# Use PM2
sudo npm install -g pm2
pm2 start dist/index.js --name chess-server
pm2 save
```

## Testing

### Manual Testing Checklist
- [ ] Create room via GraphQL
- [ ] Join room with second player
- [ ] Send chess move via Socket.io
- [ ] Send chat message
- [ ] Initiate video call
- [ ] Leave room and verify cleanup
- [ ] Test rate limiting

### Socket.io Testing
```javascript
const io = require('socket.io-client');
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  socket.emit('joinRoom', { roomId: 'TEST', users: [socket.id] });
});

socket.on('someone-joined', (data) => console.log('Joined:', data));
```

## Troubleshooting

### Common Issues

**1. Database connection failed**
- Check PostgreSQL is running: `pg_isready`
- Verify `DATABASE_URL` in `.env`
- Test: `psql $DATABASE_URL`

**2. Port already in use**
- Find process: `netstat -ano | findstr :5000`
- Change `PORT` in `.env`

**3. CORS errors**
- Check `ALLOWED_ORIGINS` matches frontend URL exactly
- No trailing slash in URL

**4. Socket.io not connecting**
- Verify frontend uses same server URL
- Check firewall settings

**5. GraphQL schema errors**
- Run `npm install` again
- Clear `dist/` and rebuild: `npm run build`
