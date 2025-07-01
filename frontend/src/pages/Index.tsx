import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Monitor, Smartphone, Zap, Target, Trophy } from "lucide-react";
import 'styled-jsx/style';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundImage: 'url(/lovable-uploads/b103d67c-fda0-4f10-8a49-f72941457549.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Animated geometric elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-16 h-16 border-2 border-cyan-400 rotate-45 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-12 h-12 border-2 border-purple-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-16 w-20 h-20 border-2 border-green-400 rotate-12 animate-spin"></div>
        <div className="absolute bottom-20 right-20 w-14 h-14 border-2 border-red-400 transform -rotate-45 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-5xl w-full text-center space-y-12 relative z-10">
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Zap className="h-12 w-12 text-cyan-400 animate-pulse" />
            <h1 className="text-7xl font-bold text-white tracking-tight transform hover:scale-105 transition-transform duration-300">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 bg-clip-text text-transparent animate-gradient-x">
                LASER TAG
              </span>
            </h1>
            <Target className="h-12 w-12 text-purple-400 animate-pulse delay-300" />
          </div>
          
          <div className="flex items-center justify-center space-x-2 animate-bounce">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-ping delay-100"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-ping delay-200"></div>
          </div>
          
          <p className="text-2xl text-slate-200 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-300">
            Experience the ultimate laser tag game with real-time multiplayer action and live analytics
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto animate-fade-in-up delay-500">
          <Card className="bg-slate-900/80 border-cyan-400/50 hover:border-cyan-400 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-400/20 group backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <Monitor className="mx-auto h-16 w-16 text-cyan-400 mb-4 group-hover:animate-pulse transition-all duration-300" />
                <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <CardTitle className="text-white text-2xl group-hover:text-cyan-400 transition-colors duration-300">Dashboard</CardTitle>
              <CardDescription className="text-slate-400 text-lg">
                Create lobbies, manage games, and view real-time analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/dashboard')} 
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold py-4 text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-400/50"
              >
                <Monitor className="h-5 w-5 mr-2" />
                Open Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/80 border-purple-400/50 hover:border-purple-400 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-400/20 group backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <Smartphone className="mx-auto h-16 w-16 text-purple-400 mb-4 group-hover:animate-pulse transition-all duration-300" />
                <div className="absolute inset-0 bg-purple-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <CardTitle className="text-white text-2xl group-hover:text-purple-400 transition-colors duration-300">Player</CardTitle>
              <CardDescription className="text-slate-400 text-lg">
                Join a game session and start playing laser tag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/player')} 
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold py-4 text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-400/50"
              >
                <Smartphone className="h-5 w-5 mr-2" />
                Join Game
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 p-8 bg-slate-900/70 rounded-2xl border border-slate-600/50 backdrop-blur-md animate-fade-in-up delay-700 hover:bg-slate-900/80 transition-all duration-300">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="h-8 w-8 text-yellow-400 mr-3 animate-pulse" />
            <h3 className="text-2xl font-bold text-white">How to Play</h3>
            <Trophy className="h-8 w-8 text-yellow-400 ml-3 animate-pulse delay-300" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-slate-300">
            <div className="text-center p-6 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 group">
              <div className="text-6xl font-bold text-cyan-400 mb-3 group-hover:animate-pulse">1</div>
              <span className="text-cyan-400 font-bold text-xl block mb-2">Create Lobby</span>
              <p className="text-base leading-relaxed">Use the dashboard to create a new game lobby and get your code</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 group">
              <div className="text-6xl font-bold text-purple-400 mb-3 group-hover:animate-pulse">2</div>
              <span className="text-purple-400 font-bold text-xl block mb-2">Join Game</span>
              <p className="text-base leading-relaxed">Players enter the code on their devices to join the session</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 group">
              <div className="text-6xl font-bold text-green-400 mb-3 group-hover:animate-pulse">3</div>
              <span className="text-green-400 font-bold text-xl block mb-2">Battle!</span>
              <p className="text-base leading-relaxed">Start the game and compete in real-time laser tag action</p>
            </div>
          </div>
        </div>
      </div>

      {/* <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-700 { animation-delay: 700ms; }
      `}</style> */}
    </div>
  );
};

export default Index;
