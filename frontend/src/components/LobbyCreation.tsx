
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

/// # TODO: Need to remove the simulation code
interface LobbyCreationProps {
  onLobbyCreated: (code: string) => void;
}

export const LobbyCreation = ({ onLobbyCreated }: LobbyCreationProps) => {
  const [minPlayers, setMinPlayers] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [gameMode, setGameMode] = useState('Team Deathmatch');
  const [isCreating, setIsCreating] = useState(false);

  const generateGameCode = () => {
    // 🧐 Simulate backend code generation
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleCreateLobby = async () => {
    setIsCreating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const gameCode = generateGameCode();
    console.log('Lobby created with settings:', { minPlayers, maxPlayers, gameMode, gameCode });
    
    setIsCreating(false);
    onLobbyCreated(gameCode);
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minPlayers" className="text-slate-300">Minimum Players</Label>
              <Input
                id="minPlayers"
                type="number"
                value={minPlayers}
                onChange={(e) => setMinPlayers(parseInt(e.target.value))}
                min={2}
                max={20}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPlayers" className="text-slate-300">Maximum Players</Label>
              <Input
                id="maxPlayers"
                type="number"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                min={2}
                max={20}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-300">Game Mode</Label>
            <div className="flex flex-wrap gap-2">
              {['Team Deathmatch', 'Free For All', 'Capture the Flag', 'Last Man Standing'].map((mode) => (
                <Badge
                  key={mode}
                  variant={gameMode === mode ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    gameMode === mode
                      ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                  onClick={() => setGameMode(mode)}
                >
                  {mode}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleCreateLobby}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 text-lg"
            >
              {isCreating ? 'Creating Lobby...' : 'Create Lobby'}
            </Button>
          </div>

          <div className="bg-slate-700/50 p-4 rounded-lg">
            <h4 className="text-white font-semibold mb-2">Game Settings Preview</h4>
            <div className="space-y-1 text-sm text-slate-300">
              <p>Players: {minPlayers} - {maxPlayers}</p>
              <p>Mode: {gameMode}</p>
              <p>Health per player: 3 hearts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
