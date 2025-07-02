// src/pages/Player.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Smartphone } from "lucide-react";
import { JoinGame } from "@/components/JoinGame";
import { PlayerGame } from "@/components/PlayerGame";

export type PlayerState = 'joining' | 'in-game';

const Player = () => {
  const navigate = useNavigate();
  const [playerState, setPlayerState] = useState<PlayerState>('joining');
  const [playerName, setPlayerName] = useState<string>('');
  const [gameCode, setGameCode] = useState<string>('');
  const [markerId, setMarkerId] = useState<number>(0);

  const handleGameJoined = (name: string, code: string, markerId: number) => {
    setPlayerName(name);
    setGameCode(code);
    setMarkerId(markerId);
    setPlayerState('in-game');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Smartphone className="h-6 w-6 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Player Interface</h1>
              <p className="text-slate-400 text-sm">Join and play laser tag</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleBackToHome} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            <ArrowUp className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>

        {playerState === 'joining' && (
          <JoinGame onGameJoined={handleGameJoined} />
        )}

        {playerState === 'in-game' && (
          <PlayerGame 
            playerName={playerName}
            gameCode={gameCode}
            markerId={markerId}
          />
        )}
      </div>
    </div>
  );
};

export default Player;