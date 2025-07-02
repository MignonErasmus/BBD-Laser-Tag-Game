import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useScriptLoader } from "@/hooks/useScriptLoader";

interface ArucoDetectorProps {
  onTargetDetected: (markerId: number) => void;
  onReadyChange?: (ready: boolean) => void;
}

export const ArucoDetector = ({
  onTargetDetected,
  onReadyChange,
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

  // Log when scripts load or fail
  useEffect(() => {
    console.log("cv loaded?", cv.loaded);
    console.log("aruco loaded?", aruco.loaded);
    console.log("cv error?", cv.error);
    console.log("aruco error?", aruco.error);
    console.log("window.AR after scripts load:", (window as any).AR);
    console.log("window.AR.Detector:", (window as any).AR?.Detector);
  }, [cv.loaded, aruco.loaded]);

  // Notify parent of readiness
  useEffect(() => {
    const ready = isLoaded && isCameraReady;
    if (onReadyChange) {
      onReadyChange(ready);
      console.log("Ready state changed:", ready);
    }
  }, [isLoaded, isCameraReady]);

  // Detector initialization
  useEffect(() => {
    if (!cv.loaded || !aruco.loaded) return;

    let retryCount = 0;

    const tryInitDetector = () => {
      const AR = (window as any).AR;
      if (AR?.Detector && AR?.DICTIONARIES) {
        try {
          detectorRef.current = new AR.Detector({
            dictionary: AR.DICTIONARIES.ARUCO_MIP_36H12,
            minMarkerPerimeter: 0.15,
            maxMarkerPerimeter: 0.9,
            sizeAfterPerspectiveRemoval: 70,
          });
          setIsLoaded(true);
          console.log(" Detector initialized successfully with ARUCO_MIP_36H12");
        } catch (err) {
          const message = "Failed to initialize detector: " + (err as Error).message;
          setError(message);
          console.error(message);
        }
      } else {
        if (retryCount < 10) {
          retryCount++;
          console.warn(` AR.Detector not ready yet, retrying (${retryCount})...`);
          setTimeout(tryInitDetector, 200);
        } else {
          const message = " AR.Detector or AR.DICTIONARIES not found after retries";
          setError(message);
          console.error(message);
        }
      }
    };

    tryInitDetector();
  }, [cv.loaded, aruco.loaded]);

  // More robust camera readiness detection
  useEffect(() => {
    let pollCount = 0;
    const pollInterval = setInterval(() => {
      const webcam = webcamRef.current;
      const video = webcam?.video;

      if (!video) {
        console.log("Polling: waiting for webcam/video element...");
        return;
      }

      if (video.readyState >= 3) {
        console.log(" Camera is ready (video.readyState >= 3)");
        setIsCameraReady(true);
        clearInterval(pollInterval);
      } else {
        console.log(`Polling video.readyState: ${video.readyState}`);
      }

      if (++pollCount > 20) {
        console.warn(" Camera did not become ready after 20 tries");
        clearInterval(pollInterval);
      }
    }, 200);

    return () => clearInterval(pollInterval);
  }, []);

  // Marker detection loop
  const detectMarkers = () => {
    if (
      !isLoaded ||
      !isCameraReady ||
      !webcamRef.current ||
      !canvasRef.current ||
      !detectorRef.current
    ) {
      animationRef.current = requestAnimationFrame(detectMarkers);
      return;
    }

    const video = webcamRef.current.video;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (video && context && video.readyState >= 3) {
      try {
        const scaledWidth = 640;
        const scaledHeight = 480;

        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        context.drawImage(video, 0, 0, scaledWidth, scaledHeight);
        const imageData = context.getImageData(0, 0, scaledWidth, scaledHeight);

        const markers = detectorRef.current.detect(imageData);
        console.log(" Markers detected:", markers);

        if (markers.length > 0) {
          const centerX = scaledWidth / 2;
          const centerY = scaledHeight / 2;
          let closestMarker = null;
          let minDistance = Infinity;

          for (const marker of markers) {
            let center = marker.center;
            if (!center) {
              const corners = marker.corners;
              if (corners?.length === 4) {
                const sum = corners.reduce(
                  (acc: { x: number; y: number }, corner: { x: number; y: number }) => ({
                    x: acc.x + corner.x,
                    y: acc.y + corner.y,
                  }),
                  { x: 0, y: 0 }
                );
                center = {
                  x: sum.x / 4,
                  y: sum.y / 4,
                };
                marker.center = center;
              } else {
                continue;
              }
            }

            const distance = Math.hypot(center.x - centerX, center.y - centerY);

            if (distance < minDistance) {
              minDistance = distance;
              closestMarker = marker;
            }
          }

          if (closestMarker && minDistance < 100) {
            console.log(
              ` Closest marker id: ${closestMarker.id} at distance ${minDistance}`
            );
            onTargetDetected(closestMarker.id);
          }
        }
      } catch (err) {
        console.error(" Marker detection error:", err);
      }
    }

    animationRef.current = requestAnimationFrame(detectMarkers);
  };

  // Start detection loop only when ready
  useEffect(() => {
    console.log(" Starting detection loop:", { isLoaded, isCameraReady });
    if (isLoaded && isCameraReady) {
      animationRef.current = requestAnimationFrame(detectMarkers);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        console.log(" Cancelled marker detection loop");
      }
    };
  }, [isLoaded, isCameraReady]);

  // UI States
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

  // Main Detector UI
  return (
    <div className="relative w-full h-full">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 },
        }}
        className="absolute inset-0 w-full h-full object-cover"
        onUserMedia={() => console.log("Camera access granted")}
        onUserMediaError={(err) => console.error(" Camera error:", err)}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "none" }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 border-4 border-red-500 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
