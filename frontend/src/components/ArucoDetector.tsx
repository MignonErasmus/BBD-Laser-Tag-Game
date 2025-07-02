import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useScriptLoader } from "@/hooks/useScriptLoader";

interface ArucoDetectorProps {
  onTargetDetected: (markerId: number | null) => void;
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
          console.log("✅ Detector initialized successfully");
        } catch (err) {
          const message = "Failed to initialize detector: " + (err as Error).message;
          setError(message);
        }
      } else {
        if (retryCount < 10) {
          retryCount++;
          setTimeout(tryInitDetector, 200);
        } else {
          setError("❌ AR.Detector or AR.DICTIONARIES not found after retries");
        }
      }
    };

    tryInitDetector();
  }, [cv.loaded, aruco.loaded]);

  useEffect(() => {
    const ready = isLoaded && isCameraReady;
    if (onReadyChange) onReadyChange(ready);
  }, [isLoaded, isCameraReady]);

  useEffect(() => {
    const webcam = webcamRef.current;
    if (!webcam) return;

    const video = webcam.video;
    if (!video) return;

    const handleCanPlay = () => setIsCameraReady(true);
    video.addEventListener("canplay", handleCanPlay);

    if (video.readyState >= 3) {
      setIsCameraReady(true);
    } else {
      const interval = setInterval(() => {
        if (video.readyState >= 3) {
          setIsCameraReady(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => video.removeEventListener("canplay", handleCanPlay);
  }, []);

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
      const width = 640;
      const height = 480;

      canvas.width = width;
      canvas.height = height;
      context.drawImage(video, 0, 0, width, height);
      const imageData = context.getImageData(0, 0, width, height);

      try {
        const markers = detectorRef.current.detect(imageData);
        if (markers.length > 0) {
          const centerX = width / 2;
          const centerY = height / 2;
          let closestMarker = null;
          let minDistance = Infinity;

          for (const marker of markers) {
            let center = marker.center;
            if (!center && marker.corners.length === 4) {
              const sum = marker.corners.reduce(
                (acc: any, c: any) => ({ x: acc.x + c.x, y: acc.y + c.y }),
                { x: 0, y: 0 }
              );
              center = { x: sum.x / 4, y: sum.y / 4 };
              marker.center = center;
            }

            const distance = Math.hypot(center.x - centerX, center.y - centerY);
            if (distance < minDistance) {
              closestMarker = marker;
              minDistance = distance;
            }
          }

          if (closestMarker && minDistance < 100) {
            onTargetDetected(closestMarker.id);
          } else {
            onTargetDetected(null); // Clear if too far
          }
        }
      } catch (err) {
        console.error("Marker detection error", err);
      } 
    }

    animationRef.current = requestAnimationFrame(detectMarkers);
  };

  useEffect(() => {
    if (isLoaded && isCameraReady) {
      animationRef.current = requestAnimationFrame(detectMarkers);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isLoaded, isCameraReady]);

  if (error) return <div className="text-red-500">{error}</div>;

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
        onUserMedia={() => console.log("📷 Camera access granted")}
      />
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-40 h-40 border-4 border-red-500 rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
