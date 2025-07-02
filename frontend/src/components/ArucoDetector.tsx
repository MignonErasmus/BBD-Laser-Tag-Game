import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useScriptLoader } from "@/hooks/useScriptLoader";

interface ArucoDetectorProps {
  onTargetDetected: (markerId: number) => void;
  onReadyChange?: (ready: boolean) => void;
}

export const ArucoDetector = ({ 
  onTargetDetected,
  onReadyChange 
}: ArucoDetectorProps) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<any>(null);
  const animationRef = useRef<number>(0);
 
  const cv = useScriptLoader(`/libs/cv.js`);
  const aruco = useScriptLoader(`/libs/aruco.js`);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Report ready state to parent
  useEffect(() => {
    if (onReadyChange) {
      onReadyChange(isLoaded && isCameraReady);
    }
  }, [isLoaded, isCameraReady, onReadyChange]);

  // Initialize detector when libraries are loaded
  useEffect(() => {
    if (cv.loaded && aruco.loaded && window.AR && window.AR.Detector) {
      try {
        detectorRef.current = new window.AR.Detector({
          minMarkerPerimeter: 0.15,   // Relative to image size
          maxMarkerPerimeter: 0.9,    // Relative to image size
          sizeAfterPerspectiveRemoval: 70, // Pixels
        });
        setIsLoaded(true);
        console.log("Detector initialized with default dictionary");
      } catch (err) {
        setError("Failed to initialize detector: " + (err as Error).message);
      }
    } else if (cv.error || aruco.error) {
      setError(cv.error || aruco.error);
    }
  }, [cv.loaded, aruco.loaded, cv.error, aruco.error]);

  // Handle camera stream
  useEffect(() => {
    if (!webcamRef.current) return;
    
    const video = webcamRef.current.video;
    if (!video) return;

    const handleCanPlay = () => {
      setIsCameraReady(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    
    return () => {
      if (video) video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const detectMarkers = () => {
    if (!isLoaded || !isCameraReady || !webcamRef.current || !canvasRef.current || !detectorRef.current) {
      animationRef.current = requestAnimationFrame(detectMarkers);
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (video && context && video.readyState === 4) {
      try {
        // Scale down image for better performance
        const scaledWidth = 640;
        const scaledHeight = 480;
        
        // Set canvas dimensions
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        
        // Draw video frame scaled down
        context.drawImage(video, 0, 0, scaledWidth, scaledHeight);
        
        // Get image data
        const imageData = context.getImageData(0, 0, scaledWidth, scaledHeight);
        
        // Detect markers
        const markers = detectorRef.current.detect(imageData);
        
        // Find marker closest to center
        if (markers.length > 0) {
          const centerX = scaledWidth / 2;
          const centerY = scaledHeight / 2;
          let closestMarker = markers[0];
          let minDistance = Infinity;

          for (const marker of markers) {
            const center = marker.center;
            const distance = Math.sqrt(
              Math.pow(center.x - centerX, 2) + 
              Math.pow(center.y - centerY, 2)
            );

            if (distance < minDistance) {
              minDistance = distance;
              closestMarker = marker;
            }
          }
          
          // Report marker if close to center
          if (minDistance < 100) {
            onTargetDetected(closestMarker.id);
          }
        }
      } catch (err) {
        console.error("Marker detection error:", err);
      }
    }

    animationRef.current = requestAnimationFrame(detectMarkers);
  };

  useEffect(() => {
    if (isLoaded && isCameraReady) {
      animationRef.current = requestAnimationFrame(detectMarkers);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isLoaded, isCameraReady]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/50 text-red-200 p-4">
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (!cv.loaded || !aruco.loaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-300 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p>Loading scanner libraries...</p>
        <p className="text-sm mt-2">This may take a moment</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-300">
        <p>Initializing scanner...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ 
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }}
        className="absolute inset-0 w-full h-full object-cover"
        onUserMedia={() => console.log("Camera access granted")}
        onUserMediaError={(err) => console.error("Camera error:", err)}
      />
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
        style={{ display: 'none' }}
      />
      
      {/* Targeting UI */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 border-4 border-red-500 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};