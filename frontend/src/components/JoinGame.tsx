
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface JoinGameProps {
  onGameJoined: (playerName: string, gameCode: string) => void;
}

export const JoinGame = ({ onGameJoined }: JoinGameProps) => {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    setIsJoining(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate successful join (in real app, this would validate the code)
    console.log('Player joining:', { playerName, gameCode });
    onGameJoined(playerName.trim(), gameCode.trim().toUpperCase());
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl">Join Game</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your details to join a laser tag session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-slate-300">Player Name</Label>
            <Input
              id="playerName"
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gameCode" className="text-slate-300">Game Code</Label>
            <Input
              id="gameCode"
              type="text"
              placeholder="Enter 6-digit code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-center tracking-widest font-mono text-lg"
              maxLength={6}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button 
            onClick={handleJoinGame}
            disabled={isJoining}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 text-lg"
          >
            {isJoining ? 'Joining Game...' : 'Join Game'}
          </Button>

          <div className="bg-slate-700/50 p-4 rounded-lg mt-6">
            <h4 className="text-white font-semibold mb-2 text-sm">How to Play</h4>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>• You start with 3 hearts (health)</li>
              <li>• Tap the shoot button to eliminate opponents</li>
              <li>• Avoid getting shot to stay in the game</li>
              <li>• Last player standing wins!</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
