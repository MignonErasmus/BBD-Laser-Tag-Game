// src/hooks/useOpenCv.ts
import { useState, useEffect } from 'react';

// Declare the global 'cv' object provided by OpenCV.js
// and the onRuntimeInitialized callback
declare global {
  var cv: any;
  interface Window {
    onRuntimeInitialized: () => void;
  }
}

const OpenCV_URL = '../../public/opencv.js'; // Path relative to your public folders

export const useOpenCv = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if OpenCV.js is already loaded and initialized
    if (typeof cv !== 'undefined' && cv.Mat) {
      console.log("[useOpenCv] OpenCV.js already loaded and initialized. No need to load again.");
      setIsLoaded(true);
      return;
    }

    // 2. Set up the onRuntimeInitialized callback BEFORE loading the script
    // This function will be called by opencv.js when it's fully ready.
    window.onRuntimeInitialized = () => {
      console.log("[useOpenCv] onRuntimeInitialized callback fired! OpenCV.js is fully ready.");
      if (typeof cv !== 'undefined' && cv.Mat) {
        setIsLoaded(true);
        setError(null); // Clear any previous error
      } else {
        // This case indicates a deeper issue with the opencv.js file itself
        setError("onRuntimeInitialized fired, but 'cv' object or cv.Mat still not found. Check opencv.js file.");
        console.error("[useOpenCv] onRuntimeInitialized fired, but 'cv' not ready.");
      }
    };

    // 3. Create a new script element to load opencv.js
    console.log("[useOpenCv] Attempting to load OpenCV.js dynamically...");
    const script = document.createElement('script');
    script.src = OpenCV_URL;
    script.async = true; // Load script asynchronously
    script.id = 'opencv-script'; // Give it an ID to easily check for existence later

    // 4. Define event listeners for script loading errors
    const handleError = (e: Event | string) => {
      setError(`Failed to load OpenCV.js script file: ${e instanceof Event ? e.type : e}`);
      console.error(`[useOpenCv] Failed to load OpenCV.js script element:`, e);
      // Clean up the onRuntimeInitialized if script failed to load
      delete window.onRuntimeInitialized;
    };

    script.addEventListener('error', handleError);

    // 5. Append the script to the document body to start loading
    // Check if script already exists to prevent duplicates if component re-renders
    if (!document.getElementById(script.id)) {
        document.body.appendChild(script);
    } else {
        console.log("[useOpenCv] OpenCV.js script element already exists in DOM.");
    }


    // 6. Cleanup function: runs when the component unmounts
    return () => {
      script.removeEventListener('error', handleError);
      // Clean up the global callback to avoid issues if another instance tries to load
      // However, if OpenCV is truly global, you might not want to delete this.
      // For a component-level load that sets a global, it's a bit tricky.
      // For now, let's keep it simple: if you rely on it for cleanup, you might need to be more careful.
      // For this specific use case, simply setting window.onRuntimeInitialized to an empty function
      // or null/undefined on unmount might be safer than deleting if other parts of the app rely on it.
      // However, usually, it's a one-time global setup.
       delete window.onRuntimeInitialized; // Or window.onRuntimeInitialized = () => {};
       console.log("[useOpenCv] Cleanup: Script error listener removed, onRuntimeInitialized reset.");
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return { isLoaded, error };
};