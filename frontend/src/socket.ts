// src/socket.ts
import { io, Socket } from "socket.io-client";

// const URL = "http://localhost:4000"; // TO DO: update when deploying...

const URL = "https://bbd-laser-tag-game-production.up.railway.app"

// const URL = import.meta.env.VITE_BACKEND_URL

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(URL, {
      transports: ["websocket"],
    });
  }
  return socket;
};
