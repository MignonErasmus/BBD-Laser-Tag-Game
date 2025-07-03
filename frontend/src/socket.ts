// src/socket.ts
import { io, Socket } from "socket.io-client";

const URL = "https://bbd-laser-tag-game-production.up.railway.app"

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(URL, {
      transports: ["websocket"],
    });
  }
  return socket;
};
