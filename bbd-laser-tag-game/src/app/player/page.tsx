"use client";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

export default function Player() {
    const [inputGameID, setInputGameID] = useState("");
    const [playerName, setPlayerName] = useState("");
    const [joined, setJoined] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        socket = io("http://localhost:4000");
    
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
    
      const joinGame = () => {
        if (inputGameID.trim() && playerName.trim()) {
            const trimmedGameID = inputGameID.trim();
          socket.emit("join_game", { gameID: trimmedGameID, name: playerName.trim() });
          setJoined(true);
        } else {
          alert("Please enter both Game ID and your Name.");
        }
      };
    
      if (gameStarted) {
        return <h2 className="text-green-500 text-4xl">Game Started! Ready to play!</h2>;
      }

    return (
        <div>
        <h1>Player</h1>
        {!joined ? (
            <>
            <input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
            />
            <input
                placeholder="Enter Game ID"
                value={inputGameID}
                onChange={(e) => setInputGameID(e.target.value)}
            />
            <button onClick={joinGame}>Join Game</button>
            </>
        ) : (
            <p>Waiting for the game to start...</p>
        )}
        </div>
    )
}