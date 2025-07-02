// Updated GameAnalytics.tsx with badges: John Wick, MVP, First Blood, Demo Dummy

"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/socket";

interface GameAnalyticsProps {
  gameCode: string;
}

interface Player {
  id: string;
  name: string;
  lives: number;
  kills: number;
  markerId: number;
}

export const GameAnalytics = ({ gameCode }: GameAnalyticsProps) => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [firstEliminatedId, setFirstEliminatedId] = useState<string | null>(null);
  const [firstBloodId, setFirstBloodId] = useState<string | null>(null);
  const [mvpId, setMvpId] = useState<string | null>(null);

  useEffect(() => {
    const alivePlayers = players.filter(p => p.lives > 0).length;

    if (alivePlayers > 1 && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }

    if (alivePlayers <= 1 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;

      if (alivePlayers === 1 && !mvpId) {
        const winner = players.find(p => p.lives > 0);
        if (winner) setMvpId(winner.id);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [players, mvpId]);

  useEffect(() => {
    const socket = getSocket();
    socket.emit("watch_game", gameCode);

    socket.on("players_update", (data: Player[]) => {
      const sorted = [...data].sort((a, b) => {
        if (a.lives === 0 && b.lives > 0) return 1;
        if (b.lives === 0 && a.lives > 0) return -1;
        return b.kills - a.kills;
      });

      // First kill (First Blood)
      if (!firstBloodId) {
        const killer = sorted.find(p => p.kills > 0 && !players.find(prev => prev.id === p.id && prev.kills > 0));
        if (killer) setFirstBloodId(killer.id);
      }

      // First death (Demo Dummy)
      if (!firstEliminatedId) {
        const eliminated = sorted.find(p => p.lives === 0 && !players.find(prev => prev.id === p.id && prev.lives === 0));
        if (eliminated) setFirstEliminatedId(eliminated.id);
      }

      setPlayers(sorted);
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
  }, [gameCode, players, firstBloodId, firstEliminatedId]);

  const totalKills = players.reduce((sum, p) => sum + p.kills, 0);
  const activeCount = players.filter(p => p.lives > 0).length;
  const elimCount = players.filter(p => p.lives === 0).length;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const maxKills = Math.max(...players.map(p => p.kills), 0);

  const handleBack = () => navigate("/");

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
                {players.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className={`px-2 py-1 text-sm ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-slate-600'} text-white`}>#{i + 1}</Badge>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-medium">{p.name} #{p.markerId}</p>
                          {p.kills === maxKills && maxKills > 0 && <Badge className="bg-red-600 text-white text-xs">Johnwick</Badge>}
                          {p.id === firstEliminatedId && <Badge className="bg-yellow-700 text-white text-xs">Demo Dummy</Badge>}
                          {p.id === mvpId && <Badge className="bg-green-600 text-white text-xs">MVP</Badge>}
                          {p.id === firstBloodId && <Badge className="bg-pink-700 text-white text-xs">First Blood</Badge>}
                        </div>
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
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 h-full">
              <CardHeader><CardTitle className="text-white flex items-center">📊 Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="text-slate-300 text-sm flex justify-between">
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white flex items-center"><Camera className="h-5 w-5 mr-2" />Player Cameras</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {players.slice(0, 6).map((p) => (
                  <div key={p.id} className="relative">
                    <div className="aspect-video bg-slate-900 rounded-lg border border-slate-600 flex items-center justify-center relative overflow-hidden">
                      <div className="text-center text-slate-500 text-sm">Camera View</div>
                      <div className="absolute top-2 left-2 flex items-center space-x-1">
                        <Badge className="bg-black/70 text-cyan-400 text-xs">{p.name}</Badge>
                        {p.id === firstEliminatedId && <Badge className="bg-yellow-700 text-white text-xs">Demo Dummy</Badge>}
                        {p.kills === maxKills && maxKills > 0 && <Badge className="bg-red-600 text-white text-xs">Johnwick</Badge>}
                        {p.id === mvpId && <Badge className="bg-green-600 text-white text-xs">MVP</Badge>}
                        {p.id === firstBloodId && <Badge className="bg-pink-700 text-white text-xs">First Blood</Badge>}
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
  );
};
