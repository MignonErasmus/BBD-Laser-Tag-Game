// src/socket.ts
import { io, Socket } from "socket.io-client";

const URL = "http://localhost:4000"; // TO DO: update when deploying...

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(URL, {
      transports: ["websocket"],
    });
  }
  return socket;
};
