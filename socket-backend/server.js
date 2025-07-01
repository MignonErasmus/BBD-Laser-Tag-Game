import express from "express";
import http from "http";
import { Server } from "socket.io";
import { nanoid } from "nanoid";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Game state store
const games = {};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("create_game", () => {
    const gameID = nanoid(6);
    games[gameID] = { players: [], started: false };
    socket.emit("game_created", gameID);
  });

  socket.on("join_game", ({ gameID, name }) => {
    const game = games[gameID];

    if (!game) {
      socket.emit("error", "Game ID not found.");
      return;
    }

    if (game.started) {
      socket.emit("error", "Game has already started.");
      return;
    }

    if (game.players.length >= 10) {
      socket.emit("error", "Game is full.");
      return;
    }

    if (game.players.find((p) => p.id === socket.id)) return;

    const newPlayer = {
      id: socket.id,
      name,
      lives: 5,
      kills: 0,
      reloading: false,
    };

    game.players.push(newPlayer);
    socket.join(gameID);

    io.to(gameID).emit("players_update", game.players);
  });

  socket.on("start_game", (gameID) => {
    const game = games[gameID];

    if (!game) {
      socket.emit("error", "Game not found.");
      return;
    }

    if (game.started) {
      socket.emit("error", "Game already started.");
      return;
    }

    if (game.players.length < 4) {
      socket.emit("error", "Need at least 4 players to start the game.");
      return;
    }

    game.started = true;
    io.to(gameID).emit("game_started");
  });

  socket.on("shoot", ({ gameID, targetID }) => {
    const game = games[gameID];
    if (!game || !game.started) return;

    const shooter = game.players.find((p) => p.id === socket.id);
    const target = game.players.find((p) => p.id === targetID);

    if (!shooter) {
      socket.emit("error", "Shooter not found.");
      return;
    }

    if (!target) {
      socket.emit("error", "Target not found.");
      return;
    }

    if (shooter.reloading) {
      socket.emit("error", "You are reloading.");
      return;
    }

    if (shooter.id === target.id) {
      socket.emit("error", "You cannot shoot yourself.");
      return;
    }

    // Begin reloading
    shooter.reloading = true;
    setTimeout(() => {
      shooter.reloading = false;
      io.to(shooter.id).emit("reload_complete");
    }, 2000);

    // Apply damage
    if (target.lives > 0) {
      target.lives--;

      if (target.lives === 0) {
        shooter.kills++;
        io.to(target.id).emit("eliminated");
      }

      io.to(gameID).emit("players_update", game.players);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    Object.entries(games).forEach(([gameID, game]) => {
      const index = game.players.findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        game.players.splice(index, 1);
        io.to(gameID).emit("players_update", game.players);
      }
    });
  });
});

// Health check route
app.get("/", (req, res) => {
  res.send("Socket.IO Laser Tag server is running!");
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
