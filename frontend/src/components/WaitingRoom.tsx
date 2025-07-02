import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getSocket } from "@/socket";

interface Player {
  id: string;
  name: string;
  lives: number;
  kills: number;
  markerId: number;
}

interface WaitingRoomProps {
  gameCode: string;
  onStartGame: () => void;
}

export const WaitingRoom = ({ gameCode, onStartGame }: WaitingRoomProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    // Join the specific game room
    socket.emit("watch_game", gameCode);

    // Listen for player updates
    socket.on("players_update", (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
    });

    // Game started event
    socket.on("game_started", () => {
      setGameStarted(true);
      onStartGame();
    });

    socket.on("error", (msg: string) => {
      alert(msg);
    });

    return () => {
      socket.off("players_update");
      socket.off("game_started");
      socket.off("error");
    };
  }, [gameCode, onStartGame]);

  const minPlayersReached = players.length >= 4;

  const handleStartGame = () => {
    if (minPlayersReached) {
      const socket = getSocket();
      socket.emit("start_game", gameCode);
    } else {
      alert("Need at least 4 players to start the game.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl">Waiting for Players</CardTitle>
          <CardDescription className="text-slate-400">
            Share the game code with players to join
          </CardDescription>
          <div className="flex justify-center mt-4">
            <Badge className="text-2xl px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold tracking-wider">
              {gameCode}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-slate-300">
              <span className="text-white font-semibold">{players.length}</span> players joined
            </p>
            <p className="text-slate-400 text-sm">Minimum 4 players required to start</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {players.map((player) => (
              <Card key={player.id} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <Avatar className="mx-auto mb-2 bg-gradient-to-r from-cyan-400 to-purple-400">
                    <AvatarFallback className="text-white font-bold">
                      {player.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white font-medium">{player.name}</p>
                  <p className="text-sm text-purple-400 mt-1">
                    Marker ID: {player.markerId}
                  </p>
                  <Badge variant="outline" className="mt-1 text-green-400 border-green-400">
                    Ready
                  </Badge>
                </CardContent>
              </Card>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 10 - players.length) }).map((_, index) => (
              <Card key={`empty-${index}`} className="bg-slate-700/20 border-slate-600 border-dashed">
                <CardContent className="p-4 text-center">
                  <div className="h-10 w-10 mx-auto mb-2 rounded-full bg-slate-600/50 flex items-center justify-center">
                    <span className="text-slate-400 text-xs">?</span>
                  </div>
                  <p className="text-slate-500 text-sm">Waiting...</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button 
            onClick={handleStartGame}
            disabled={!minPlayersReached}
            className={`w-full py-3 text-lg font-semibold ${
              minPlayersReached
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                : 'bg-slate-600 cursor-not-allowed'
            }`}
          >
            {minPlayersReached ? 'Start Game' : `Need ${4 - players.length} more players`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};