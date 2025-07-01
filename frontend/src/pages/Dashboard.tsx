
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Monitor, Camera } from "lucide-react";
import { LobbyCreation } from "@/components/LobbyCreation";
import { WaitingRoom } from "@/components/WaitingRoom";
import { GameAnalytics } from "@/components/GameAnalytics";

export type GameState = 'lobby-creation' | 'waiting' | 'in-game';

const Dashboard = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>('lobby-creation');
  const [gameCode, setGameCode] = useState<string>('');
  const [players, setPlayers] = useState<Array<{id: string, name: string, health: number, kills: number}>>([]);

  const handleLobbyCreated = (code: string) => {
    setGameCode(code);
    setGameState('waiting');
  };

  const handleStartGame = () => {
    setGameState('in-game');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Monitor className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Game Dashboard</h1>
              <p className="text-slate-400">Manage your laser tag game session</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {gameCode && (
              <Badge variant="outline" className="text-cyan-400 border-cyan-400 bg-slate-800/50 text-lg px-4 py-2">
                Code: {gameCode}
              </Badge>
            )}
            <Button variant="outline" onClick={handleBackToHome} className="border-slate-600 text-slate-300 hover:bg-slate-800">
              <ArrowUp className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>

        {gameState === 'lobby-creation' && (
          <LobbyCreation onLobbyCreated={handleLobbyCreated} />
        )}

        {gameState === 'waiting' && (
          <WaitingRoom 
            gameCode={gameCode}
            players={players}
            onStartGame={handleStartGame}
          />
        )}

        {gameState === 'in-game' && (
          <GameAnalytics 
            players={players}
            gameCode={gameCode}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
