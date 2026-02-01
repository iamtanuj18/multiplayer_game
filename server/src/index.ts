import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import Express from "express";
import { createBuildSchema } from "./utils/createSchema";
import { ApolloServer } from "apollo-server-express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import cors from "cors";
import { Lobby } from "./entity/Lobby";
import { Room } from "./entity/Room";
import { User } from "./entity/User";
import { Socket } from "socket.io";

interface ExtSocket extends Socket {
  username: string;
  roomCode: string;
  userId: string;
}

process.on("unhandledRejection", (reason) => {
  console.error(" Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error(" Uncaught Exception:", err);
});

const main = async () => {
  dotenv.config();
  
  const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: process.env.NODE_ENV === "development",
    synchronize: process.env.NODE_ENV === "development", // Auto-create tables in dev
    entities: [User, Lobby, Room],
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  });

  await AppDataSource.initialize();

  const app = Express();
  app.set("trust proxy", 1);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
  }));

  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
    : ["http://localhost:3000"];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 100 : 2000,
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS",
  });

  // Apply rate limiting to GraphQL endpoint
  app.use("/graphql", limiter);

  // HTTPS enforcement for production
  if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
      if (req.header("x-forwarded-proto") !== "https") {
        res.redirect(`https://${req.header("host")}${req.url}`);
      } else {
        next();
      }
    });
  }

  // Health check endpoint for AWS load balancer
  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  const schema = await createBuildSchema();

  // CORS already applied above before rate limiting

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: { req: Express.Request; res: Express.Response }) => ({
      req,
      res,
    }),
  });

  apolloServer.applyMiddleware({ app, cors: false });

  const port = process.env.PORT || 5000;
  const httpServer = app.listen(port);
  const io = require("socket.io")(httpServer, {
    cors: {
      origin: allowedOrigins,
    },
  });

  io.on("connection", function (socket: ExtSocket) {
    socket.emit("setId", { id: socket.id });
    socket.on("init", function (data) {
      socket.username = data.username;
      socket.roomCode = data.roomCode;
      socket.userId = data.userId;
    });

    socket.on("joinRoom", function (data) {
      socket.join(data.roomId);
      socket.broadcast.to(data.roomId).emit("someone-joined", {
        id: socket.id,
        username: socket.username,
        users: data.users,
      });
    });

    socket.on("leaveRoom", async function (data) {
      try {
        socket.leave(data.roomId);

        const room = await Room.findOne({ where: { id: data.roomId } });
        if (!room) {
          return;
        }

        // Host leaves via explicit leave
        if (room.adminSocketId === (data.userId || socket.userId || socket.id)) {
          await Lobby.delete({ roomId: data.roomId });
          await Room.delete({ id: data.roomId });

          socket.broadcast.to(data.roomId).emit("throw-room-recieved", {
            value: "THROW",
          });
          return;
        }

        // Non-host leaves: remove from lobby and update count
        await Lobby.delete({ roomId: data.roomId, userId: data.userId || socket.userId || socket.id });
        const remainingUsers = await Lobby.count({ where: { roomId: data.roomId } });
        await Room.update({ id: data.roomId }, { users: remainingUsers });
        
        // Broadcast to others that someone left
        socket.broadcast.to(data.roomId).emit("someone-leaved", {
          id: data.userId || socket.id,
          username: socket.username,
        });
      } catch (err) {
        console.error("❌ leaveRoom socket error:", err);
      }
    });

    socket.on("throw-all-users-out-of-room", function (data) {
      socket.broadcast.to(data.roomId).emit("throw-room-recieved", {
        value: "THROW",
      });
    });

    socket.on("startGame", (data) => {
      socket.broadcast.to(data.roomId).emit("gameStarted");
    });

    socket.on("move", (data) => {
      socket.broadcast.to(data.roomId).emit("userMove", data);
    });

    //Message Events
    socket.on("sendMessage", (message, roomId, username, callback) => {
      socket.broadcast
        .to(roomId)
        .emit("message", { text: message, user: username });
      callback();
    });

    //Video Chat Socket Events
    socket.on("callUser", (data) => {
      socket.broadcast
        .to(data.roomId)
        .emit("hello", { signal: data.signalData, from: data.from });
    });

    socket.on("acceptCall", (data) => {
      socket.broadcast.to(data.roomId).emit("callAccepted", data.signal);
    });

    //Disconnect Event
    socket.on("disconnect", async () => {
      try {
        // Only notify about disconnect if user was in a room
        if (socket.roomCode) {
          // Check if room exists and is in game
          const room = await Room.findOne({ where: { id: socket.roomCode } });

          if (!room) {
            return;
          }

          // Host disconnected: destroy room + lobby and notify others
          if (room.adminSocketId === (socket.userId || socket.id)) {
            await Lobby.delete({ roomId: socket.roomCode });
            await Room.delete({ id: socket.roomCode });

            socket.broadcast.to(socket.roomCode).emit("throw-room-recieved", {
              value: "THROW",
            });
            return;
          }

          // Non-host disconnects: remove from lobby and decrement count
          await Lobby.delete({ roomId: socket.roomCode, userId: socket.userId || socket.id });
          const remainingUsers = await Lobby.count({ where: { roomId: socket.roomCode } });
          await Room.update({ id: socket.roomCode }, { users: remainingUsers });

          // Only emit opponent-left if game is in progress, not in lobby
          if (room.inGame) {
            socket.broadcast.to(socket.roomCode).emit("opponent-left");
          } else {
            // In lobby - emit someone-leaved instead
            socket.broadcast.to(socket.roomCode).emit("someone-leaved", {
              id: socket.id,
              username: socket.username,
            });
          }
        }
      } catch (err) {
        console.error("❌ disconnect handler error:", err);
      }
    });
  });

  // Startup logging
  console.log("🚀 Server started successfully");
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔌 Port: ${port}`);
  console.log(`📡 GraphQL endpoint: http://localhost:${port}/graphql`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(", ")}`);
};

main().catch((err) => {
  console.error("❌ Failed to start server:");
  console.error(err);
  process.exit(1);
});
