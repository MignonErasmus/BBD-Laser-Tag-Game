// "use client";
// import { useState, useEffect } from "react";
// import { io, Socket } from "socket.io-client";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

// interface JoinGameProps {
//   onGameJoined: (playerName: string, gameCode: string) => void;
// }

// let socket: Socket;

// export const JoinGame = ({ onGameJoined }: JoinGameProps) => {
//   const [gameCode, setGameCode] = useState('');
//   const [isJoining, setIsJoining] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     socket = io("http://localhost:4000");

//     socket.on("joined_successfully", ({ name }: { name: string }) => {
//       setIsJoining(false);
//       onGameJoined(name, gameCode.trim());
//     });

//     socket.on("error", (msg: string) => {
//       setIsJoining(false);
//       setError(msg);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [gameCode, onGameJoined]);

//   const handleJoinGame = () => {
//     if (!gameCode.trim()) {
//       setError('Please enter a game code');
//       return;
//     }

//     setIsJoining(true);
//     setError('');

//     socket.emit("join_game", {
//       gameID: gameCode.trim()
//     });
//   };

//   return (
//     <div className="max-w-md mx-auto mt-8">
//       <Card className="bg-slate-800/50 border-slate-700">
//         <CardHeader className="text-center">
//           <CardTitle className="text-white text-2xl">Join Game</CardTitle>
//           <CardDescription className="text-slate-400">
//             Enter your game code to join the laser tag session
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="gameCode" className="text-slate-300">Game Code</Label>
//             <Input
//               id="gameCode"
//               type="text"
//               placeholder="Enter 6-digit code"
//               value={gameCode}
//               onChange={(e) => setGameCode(e.target.value)}
//               className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 text-center tracking-widest font-mono text-lg"
//               maxLength={6}
//             />
//           </div>

//           {error && (
//             <p className="text-red-400 text-sm text-center">{error}</p>
//           )}

//           <Button 
//             onClick={handleJoinGame}
//             disabled={isJoining}
//             className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 text-lg"
//           >
//             {isJoining ? 'Joining Game...' : 'Join Game'}
//           </Button>

//           <div className="bg-slate-700/50 p-4 rounded-lg mt-6">
//             <h4 className="text-white font-semibold mb-2 text-sm">How to Play</h4>
//             <ul className="space-y-1 text-xs text-slate-300">
//               <li>• You start with 3 hearts (health)</li>
//               <li>• Tap the shoot button to eliminate opponents</li>
//               <li>• Avoid getting shot to stay in the game</li>
//               <li>• Last player standing wins!</li>
//             </ul>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };


"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSocket } from "@/socket"; // 👈 use the singleton

interface JoinGameProps {
  onGameJoined: (playerName: string, gameCode: string) => void;
}

export const JoinGame = ({ onGameJoined }: JoinGameProps) => {
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const socket = getSocket();

    const handleJoinSuccess = ({ name }: { name: string }) => {
      setIsJoining(false);
      onGameJoined(name, gameCode.trim());
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

    setIsJoining(true);
    setError('');

    const socket = getSocket();
    socket.emit("join_game", {
      gameID: gameCode.trim(),
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
