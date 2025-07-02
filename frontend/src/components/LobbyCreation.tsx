import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSocket } from "@/socket"; // 👈 import the singleton

interface LobbyCreationProps {
  onLobbyCreated: (code: string) => void;
}

export const LobbyCreation = ({ onLobbyCreated }: LobbyCreationProps) => {
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const handleGameCreated = (id: string) => {
      setIsCreating(false);
      onLobbyCreated(id);
    };

    const handleConnectError = () => {
      setIsCreating(false);
      alert("Failed to connect to the server.");
    };

    socket.on("game_created", handleGameCreated);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("game_created", handleGameCreated);
      socket.off("connect_error", handleConnectError);
    };
  }, [onLobbyCreated]);

  const handleCreateLobby = () => {
    const socket = getSocket();
    setIsCreating(true);

    socket.emit("create_game", {
      minPlayers: 4,
      maxPlayers: 10,
      gameMode: "Death Match",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl">Create New Lobby</CardTitle>
          <CardDescription className="text-slate-400">
            Set up your laser tag game session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Game Settings Preview</h4>
            <div className="space-y-1 text-sm text-slate-300">
              <p>Players: 4 - 10</p>
              <p>Mode: Death Match</p>
              <p>Health per player: 3 hearts</p>
            </div>
          </div>
          <div className="pt-4">
            <Button 
              onClick={handleCreateLobby}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 text-lg"
            >
              {isCreating ? "Creating Lobby..." : "Create Lobby"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
