"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSocket } from "@/socket";

interface JoinGameProps {
  onGameJoined: (playerName: string, gameCode: string, markerId: number) => void;
}

export const JoinGame = ({ onGameJoined }: JoinGameProps) => {
  const [gameCode, setGameCode] = useState('');
  const [markerId, setMarkerId] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const socket = getSocket();

    const handleJoinSuccess = ({ name, markerId }: { name: string; markerId: number }) => {
      setIsJoining(false);
      onGameJoined(name, gameCode.trim(), markerId);
    };

    const handleError = (msg: string) => {
      setIsJoining(false);
      setError(msg);
    };

    socket.on("joined_successfully", handleJoinSuccess);
    socket.on("error", handleError);

    return () => {
      socket.off("joined_successfully", handleJoinSuccess);
      socket.off("error", handleError);
    };
  }, [gameCode, onGameJoined]);

  const handleJoinGame = () => {
    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    if (!markerId) {
      setError('Please enter your marker ID');
      return;
    }

    const parsedMarkerId = parseInt(markerId);
    if (isNaN(parsedMarkerId)) {
      setError('Marker ID must be a number');
      return;
    }

    if (parsedMarkerId < 0 || parsedMarkerId > 1024) {
      setError('Marker ID must be between 0-1024');
      return;
    }

    setIsJoining(true);
    setError('');

    const socket = getSocket();
    socket.emit("join_game", {
      gameID: gameCode.trim(),
      markerId: parsedMarkerId
    });
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl">Join Game</CardTitle>
          <CardDescription className="text-slate-400">
            Enter your game code to join the laser tag session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gameCode" className="text-slate-300">Game Code</Label>
            <Input
              id="gameCode"
              type="text"
              placeholder="Enter 6-digit code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-center tracking-widest font-mono text-lg"
              maxLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="markerId" className="text-slate-300">
              Your Marker ID (0-14)
            </Label>
            <Input
              id="markerId"
              type="number"
              min="0"
              max="1024"
              placeholder="Enter your marker ID"
              value={markerId}
              onChange={(e) => setMarkerId(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <p className="text-slate-400 text-sm">
              Use a marker ID from 0-14. Generate markers at <a 
                href="https://chev.me/arucogen" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cyan-400 underline"
              >
                chev.me/arucogen
              </a>
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <Button 
            onClick={handleJoinGame}
            disabled={isJoining || !markerId}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 text-lg"
          >
            {isJoining ? 'Joining Game...' : 'Join Game'}
          </Button>

          <div className="bg-slate-700/50 p-4 rounded-lg mt-6">
            <h4 className="text-white font-semibold mb-2 text-sm">How to Play</h4>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>• You start with 3 hearts (health)</li>
              <li>• Point your camera at opponents' markers to target them</li>
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