const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your frontend URL in production!
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle a custom event from client
  socket.on("join_lobby", (lobbyId) => {
    socket.join(lobbyId);
    console.log(`Socket ${socket.id} joined lobby ${lobbyId}`);

    // Notify lobby members
    io.to(lobbyId).emit("lobby_message", `User ${socket.id} joined lobby ${lobbyId}`);
  });

  socket.on("message", ({ lobbyId, message }) => {
    console.log(`Message to lobby ${lobbyId}: ${message}`);
    // Broadcast message to all clients in the lobby
    io.to(lobbyId).emit("message", { sender: socket.id, message });
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Optional: simple API route
app.get("/", (req, res) => {
  res.send("Socket.IO backend running");
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);
});
