"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Player {
    id: string;
    name: string;
}

let socket: Socket;

export default function Dashboard() {
    const [gameID, setGameID] = useState<string | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        socket = io("http://localhost:4000");
    
        socket.on("game_created", (id: string) => {
            setGameID(id);
            // Join the game room to get players_update events
            socket.emit("join_game", { gameID: id, name: "Dashboard" });
        });
    
        socket.on("players_update", (updatedPlayers: Player[]) => {
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
    <div>
        <h1>Dashboard</h1>
        {!gameID && <button onClick={createGame}>Create Game</button>}

        {gameID && (
        <>
            <p>Game ID: {gameID}</p>

            <h3>Players Joined:</h3>
            <ul>
            {players.map((p) => (
                <li key={p.id}>{p.name}</li>
            ))}
            </ul>

            {!gameStarted ? (
            <button
                onClick={startGame}
                disabled={players.length < 4}
                title={players.length < 4 ? "Need at least 4 players" : ""}
            >
                Start Game
            </button>
            ) : (
            <h2 className="text-4xl text-pink-600">Game Started! Ready to play!</h2>
            )}
        </>
        )}
    </div>
    )
}