// components/PlayerGame.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/socket"; 
import { ArrowUp } from "lucide-react"

interface Player {
  id: string;
  name: string;
  lives: number;
  kills: number;
  reloading: boolean;
}

interface PlayerGameProps {
  playerName: string;
  gameCode: string;
}

export const PlayerGame = ({ playerName, gameCode }: PlayerGameProps) => {
  const navigate = useNavigate();
  const socket = getSocket(); // Use your existing socket instance
  const [players, setPlayers] = useState<Player[]>([]);
  const [isEliminated, setIsEliminated] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [reloading, setReloading] = useState(false);
  const [targets, setTargets] = useState<Player[]>([]);

  // Find current player
  const currentPlayer = players.find(p => p.name === playerName) || {
    id: '',
    name: playerName,
    lives: 3,
    kills: 0,
    reloading: false
  };

  // Handle socket events
  useEffect(() => {
    // Emit join_game event
    socket.emit("join_game", { gameID: gameCode });

    // Set up event listeners
    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
      
      // Update elimination status
      const me = updatedPlayers.find(p => p.name === playerName);
      if (me && me.lives <= 0) {
        setIsEliminated(true);
      }
    };

    const handleEliminated = () => {
      setIsEliminated(true);
    };

    const handleReloadComplete = () => {
      setReloading(false);
    };

    const handleGameStarted = () => {
      console.log("Game started!");
      setGameTime(0);
    };

    const handleError = (message: string) => {
      console.error("Game error:", message);
    };

    socket.on("players_update", handlePlayersUpdate);
    socket.on("eliminated", handleEliminated);
    socket.on("reload_complete", handleReloadComplete);
    socket.on("game_started", handleGameStarted);
    socket.on("error", handleError);

    // Clean up event listeners
    return () => {
      socket.off("players_update", handlePlayersUpdate);
      socket.off("eliminated", handleEliminated);
      socket.off("reload_complete", handleReloadComplete);
      socket.off("game_started", handleGameStarted);
      socket.off("error", handleError);
    };
  }, [socket, gameCode, playerName]);

  // Game timer
  useEffect(() => {
    if (isEliminated) return;
    
    const timer = setInterval(() => {
      setGameTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isEliminated]);

  // Update targets list when players change
  useEffect(() => {
    if (!currentPlayer) return;
    
    const availableTargets = players.filter(
      p => p.id !== currentPlayer.id && p.lives > 0
    );
    
    setTargets(availableTargets);
  }, [players, currentPlayer]);

  const handleShoot = () => {
    if (!currentPlayer || reloading || isEliminated) return;
    if (targets.length === 0) return;

    // Select random target
    const randomTarget = targets[Math.floor(Math.random() * targets.length)];
    
    // Emit shoot event
    socket.emit("shoot", {
      gameID: gameCode,
      targetID: randomTarget.id
    });

    // Set local reloading state
    setReloading(true);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  // Render eliminated screen
  if (isEliminated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-900 flex items-center justify-center p-4">
        <Card className="bg-red-900/50 border-red-700 max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-3xl font-bold text-red-400 mb-4">ELIMINATED</h2>
            <p className="text-white mb-2">Better luck next time, {playerName}!</p>
            <div className="space-y-2 text-slate-300">
              <p>Final Stats:</p>
              <p>Kills: <span className="text-green-400 font-bold">{currentPlayer.kills}</span></p>
              <p>Survival Time: <span className="text-cyan-400 font-bold">
                {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}
              </span></p>
            </div>
            <Button onClick={handleBackToHome} className="mt-4 bg-slate-700 hover:bg-slate-600">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-900 relative overflow-hidden">
      {/* Top UI Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={handleBackToHome} 
            className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div className="text-cyan-400 font-bold text-lg">{playerName}</div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={`text-2xl ${
                  i < currentPlayer.lives ? 'text-red-500' : 'text-slate-600'
                }`}
              >
                ♥
              </span>
            ))}
          </div>
          <div className="bg-slate-900/80 px-4 py-2 rounded border border-cyan-400">
            <span className="text-yellow-400 font-bold text-xl">{currentPlayer.kills}</span>
            <div className="text-xs text-cyan-400">KILLS</div>
          </div>
          <div className="bg-slate-900/80 px-4 py-2 rounded border border-purple-400">
            <span className="text-purple-400 font-bold text-xl">{targets.length}</span>
            <div className="text-xs text-purple-400">TARGETS</div>
          </div>
        </div>
      </div>

      {/* Crosshair Targeting System */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Vertical line */}
        <div className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60"></div>
        
        {/* Horizontal line */}
        <div className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"></div>
        
        {/* Center crosshair */}
        <div className="relative">
          <div className="w-32 h-32 border-2 border-cyan-400 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-cyan-400 rounded-full relative">
              <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* Scanner text */}
          <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-cyan-400 font-semibold">Camera Scanner Active</div>
            <div className="text-slate-400 text-sm">Point at targets to scan</div>
          </div>
        </div>
      </div>

      {/* Bottom Fire Button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <Button
          onClick={handleShoot}
          disabled={reloading}
          className={`w-20 h-20 rounded-full border-4 shadow-lg ${
            reloading 
              ? "bg-gray-500 border-gray-300 shadow-gray-500/50 cursor-not-allowed" 
              : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-300 shadow-red-500/50"
          }`}
        >
          <div className="text-center">
            {reloading ? (
              <div className="text-white text-xs font-bold">RELOADING</div>
            ) : (
              <>
                <div className="w-3 h-3 bg-white rounded-full mx-auto mb-1"></div>
                <div className="text-xs font-bold text-white">FIRE</div>
              </>
            )}
          </div>
        </Button>
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400"></div>
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400"></div>
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400"></div>
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400"></div>
    </div>
  );
};