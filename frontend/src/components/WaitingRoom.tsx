
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// #TODO remove simulation code
// 🧐  Simple interface for testing
interface Player {
  id: string;
  name: string;
  health: number;
  kills: number;
}

//🧐Simple interface for testing
interface WaitingRoomProps {
  gameCode: string;
  players: Player[];
  onStartGame: () => void;
}

export const WaitingRoom = ({ gameCode, players, onStartGame }: WaitingRoomProps) => {
  const [currentPlayers, setCurrentPlayers] = useState<Player[]>([]);

  // 🧐 Simulate players joining
  useEffect(() => {
    const playerNames = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot'];
    let playerCount = 0;

    const addPlayer = () => {
      if (playerCount < playerNames.length) {
        const newPlayer: Player = {
          id: `player-${playerCount + 1}`,
          name: playerNames[playerCount],
          health: 3,
          kills: 0
        };
        
        setCurrentPlayers(prev => [...prev, newPlayer]);
        playerCount++;
        
        if (playerCount < 4) { // Add up to 4 players automatically
          setTimeout(addPlayer, Math.random() * 3000 + 2000);
        }
      }
    };

    // 🧐 Start adding players after a short delay
    setTimeout(addPlayer, 1000);
  }, []);

  const minPlayersReached = currentPlayers.length >= 2;

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
              <span className="text-white font-semibold">{currentPlayers.length}</span> players joined
            </p>
            <p className="text-slate-400 text-sm">Minimum 2 players required to start</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {currentPlayers.map((player) => (
              <Card key={player.id} className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4 text-center">
                  <Avatar className="mx-auto mb-2 bg-gradient-to-r from-cyan-400 to-purple-400">
                    <AvatarFallback className="text-white font-bold">
                      {player.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white font-medium">{player.name}</p>
                  <Badge variant="outline" className="mt-1 text-green-400 border-green-400">
                    Ready
                  </Badge>
                </CardContent>
              </Card>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 4 - currentPlayers.length) }).map((_, index) => (
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
            onClick={onStartGame}
            disabled={!minPlayersReached}
            className={`w-full py-3 text-lg font-semibold ${
              minPlayersReached
                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                : 'bg-slate-600 cursor-not-allowed'
            }`}
          >
            {minPlayersReached ? 'Start Game' : `Need ${2 - currentPlayers.length} more players`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
