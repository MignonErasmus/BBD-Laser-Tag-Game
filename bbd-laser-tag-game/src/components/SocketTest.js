"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function SocketTest() {
  const [connected, setConnected] = useState(false);
  const [socketId, setSocketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lobbyId, setLobbyId] = useState("");
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect only once
    socketRef.current = io("http://localhost:4000"); // Change if your backend URL differs

    socketRef.current.on("connect", () => {
      setConnected(true);
      setSocketId(socketRef.current.id);
      addMessage(`Connected with ID: ${socketRef.current.id}`);
    });

    socketRef.current.on("disconnect", () => {
      setConnected(false);
      addMessage("Disconnected from server");
    });

    socketRef.current.on("lobby_message", (msg) => {
      addMessage(`[Lobby] ${msg}`);
    });

    socketRef.current.on("message", ({ sender, message }) => {
      addMessage(`[${sender}] ${message}`);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  function addMessage(msg) {
    setMessages((prev) => [...prev, msg]);
  }

  function joinLobby() {
    if (lobbyId.trim() !== "") {
      socketRef.current.emit("join_lobby", lobbyId);
    }
  }

  function sendMessage() {
    if (lobbyId.trim() !== "" && message.trim() !== "") {
      socketRef.current.emit("message", { lobbyId, message });
      setMessage("");
    }
  }

  return (
    <div>
      <h2>Socket.IO Lobby Test</h2>
      <p>Status: {connected ? "Connected" : "Disconnected"}</p>
      <p>Your Socket ID: {socketId}</p>

      <input
        placeholder="Enter lobby ID"
        value={lobbyId}
        onChange={(e) => setLobbyId(e.target.value)}
      />
      <button onClick={joinLobby}>Join Lobby</button>

      <br />
      <br />

      <input
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send Message</button>

      <ul>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}