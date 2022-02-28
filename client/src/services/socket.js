import io from "socket.io-client";

export const socket = io(
  "https://multiplayer-chess-online-game.herokuapp.com",
  {
    transports: ["websocket", "polling"],
    reconnection: true,
    secure: true,
  }
);
