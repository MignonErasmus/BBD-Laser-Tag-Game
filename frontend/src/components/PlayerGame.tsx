import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/socket";
import { ArucoDetector } from "@/components/ArucoDetector";

interface Player {
  id: string;
  name: string;
  lives: number;
  kills: number;
  reloading: boolean;
  markerId: number;
}

interface PlayerGameProps {
  playerName: string;
  gameCode: string;
  markerId: number;
}

export const PlayerGame = ({ playerName, gameCode, markerId }: PlayerGameProps) => {
  const navigate = useNavigate();
  const socket = getSocket();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isEliminated, setIsEliminated] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [reloading, setReloading] = useState(false);
  const [isAiming, setIsAiming] = useState(false);
  const [currentTarget, setCurrentTarget] = useState<number | null>(null);
  const [isScannerReady, setIsScannerReady] = useState(false);

  const reloadTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPlayer = players.find(p => p.name === playerName) || {
    id: '',
    name: playerName,
    lives: 5,
    kills: 0,
    reloading: false,
    markerId
  };

  useEffect(() => {
    socket.emit("watch_game", gameCode);

    const handlePlayersUpdate = (updatedPlayers: Player[]) => {
      setPlayers(updatedPlayers);
      const me = updatedPlayers.find(p => p.name === playerName);
      if (me && me.lives <= 0) setIsEliminated(true);
    };

    const handleEliminated = () => setIsEliminated(true);

    const handleReloadComplete = () => {
      console.log("✅ Reload complete from server");
      clearTimeout(reloadTimeout.current!);
      setReloading(false);
    };

    socket.on("players_update", handlePlayersUpdate);
    socket.on("eliminated", handleEliminated);
    socket.on("reload_complete", handleReloadComplete);
    socket.on("game_started", () => setGameTime(0));
    socket.on("error", (msg: string) => console.error("Game error:", msg));

    return () => {
      socket.off("players_update", handlePlayersUpdate);
      socket.off("eliminated", handleEliminated);
      socket.off("reload_complete", handleReloadComplete);
      socket.off("game_started");
      socket.off("error");
    };
  }, [socket, gameCode, playerName]);

  useEffect(() => {
    if (!isEliminated) {
      const timer = setInterval(() => setGameTime(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isEliminated]);

   const handleTargetDetected = (detectedMarkerId: number | null) => {
  if (detectedMarkerId === null || detectedMarkerId === markerId) {
    setCurrentTarget(null);
  }else{
    setCurrentTarget(detectedMarkerId);
  }

  if (detectedMarkerId !== markerId) {
    setCurrentTarget(detectedMarkerId);
  }
  };

  const shootSound = new Audio("/sounds/shot-and-reload-sound.mp3");

  const handleShoot = () => {
    if (!socket || reloading || isEliminated || !currentTarget) return;

    shootSound.currentTime = 0;
    shootSound.play();

    console.log("🔫 Shooting target:", currentTarget);
    socket.emit("shoot", {
      gameID: gameCode,
      targetMarkerId: currentTarget,
    });

    setReloading(true);
    setCurrentTarget(null);

    // Fallback: auto-reset reloading in case server fails to respond
    reloadTimeout.current = setTimeout(() => {
      console.warn("⏰ Reload fallback triggered. Resetting reload state.");
      setReloading(false);
    }, 2500);
  };

  const toggleAimingMode = () => {
    setIsAiming(prev => !prev);
    setCurrentTarget(null);
  };

  const handleBackToHome = () => navigate("/");

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
              <p>Your Marker ID: <span className="text-purple-400 font-bold">{markerId}</span></p>
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
    <div className="min-h-[calc(100vh-7rem)] bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 z-10 flex flex-col sm:flex-row justify-between items-center p-4 gap-y-2 sm:gap-y-0">
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
          <div className="text-cyan-400 font-bold text-lg">{playerName}</div>
          <div className="text-purple-400">Marker ID: {markerId}</div>
        </div>
  
        <div className="flex flex-wrap justify-center sm:justify-end items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-2xl ${i < currentPlayer.lives ? 'text-red-500' : 'text-slate-600'}`}>♥</span>
            ))}
          </div>
          <div className="bg-slate-900/80 px-3 py-1 sm:px-4 sm:py-2 rounded border border-cyan-400 text-center">
            <span className="text-yellow-400 font-bold text-lg sm:text-xl">{currentPlayer.kills}</span>
            <div className="text-xs text-cyan-400">KILLS</div>
          </div>
          <div className="bg-slate-900/80 px-3 py-1 sm:px-4 sm:py-2 rounded border border-purple-400 text-center">
            <span className="text-purple-400 font-bold text-lg sm:text-xl">
              {currentTarget || "--"}
            </span>
            <div className="text-xs text-purple-400">TARGET</div>
          </div>
        </div>
      </div>
  
      {isAiming ? (
        <div className="absolute inset-0">
          <ArucoDetector
            onTargetDetected={handleTargetDetected}
            onReadyChange={setIsScannerReady}
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60"></div>
          <div className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"></div>
          <div className="relative">
            <div className="w-32 h-32 border-2 border-cyan-400 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-cyan-400 rounded-full relative">
                <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping"></div>
              </div>
            </div>
            <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-cyan-400 font-semibold">Camera Scanner Active</div>
              <div className="text-slate-400 text-sm">Point at targets to scan</div>
            </div>
          </div>
        </div>
      )}
  
      <button
        onClick={toggleAimingMode}
        className={`text-sm absolute top-4 right-4 px-2 py-2 rounded-lg z-20 ${
          isAiming ? "bg-red-500 text-white" : "bg-cyan-500 text-white"
        } sm:top-20`}
      >
        {isAiming ? "Exit Scanner" : "Activate Scanner"}
      </button>
  
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <Button
          onClick={handleShoot}
          disabled={reloading || !currentTarget || !isScannerReady}
          className={`w-20 h-20 rounded-full border-4 shadow-lg transition-transform ${
            reloading
              ? "bg-gray-500 border-gray-300 shadow-gray-500/50"
              : currentTarget && isScannerReady
                ? "bg-red-500 border-red-300 shadow-red-500/50 hover:scale-105"
                : "bg-orange-500 border-orange-300 shadow-orange-500/50"
          }`}
        >
          <div className="text-center">
            {reloading ? (
              <div className="text-white text-xs font-bold animate-pulse">RELOADING</div>
            ) : (
              <>
                <div className="w-3 h-3 bg-white rounded-full mx-auto mb-1"></div>
                <div className="text-xs font-bold text-white">FIRE</div>
              </>
            )}
          </div>
        </Button>
      </div>
  
      <div className="absolute bottom-4 left-4 bg-slate-800/80 p-2 rounded-lg text-xs text-slate-400">
        <p>Scanner: {isScannerReady ? "Ready" : "Loading"}</p>
        <p>Target: {currentTarget || "None"}</p>
        <p>Reloading: {reloading ? "Yes" : "No"}</p>
      </div>
    </div>
  ); 
};
