
// import { useState, useEffect } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Camera } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ArrowUp } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// interface Player {
//   id: string;
//   name: string;
//   lives: number;
//   kills: number;
//   isFirstKill?: boolean;
//   isFirstDeath?: boolean;
// }

// interface GameAnalyticsProps {
//   players: Player[];
//   gameCode: string;
// }

// export const GameAnalytics = ({ gameCode }: GameAnalyticsProps) => {
//   const navigate = useNavigate();
//   const [players, setPlayers] = useState<Player[]>([
//     { id: '1', name: 'Player_008', lives: 3, kills: 8, isFirstKill: true },
//     { id: '2', name: 'Player_003', lives: 1, kills: 7 },
//     { id: '3', name: 'Player_006', lives: 2, kills: 6 },
//     { id: '4', name: 'Player_001', lives: 3, kills: 5 },
//     { id: '5', name: 'Player_010', lives: 1, kills: 5 },
//     { id: '6', name: 'Demo_Dummy', lives: 0, kills: 0, isFirstDeath: true },
//   ]);
//   const [gameTime, setGameTime] = useState(0); // 15:32
//   const [recentActivity, setRecentActivity] = useState([
//     "Player_008 eliminated Player_004",
//     "Player_003 eliminated Player_007"
//   ]);

//   // Simulate game activity
//   useEffect(() => {
//     const gameTimer = setInterval(() => {
//       setGameTime(prev => prev + 1);
//     }, 1000);

//     const activitySimulator = setInterval(() => {
//       if (Math.random() < 0.3) {
//         const activePlayers = players.filter(p => p.lives > 0);
//         if (activePlayers.length > 1) {
//           const attacker = activePlayers[Math.floor(Math.random() * activePlayers.length)];
//           const victim = activePlayers.filter(p => p.id !== attacker.id)[Math.floor(Math.random() * (activePlayers.length - 1))];
          
//           setRecentActivity(prev => [`${attacker.name} eliminated ${victim.name}`, ...prev.slice(0, 9)]);
          
//           setPlayers(prev => prev.map(player => {
//             if (player.id === attacker.id) {
//               return { ...player, kills: player.kills + 1 };
//             }
//             if (player.id === victim.id) {
//               return { ...player, health: 0 };
//             }
//             return player;
//           }));
//         }
//       }
//     }, 8000);

//     return () => {
//       clearInterval(gameTimer);
//       clearInterval(activitySimulator);
//     };
//   }, [players]);

//   const sortedPlayers = [...players].sort((a, b) => {
//     if (a.lives === 0 && b.lives > 0) return 1;
//     if (b.lives === 0 && a.lives > 0) return -1;
//     return b.kills - a.kills;
//   });

//   const totalKills = players.reduce((sum, player) => sum + player.kills, 0);
//   const activePlayers = players.filter(player => player.lives > 0).length;
//   const eliminatedPlayers = players.filter(player => player.lives === 0).length;
//   const topPlayer = sortedPlayers.find(p => p.lives > 0);
//   const mostKillsPlayer = [...players].sort((a, b) => b.kills - a.kills)[0];

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   const getPlayerBadges = (player: Player, index: number) => {
//     const badges = [];
    
//     if (player.id === topPlayer?.id && player.lives > 0) {
//       badges.push(<Badge key="mvp" className="bg-yellow-500 text-black font-bold">MVP</Badge>);
//     }
    
//     if (player.id === mostKillsPlayer?.id && player.kills > 0) {
//       badges.push(<Badge key="johnwick" className="bg-red-600 text-white">John Wick</Badge>);
//     }
    
//     if (player.isFirstKill) {
//       badges.push(<Badge key="firstblood" className="bg-purple-600 text-white">First Blood</Badge>);
//     }
    
//     if (player.isFirstDeath) {
//       badges.push(<Badge key="demodummy" className="bg-gray-600 text-white">Demo-dummy</Badge>);
//     }
    
//     return badges;
//   };

//   const handleBackToHome = () => {
//     navigate('/');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
//       <div className="container mx-auto p-6">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center space-x-4">
//             <Button 
//               variant="outline" 
//               onClick={handleBackToHome} 
//               className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
//             >
//               <ArrowUp className="h-4 w-4 mr-2" />
//               Back to Home
//             </Button>
//             <h1 className="text-3xl font-bold text-white">Game Dashboard</h1>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Panel - Analytics */}
//           <div className="space-y-6">
//             <Card className="bg-slate-800/50 border-slate-700">
//               <CardHeader>
//                 <CardTitle className="text-white text-lg">Analytics</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-slate-700/50 p-4 rounded-lg text-center">
//                     <div className="text-2xl font-bold text-cyan-400 flex items-center justify-center">
//                       👥 {activePlayers}
//                     </div>
//                     <div className="text-slate-400 text-sm">Active Players</div>
//                   </div>
//                   <div className="bg-slate-700/50 p-4 rounded-lg text-center">
//                     <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center">
//                       🏆 {eliminatedPlayers}
//                     </div>
//                     <div className="text-slate-400 text-sm">Eliminated</div>
//                   </div>
//                   <div className="bg-slate-700/50 p-4 rounded-lg text-center">
//                     <div className="text-2xl font-bold text-red-400 flex items-center justify-center">
//                       🎯 {totalKills}
//                     </div>
//                     <div className="text-slate-400 text-sm">Total Kills</div>
//                   </div>
//                   <div className="bg-slate-700/50 p-4 rounded-lg text-center">
//                     <div className="text-2xl font-bold text-green-400 flex items-center justify-center">
//                       ⏱️ {formatTime(gameTime)}
//                     </div>
//                     <div className="text-slate-400 text-sm">Game Time</div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Leaderboard */}
//             <Card className="bg-slate-800/50 border-slate-700">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   🏆 Leaderboard
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {sortedPlayers.map((player, index) => (
//                   <div key={player.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
//                     <div className="flex items-center space-x-3">
//                       <Badge className={`${
//                         index === 0 ? 'bg-yellow-500' : 
//                         index === 1 ? 'bg-gray-400' : 
//                         index === 2 ? 'bg-amber-600' : 
//                         'bg-slate-600'
//                       } text-white text-sm px-2 py-1`}>
//                         #{index + 1}
//                       </Badge>
//                       <div>
//                         <p className="text-white font-medium">{player.name}</p>
//                         <div className="flex space-x-1 mt-1">
//                           {getPlayerBadges(player, index)}
//                         </div>
//                         <div className="flex space-x-1 mt-1">
//                           <span className="text-red-400">♥ {player.lives}</span>
//                           <span className="text-cyan-400 ml-2">{player.kills} kills</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>

//             {/* Recent Activity */}
//             <Card className="bg-slate-800/50 border-slate-700">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   📊 Recent Activity
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-2">
//                   {recentActivity.map((activity, index) => (
//                     <div key={index} className="text-slate-300 text-sm flex justify-between">
//                       <span>{activity}</span>
//                       <span className="text-slate-500">{Math.floor(Math.random() * 60)}s ago</span>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Right Panel - Player Cameras */}
//           <div className="lg:col-span-2">
//             <Card className="bg-slate-800/50 border-slate-700 h-full">
//               <CardHeader>
//                 <CardTitle className="text-white flex items-center">
//                   <Camera className="h-5 w-5 mr-2" />
//                   Player Cameras
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-2 gap-4">
//                   {players.slice(0, 6).map((player) => (
//                     <div key={player.id} className="relative">
//                       <div className="aspect-video bg-slate-900 rounded-lg border border-slate-600 flex items-center justify-center relative overflow-hidden">
//                         <div className="text-center">
//                           <div className="text-slate-500 text-sm mb-1">Camera View</div>
//                         </div>
                        
//                         {/* Player Info Overlay */}
//                         <div className="absolute top-2 left-2">
//                           <Badge className="bg-black/70 text-cyan-400 text-xs">
//                             {player.name}
//                           </Badge>
//                         </div>
                        
//                         <div className="absolute top-2 right-2 flex items-center space-x-1">
//                           <span className="text-red-400 text-sm">♥ {player.lives}</span>
//                           {player.kills > 0 && (
//                             <Badge className="bg-yellow-600/80 text-white text-xs">
//                               {player.kills}
//                             </Badge>
//                           )}
//                         </div>
                        
//                         {player.lives === 0 && (
//                           <div className="absolute inset-0 bg-red-900/50 rounded-lg flex items-center justify-center">
//                             <Badge className="bg-red-600 text-white">ELIMINATED</Badge>
//                           </div>
//                         )}
                        
//                         {player.lives > 0 && (
//                           <div className="absolute bottom-2 right-2">
//                             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// import type { PlayerInfo } from "@/shared/types";
import { getSocket } from "@/socket";

interface GameAnalyticsProps {
  gameCode: string;
}

interface Player {
  id: string;
  name: string;
  lives: number;
  kills: number;
}

export const GameAnalytics = ({ gameCode }: GameAnalyticsProps) => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  useEffect(() => {
    const socket = getSocket();

    socket.emit("watch_game", gameCode);

    socket.on("players_update", (data: Player[]) => {
      setPlayers(data);
    });

    socket.on("player_action", (activity: string) => {
      setRecentActivity((prev) => [activity, ...prev].slice(0, 10));
    });

    socket.on("game_time", (seconds: number) => {
      setGameTime(seconds);
    });

    return () => {
      socket.off("players_update");
      socket.off("player_action");
      socket.off("game_time");
    };
  }, [gameCode]);

  const sorted = [...players].sort((a, b) => {
    if (a.lives === 0 && b.lives > 0) return 1;
    if (b.lives === 0 && a.lives > 0) return -1;
    return b.kills - a.kills;
  });

  const totalKills = players.reduce((sum, p) => sum + p.kills, 0);
  const activeCount = players.filter(p => p.lives > 0).length;
  const elimCount = players.filter(p => p.lives === 0).length;
  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const handleBack = () => navigate('/');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={handleBack} className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10">
            <ArrowUp className="h-4 w-4 mr-2" />Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-white">Game Dashboard ({gameCode})</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analytics Panel */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="text-white text-lg">Analytics</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Active Players', value: activeCount, icon: '👥' },
                    { label: 'Eliminated', value: elimCount, icon: '🏆' },
                    { label: 'Total Kills', value: totalKills, icon: '🎯' },
                    { label: 'Game Time', value: formatTime(gameTime), icon: '⏱️' }
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-700/50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-cyan-400 flex items-center justify-center">
                        {item.icon} {item.value}
                      </div>
                      <div className="text-slate-400 text-sm">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="text-white flex items-center">🏆 Leaderboard</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {sorted.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className={`px-2 py-1 text-sm ${i===0?'bg-yellow-500':i===1?'bg-gray-400':i===2?'bg-amber-600':'bg-slate-600'} text-white`}>
                        #{i+1}
                      </Badge>
                      <div>
                        <p className="text-white font-medium">{p.name}</p>
                        <div className="flex space-x-1 mt-1">
                          <span className="text-red-400">♥ {p.lives}</span>
                          <span className="text-cyan-400 ml-2">{p.kills} kills</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader><CardTitle className="text-white flex items-center">📊 Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="text-slate-300 text-sm flex justify-between">
                      <span>{a}</span>
                      <span className="text-slate-500">just now</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Cameras */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 h-full">
              <CardHeader><CardTitle className="text-white flex items-center"><Camera className="h-5 w-5 mr-2" />Player Cameras</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {players.slice(0, 6).map((p) => (
                    <div key={p.id} className="relative">
                      <div className="aspect-video bg-slate-900 rounded-lg border border-slate-600 flex items-center justify-center relative overflow-hidden">
                        <div className="text-center text-slate-500 text-sm">Camera View</div>
                        
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/70 text-cyan-400 text-xs">{p.name}</Badge>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center space-x-1">
                          <span className="text-red-400 text-sm">♥ {p.lives}</span>
                          {p.kills > 0 && <Badge className="bg-yellow-600/80 text-white text-xs">{p.kills}</Badge>}
                        </div>
                        {p.lives === 0 && <div className="absolute inset-0 bg-red-900/50 rounded-lg flex items-center justify-center"><Badge className="bg-red-600 text-white">ELIMINATED</Badge></div>}
                        {p.lives > 0 && <div className="absolute bottom-2 right-2"><div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

