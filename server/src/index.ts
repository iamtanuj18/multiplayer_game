import "reflect-metadata";
import dotenv from "dotenv";
import { createConnection } from "typeorm";
import Express from "express";
import { createBuildSchema } from "./utils/createSchema";
import { ApolloServer } from "apollo-server-express";

import cors from "cors";
import { Lobby } from "./entity/Lobby";
import { Room } from "./entity/Room";
import { User } from "./entity/User";
import { Socket } from "socket.io";

interface ExtSocket extends Socket {
  username: string;
  roomCode: string;
}

const main = async () => {
  dotenv.config();
  // console.log(process.env.DATABASE_URL);
  await createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    logging: true,
    synchronize: true,
    entities: [User, Lobby, Room],
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  });

  const app = Express();
  app.set("trust proxy", 1);

  const schema = await createBuildSchema();

  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "https://keen-leavitt-c423c3.netlify.app/",
      ],
      credentials: true,
    })
  );

  // app.use(
  //   session({
  //     store: new RedisStore({
  //       client: redis as any,
  //       disableTouch: true
  //     }),
  //     name: 'qid',
  //     secret: 'aslkdfjoiq12312',
  //     resave: false,
  //     saveUninitialized: false,
  //     cookie: {
  //       path: '/',
  //       httpOnly: true,
  //       secure: false,
  //       maxAge: 1000 * 60 * 60 * 24 * 90 // 90 Days
  //     }
  //   })
  // );

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({
      req,
      res,
    }),
  });
  //await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  const port = process.env.PORT || 5000;
  const httpServer = app.listen(port, () =>
    console.log("SERVER STARTED AT PORT " + port)
  );
  const io = require("socket.io")(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://localhost:3000",
        "https://keen-leavitt-c423c3.netlify.app/",
      ],
    },
  });
  // console.log("THIS IS IO");
  // console.log(io);
  // let width = 950;
  // let height = 500;
  // let h = 10;
  io.on("connection", function (socket: ExtSocket) {
    socket.emit("setId", { id: socket.id });
    socket.on("init", function (data) {
      socket.username = data.username;
      socket.roomCode = data.roomCode;
    });

    // socket.on("createRoom" , (data) => {
    // numClients[data.roomId]
    // })

    socket.on("joinRoom", function (data) {
      socket.join(data.roomId);
      // console.log("Room Id to be joined");
      // console.log(data.roomId);
      // console.log(socket.id);
      // console.log(socket.username);
      socket.broadcast.to(data.roomId).emit("someone-joined", {
        id: socket.id,
        username: socket.username,
        users: data.users,
      });
    });

    socket.on("leaveRoom", function (data) {
      socket.leave(data.roomId);
      socket.broadcast.to(data.roomId).emit("someone-leaved", {
        id: socket.id,
        username: socket.username,
        users: data.users,
      });
    });

    socket.on("throw-all-users-out-of-room", function (data) {
      socket.broadcast.to(data.roomId).emit("throw-room-recieved", {
        value: "THROW",
      });
    });

    socket.on("startGame", (data) => {
      socket.broadcast.to(data.roomId).emit("gameStarted");
    });

    // socket.on("update" , function(data) {

    socket.on("move", (data) => {
      // console.log("Move data");
      // console.log(data);
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
    socket.on("disconnect", () => {
      // console.log("Disconnected user");
      socket.broadcast.to(socket.roomCode).emit("opponent-left");
    });
  });
};

main().catch((err) => console.log(err));
