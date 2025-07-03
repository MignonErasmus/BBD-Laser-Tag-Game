import 'dotenv/config';
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

const availableNames = [
  "Circle", "Triangle", "Square", "Crescent", "Heart",
  "Arrow", "Cross", "Star", "Parallelogram", "Trapezium"
];

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("create_game", () => {
    const gameID = nanoid(6);
    games[gameID] = { players: [], started: false };
    socket.emit("game_created", gameID);
    console.log(`Game created: ${gameID}`);
  });

  socket.on("watch_game", (gameID) => {
    const game = games[gameID];
    if (game) {
      socket.join(gameID);
      socket.emit("players_update", game.players);
      console.log(`Watcher ${socket.id} joined game ${gameID}`);

      // REMOVE THIS TEST ACTIVITY AFTER CONFIRMING REAL EVENTS WORK
      // setTimeout(() => {
      //   io.to(gameID).emit("player_action", "Test activity: Someone joined!");
      // }, 5000);

    } else {
      socket.emit("error", "Game not found.");
      console.log(`Watcher ${socket.id} tried to watch non-existent game ${gameID}`);
    }
  });

  socket.on("join_game", ({ gameID, markerId }) => {
    const game = games[gameID];

    if (!game) {
      socket.emit("error", "Game ID not found.");
      console.log(`Join error: Game ${gameID} not found for socket ${socket.id}`);
      return;
    }

    if (game.started) {
      socket.emit("error", "Game has already started.");
      console.log(`Join error: Game ${gameID} already started for socket ${socket.id}`);
      return;
    }

    if (game.players.length >= 10) {
      socket.emit("error", "Game is full.");
      console.log(`Join error: Game ${gameID} is full for socket ${socket.id}`);
      return;
    }

    if (game.players.find((p) => p.id === socket.id)) {
      console.log(`Join error: Player ${socket.id} already in game ${gameID}`);
      return;
    }

    // Validate marker ID
    const parsedMarkerId = parseInt(markerId);
    if (isNaN(parsedMarkerId)) {
      socket.emit("error", "Invalid marker ID format.");
      console.log(`Join error: Invalid markerId ${markerId} for socket ${socket.id}`);
      return;
    }

    if (parsedMarkerId < 0 || parsedMarkerId > 14) {
      socket.emit("error", "Marker ID must be between 0-14.");
      console.log(`Join error: Marker ID ${parsedMarkerId} out of range for socket ${socket.id}`);
      return;
    }

    // Check for duplicate marker IDs
    if (game.players.some(p => p.markerId === parsedMarkerId)) {
      socket.emit("error", "Marker ID already in use in this game.");
      console.log(`Join error: Marker ID ${parsedMarkerId} already in use in game ${gameID}`);
      return;
    }

    // Assign name
    let assignedName = null;
    game.assignedNames ??= [];

    const unassignedNames = availableNames.filter(
      name => !game.assignedNames.includes(name)
    );

    if (unassignedNames.length > 0) {
      assignedName = unassignedNames[0];
      game.assignedNames.push(assignedName);
    } else {
      socket.emit("error", "No available names.");
      console.log(`Join error: No available names for game ${gameID}`);
      return;
    }

    const newPlayer = {
      id: socket.id,
      name: assignedName,
      markerId: parsedMarkerId,
      lives: 5,
      kills: 0,
      points: 0,
      reloading: false,
    };

    game.players.push(newPlayer);
    socket.join(gameID);

    io.to(gameID).emit("players_update", game.players);
    socket.emit("joined_successfully", {
      name: assignedName,
      markerId: parsedMarkerId
    });

    // --- ADDED PLAYER_ACTION FOR JOINING ---
    io.to(gameID).emit("player_action", `${assignedName} joined the game.`);
    console.log(`${assignedName} joined game ${gameID}. Players: ${game.players.length}`);
  });

  socket.on("start_game", (gameID) => {
    const game = games[gameID];

    if (!game) {
      socket.emit("error", "Game not found.");
      console.log(`Start game error: Game ${gameID} not found.`);
      return;
    }

    if (game.started) {
      socket.emit("error", "Game already started.");
      console.log(`Start game error: Game ${gameID} already started.`);
      return;
    }

    if (game.players.length < 4) {
      socket.emit("error", "Need at least 4 players to start the game.");
      console.log(`Start game error: Not enough players (${game.players.length}) in game ${gameID}`);
      return;
    }

    game.started = true;
    io.to(gameID).emit("game_started");

    // --- ADDED PLAYER_ACTION FOR GAME START ---
    io.to(gameID).emit("player_action", "The game has started!");
    console.log(`Game ${gameID} started.`);
  });

  socket.on("shoot", ({ gameID, targetMarkerId }) => {
    const game = games[gameID];
    if (!game || !game.started) {
      console.log(`Shoot error: Game ${gameID} not found or not started.`);
      return;
    }

    const shooter = game.players.find((p) => p.id === socket.id);
    const target = game.players.find((p) => p.markerId === targetMarkerId);

    if (!shooter) {
      socket.emit("error", "Shooter not found.");
      console.log(`Shoot error: Shooter ${socket.id} not found in game ${gameID}`);
      return;
    }

    if (!target) {
      socket.emit("error", "Target not found.");
      console.log(`Shoot error: Target ${targetMarkerId} not found in game ${gameID}`);
      return;
    }

    if (shooter.reloading) {
      socket.emit("error", "You are reloading.");
      console.log(`Shoot error: Shooter ${shooter.name} is reloading.`);
      return;
    }

    if (shooter.id === target.id) {
      socket.emit("error", "You cannot shoot yourself.");
      console.log(`Shoot error: Shooter ${shooter.name} tried to shoot themselves.`);
      return;
    }

    // Begin reloading
    shooter.reloading = true;
    console.log(`${shooter.name} is reloading.`);
    setTimeout(() => {
      shooter.reloading = false;
      io.to(shooter.id).emit("reload_complete");
      console.log(`${shooter.name} reload complete.`);
    }, 2000);

    // Apply damage
    if (target.lives > 0) {
      target.lives--;
      shooter.points = shooter.points + 100;
      console.log(`${shooter.name} shot ${target.name}. ${target.name} has ${target.lives} lives left.`);
      io.to(gameID).emit("player_action", `🤕 ${target.name} lost a life!`);
      io.to(gameID).emit("player_action", `💎 ${shooter.name} scored 100 points`);

      if (target.lives === 0) {
        shooter.kills++;
        io.to(target.id).emit("eliminated");
        io.to(gameID).emit("player_action", `❌ ${target.name} was eliminated!`);
        io.to(gameID).emit("player_action", `⚔️ ${shooter.name} got a kill!`);
        console.log(`${target.name} eliminated by ${shooter.name}. ${shooter.name} now has ${shooter.kills} kills.`);

        const alive = game.players.filter(p => p.lives > 0);
        if (alive.length === 1) {
          io.to(gameID).emit("player_action", `🏆 ${alive[0].name} wins the game!`);
          console.log(`Game ${gameID} ended. ${alive[0].name} wins.`);
        }
      }

      io.to(gameID).emit("players_update", game.players);
    } else {
        console.log(`${shooter.name} shot ${target.name}, but ${target.name} already eliminated.`);
    }
  });

  socket.on("bomb", ({ gameID, playerId }) => {
    const game = games[gameID];
    if (!game || !game.started) {
      console.log(`Bomb error: Game ${gameID} not found or not started.`);
      return;
    }
  
    const bomber = game.players.find((p) => p.id === playerId);
    if (!bomber || bomber.points < 400) {
      console.log(`Bomb error: Bomber not found or insufficient points.`);
      return;
    }
  
    // Apply bomb effect: all other players lose 1 life
    game.players.forEach((player) => {
      if (player.id !== bomber.id && player.lives > 0) {
        player.lives = player.lives - 2;
        if (player.lives === 0 || player.lives < 0) {
          io.to(player.id).emit("eliminated");
          // bomber.kills += 1; // fix this
          io.to(gameID).emit("player_action", `💥 ${player.name} was eliminated by a bomb!`);
        } else {
          io.to(gameID).emit("player_action", `💣 ${player.name} lost a life from a bomb!`);
        }
      }

      if (player.id === bomber.id) {
        player.kills += 1;
      }
    });
  
    // Deduct bomb cost (optional)
    bomber.points -= 400;
    io.to(gameID).emit("player_action", `🔥 ${bomber.name} used a BOMB!`);
    io.to(gameID).emit("players_update", game.players);
  
    // Check win condition
    const alive = game.players.filter(p => p.lives > 0);
    if (alive.length === 1) {
      io.to(gameID).emit("player_action", `🏆 ${alive[0].name} wins the game!`);
      console.log(`Game ${gameID} ended. ${alive[0].name} wins.`);
    }
  });
  

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    Object.entries(games).forEach(([gameID, game]) => {
      const index = game.players.findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        const disconnectedPlayerName = game.players[index].name; // Get name before splicing
        game.players.splice(index, 1);
        io.to(gameID).emit("players_update", game.players);
        // --- ADDED PLAYER_ACTION FOR DISCONNECT ---
        io.to(gameID).emit("player_action", `🔌 ${disconnectedPlayerName} disconnected.`);
        console.log(`🔌 ${disconnectedPlayerName} disconnected from game ${gameID}.`);
      
        // new logic here
        if (game.started) { // Only check for winner if the game was actively started
          const alivePlayers = game.players.filter(p => p.lives > 0);
          if (alivePlayers.length === 1) {
              io.to(gameID).emit("player_action", `🏆 ${alivePlayers[0].name} wins the game due to player disconnections!`);
              console.log(`Game ${gameID} ended. ${alivePlayers[0].name} wins due to disconnections.`);
              // Optionally, you might want to stop the game timer here or reset the game state.
              // For now, we'll just emit the message.
          } else if (alivePlayers.length === 0 && game.players.length > 0) {
              // Edge case: all players disconnected, or last player alive disconnected
              io.to(gameID).emit("player_action", `Game ended. All players disconnected.`);
              console.log(`Game ${gameID} ended. All players disconnected.`);
          } else if (game.players.length === 0) {
              // Clean up game if no players left at all (optional)
              console.log(`Game ${gameID} is empty, could be removed.`);
              delete games[gameID]; // Consider deleting the game if it's completely empty
          }
      }
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