"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { PlayerInfo } from "@/shared/types";// Using a shared player info cause player also uses it

let socket: Socket;

export default function Dashboard() {
  const [gameID, setGameID] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // ? 'http://localhost:4000'
    // : process.env.NEXT_PUBLIC_BACKEND_URL;
    socket = io("http://localhost:4000");

    socket.on("game_created", (id: string) => {
      setGameID(id);
      socket.emit("watch_game", id);
    });

    socket.on("players_update", (updatedPlayers: PlayerInfo[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on("game_started", () => {
      setGameStarted(true);
    });

    socket.on("error", (msg: string) => {
      alert(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createGame = () => {
    socket.emit("create_game");
  };

  const startGame = () => {
    if (gameID && players.length >= 4) {
      socket.emit("start_game", gameID);
    } else {
      alert("At least 4 players are required to start the game.");
    }
  };

  return (
    <main>
      <header>
        <h1>Dashboard</h1>
      </header>

      {!gameID ? (
        <button onClick={createGame}>Create Game</button>
      ) : (
        <section aria-live="polite">
          <p>
            Game ID: <strong>{gameID}</strong>
          </p>

          <h2>Players Joined:</h2>
          <ul>
            {players
              .filter((p) => p.name !== "Dashboard")
              .map((p) => (
                <li key={p.id}>
                  {p.name} - {p.lives ?? "?"} ❤️ - {p.kills ?? "?"} 🔫
                </li>
              ))}
          </ul>

          {!gameStarted ? (
            <button
              onClick={startGame}
              className="bg-blue-900"
              disabled={players.length < 4 || players.length > 10}
              title={players.length < 4 ? "Need at least 4 players" : ""}
            >
              Start Game
            </button>
          ) : (
            <h2 style={{ color: "deeppink", fontSize: "2.5rem" }}>
              Game Started!
            </h2>
          )}
        </section>
      )}
    </main>
  );
}
