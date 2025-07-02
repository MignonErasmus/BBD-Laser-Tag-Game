// src/hooks/useScriptLoader.ts
import { useEffect, useState } from "react";

export const useScriptLoader = (src: string) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    
    if (existingScript) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    
    script.onload = () => {
      console.log(`Script loaded: ${src}`);
      setLoaded(true);
    };
    
    script.onerror = () => {
      console.error(`Failed to load script: ${src}`);
      setError(`Failed to load script: ${src}`);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [src]);

  return { loaded, error };
};