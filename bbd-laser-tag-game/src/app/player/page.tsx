"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { PlayerInfo } from "@/shared/types";

let socket: Socket;

export default function Player() {
  const [inputGameID, setInputGameID] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [reloading, setReloading] = useState(false);
  const [eliminated, setEliminated] = useState(false);
  const [gameID, setGameID] = useState("");

  useEffect(() => {
    // ? 'http://localhost:4000'
    // : process.env.NEXT_PUBLIC_BACKEND_URL;
    socket = io('http://localhost:4000');

    socket.on("game_started", () => setGameStarted(true));
    socket.on("players_update", (data: PlayerInfo[]) => setPlayers(data));
    socket.on("reload_complete", () => setReloading(false));
    socket.on("eliminated", () => {
      setEliminated(true);
      socket.disconnect();
    });
    socket.on("joined_successfully", ({ name, players}) => {
      setPlayerName(name);
    })

    socket.on("error", (msg: string) => alert(msg));

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinGame = () => {
    if (inputGameID /*&& playerName*/) {
      setGameID(inputGameID.trim());
      socket.emit("join_game", {
        gameID: inputGameID.trim(),
      });
      setJoined(true);
    } else {
      alert("Please enter both Game ID and your Name.");
    }
  };

  const shoot = (targetID: string) => {
    if (!reloading && !eliminated && gameID) {
      setReloading(true);
      socket.emit("shoot", { gameID, targetID });
    }
  };

  if (eliminated)
    return (
      <main>
        <h2>You have been eliminated.</h2>
      </main>
    );

  if (!joined)
    return (
      <main>
        <header>
          <h1>Join Laser Tag Game</h1>
        </header>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            joinGame();
          }}
          aria-label="Join game form"
        >

          <label htmlFor="gameID">Game ID:</label>
          <input
            id="gameID"
            type="text"
            placeholder="Game ID"
            value={inputGameID}
            onChange={(e) => setInputGameID(e.target.value)}
            required
            autoComplete="off"
          />

          <button type="submit">Join Game</button>
        </form>
      </main>
    );

  if (!gameStarted)
    return (
      <main>
        <h2>Waiting for the game to start...</h2>
      </main>
    );

  return (
    <main>
      <header>
        <h1>Laser Tag Game</h1>
        <p className="text-2xl text-red-700">Welcome, {playerName}!</p>
        {reloading && <p>🔄 Reloading...</p>}
      </header>

      <section aria-label="Player list">
        <h2>Players:</h2>
        <ul>
          {players
            .filter((p) => p.name !== "Dashboard")
            .map((p) => (
              <li key={p.id}>
                {p.name} - {p.lives ?? "?"} ❤️ - {p.kills ?? "?"} 🔫
                {p.id !== socket.id && !reloading && !eliminated && (
                  <button onClick={() => shoot(p.id)} aria-label={`Shoot ${p.name}`}>
                    Shoot
                  </button>
                )}
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
