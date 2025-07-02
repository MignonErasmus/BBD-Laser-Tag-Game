// src/components/PlayerGame.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";
// Assuming react-router-dom for navigation. If not, remove or replace.
import { useNavigate } from "react-router-dom"; 
import { detectShapes } from "./ShapeDetector";
import { useOpenCv } from "@/hooks/useOpenCv"; // Import the custom hook

// #TODO: NEED TO REMOVE THE simulation code
// 🧐 Simple interface for testing
interface PlayerGameProps {
    playerName: string;
    gameCode: string;
}

export const PlayerGame = ({ playerName, gameCode }: PlayerGameProps) => {
    const navigate = useNavigate();

    // Camera setup
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraError, setCameraError] = useState<string | null>(null); // Renamed for clarity
    
    // Load OpenCV.js using the custom hook
    const { isLoaded: openCvLoaded, error: openCvLoadingError } = useOpenCv();

    // 🧐 Similation setup
    const [health, setHealth] = useState(3);
    const [kills, setKills] = useState(0);
    const [isEliminated, setIsEliminated] = useState(false);
    const [lastShot, setLastShot] = useState(0);
    const [gameTime, setGameTime] = useState(0);

    /// ***** useEffect *****
    useEffect(() => {
        // Log the OpenCV loading status from the hook
        console.log(`[PlayerGame Effect] OpenCV Loaded: ${openCvLoaded}, Loading Error: ${openCvLoadingError}`);

        // If OpenCV is not loaded yet, or there was an error loading it,
        // we should not proceed with camera and shape detection setup.
        if (!openCvLoaded) {
            if (openCvLoadingError) {
                setCameraError(`OpenCV.js loading failed: ${openCvLoadingError}`);
                console.error("[PlayerGame Effect] Stopping due to OpenCV.js loading error.");
            } else {
                console.log("[PlayerGame Effect] Waiting for OpenCV.js to load...");
            }
            return; 
        }

        // --- OpenCV is confirmed loaded, proceed with camera and detection ---
        console.log("[PlayerGame Effect] OpenCV.js is ready. Starting camera and detection setup.");

        // 🎥 Camera Access
        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }, /// user back camera of phone
                    audio: false, // audio off
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // play current, ensure metadata is loaded before drawing to canvas
                    await videoRef.current.play(); 
                    console.log("[PlayerGame Effect] Camera stream started and playing.");
                }
            } catch (err: any) {
                console.error("[PlayerGame Effect] Camera access error:", err);
                setCameraError(err.message || "Unable to access camera. Please check permissions.");
            }
        };

        // Shape detection interval
        let detectionInterval: NodeJS.Timeout;
        if (openCvLoaded) { // Only set up interval if OpenCV is loaded
             detectionInterval = setInterval(() => {
                // Ensure video is ready and canvas ref exists
                if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
                    const video = videoRef.current;
                    const canvas = canvasRef.current;
                    const context = canvas.getContext('2d');

                    if (context) {
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        detectShapes(canvas); // Call the detection function
                    } else {
                        console.warn("[PlayerGame Effect] Canvas 2D context not available.");
                    }
                } else if (videoRef.current && videoRef.current.readyState < 4) {
                    console.log("[PlayerGame Effect] Video not yet ready for capture (readyState:", videoRef.current.readyState, ")");
                }
            }, 100); // Run detection every 100ms
        }


        /// Start camera only if OpenCV is loaded
        startCamera();

        // 🧐 Game Timer
        const timer = setInterval(() => {
            setGameTime((prev) => prev + 1);
        }, 1000);

        // 🧐 Damage Simulator (testing only)
        const damageSimulator = setInterval(() => {
            if (Math.random() < 0.2 && health > 0) {
                setHealth((prev) => {
                    const newHealth = prev - 1;
                    if (newHealth <= 0) {
                        setIsEliminated(true);
                    }
                    return newHealth;
                });
            }
        }, 5000);

        // 🧐 Cleanup
        return () => {
            clearInterval(detectionInterval); // Clear detection interval
            clearInterval(timer);
            clearInterval(damageSimulator);

            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop());
                console.log("[PlayerGame Effect] Camera stream stopped during cleanup.");
            }
            console.log("[PlayerGame Effect] Effect cleanup finished.");
        };
    }, [openCvLoaded, openCvLoadingError, health]); // Add OpenCV loading state to dependencies

    const handleShoot = () => {
        if (isEliminated) return;

        const now = Date.now();
        if (now - lastShot < 1000) return;

        setLastShot(now);

        if (Math.random() < 0.6) {
            setKills((prev) => prev + 1);
            console.log(`${playerName} scored a kill!`);
        }
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    // check if the player is eliminated then show them that they are
    if (isEliminated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-900 flex items-center justify-center p-4">
                <Card className="bg-red-900/50 border-red-700 max-w-md mx-auto">
                    <CardContent className="p-6 text-center">
                        <h2 className="text-3xl font-bold text-red-400 mb-4">ELIMINATED</h2>
                        <p className="text-white mb-2">Better luck next time, {playerName}!</p>
                        <div className="space-y-2 text-slate-300">
                            <p>Final Stats:</p>
                            <p>Kills: <span className="text-green-400 font-bold">{kills}</span></p>
                            <p>Survival Time: <span className="text-cyan-400 font-bold">{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</span></p>
                        </div>
                        <Button onClick={handleBackToHome} className="mt-4 bg-slate-700 hover:bg-slate-600">
                            Back to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    } 

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-900 relative overflow-hidden">
            {/* Display loading/error messages */}
            {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-xl z-20">
                    Error: {cameraError}
                </div>
            )}
            {!cameraError && !openCvLoaded && ( // Show loading only if no camera error and OpenCV is not loaded
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-xl z-20">
                    Loading OpenCV.js...
                </div>
            )}

            {/* 🔴 Camera Video Feed and Canvas for Shape Detection - Render only when ready */}
            {!cameraError && openCvLoaded && (
                <>
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full object-contain"
                    />
                </>
            )}

            {/* Top UI Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="outline"
                        onClick={handleBackToHome}
                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                    >
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Back to Home
                    </Button> {/*Back home*/}
                    <div className="text-cyan-400 font-bold text-lg">{playerName}</div>
                </div>

                <div className="flex items-center space-x-6">
                    {/* Healthbar displayed here */}
                    <div className="flex space-x-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <span
                                key={i}
                                className={`text-2xl ${i < health ? 'text-red-500' : 'text-slate-600'}`}
                            >
                                ♥
                            </span>
                        ))}
                    </div>

                    {/* Number of kills displayed here */}
                    <div className="bg-slate-900/80 px-4 py-2 rounded border border-cyan-400">
                        <span className="text-yellow-400 font-bold text-xl">{kills}</span>
                        <div className="text-xs text-cyan-400">KILLS</div>
                    </div>
                </div>
            </div>

            {/* Crosshair Targeting System */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Lines */}
                <div className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-60"></div>
                <div className="absolute h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"></div>

                <div className="relative">
                    <div className="w-32 h-32 border-2 border-cyan-400 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-cyan-400 rounded-full relative">
                            <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping"></div>
                        </div>
                    </div>

                    <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 text-center">
                        <div className="text-cyan-400 font-semibold">Camera Scanner Active</div>
                        <div className="text-slate-400 text-sm">Point at targets to scan</div>
                    </div>
                </div>
            </div>

            {/* Bottom Fire Button */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <Button
                    onClick={handleShoot}
                    disabled={Date.now() - lastShot < 1000}
                    className="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-4 border-red-300 shadow-lg shadow-red-500/50"
                >
                    <div className="text-center">
                        <div className="w-3 h-3 bg-white rounded-full mx-auto mb-1"></div>
                        <div className="text-xs font-bold text-white">FIRE</div>
                    </div>
                </Button> {/* shoot button that is disabled like every 1 second */}
            </div>

            {/* Decorative Corner Elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400"></div>
        </div>
    );
};