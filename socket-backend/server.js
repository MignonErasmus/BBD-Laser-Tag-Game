const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { nanoid } = require("nanoid");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your frontend URL in production!
    methods: ["GET", "POST"],
  },
});

const games = {};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle a custom event from client
  socket.on("create_game", () => {
    const gameID = nanoid(6);
    games[gameID] = { players: [], started: false };
    socket.emit("game_created", gameID);
  });

  socket.on("join_game", ({ gameID, name }) => {
    const game = games[gameID];
  
    if (!game) {
      socket.emit("error", "Game ID not found: " + gameID);
      return;
    }
  
    if (game.started) {
      socket.emit("error", "Game has already started, you cannot join.");
      return;
    }
  
    const currentPlayers = game.players.length;
  
    // Check if joining would cause players to be out of bounds (less than 4 or more than 10)
    if (currentPlayers + 1 < 4) {
      socket.emit("error", "Need at least 4 players to join.");
      return;
    }
  
    if (currentPlayers + 1 > 10) {
      socket.emit("error", "Game is full. Maximum 10 players allowed.");
      return;
    }
  
    socket.join(gameID);
  
    if (!game.players.find((p) => p.id === socket.id)) {
      game.players.push({ id: socket.id, name });
    }
  
    io.to(gameID).emit("players_update", game.players);
  });

  socket.on("start_game", (gameID) => {
    const game = games[gameID];
    if (!game) {
      socket.emit("error", "Game ID not found: " + gameID);
      return;
    }
  
    if (game.started) {
      socket.emit("error", "Game already started.");
      return;
    }
  
    if (game.players.length < 2) {
      socket.emit("error", "At least 2 players are required to start the game.");
      return;
    }
  
    game.started = true;
    io.to(gameID).emit("game_started");
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Remove player from all games
    Object.entries(games).forEach(([gameID, game]) => {
      const index = game.players.findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        game.players.splice(index, 1);
        io.to(gameID).emit("players_update", game.players);
      }
    });
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