import { useEffect, useState } from "react";

export const useScriptLoader = (src: string) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    console.log(`Loading script: ${src}`);

    const existingScript = document.querySelector(`script[src="${src}"]`);

    if (existingScript) {
      if ((existingScript as any).dataset.loaded === "true") {
        console.log(`Script already loaded: ${src}`);
        setLoaded(true);
      } else {
        console.log(`Script found but not yet loaded, attaching listeners: ${src}`);
        const onLoad = () => {
          console.log(`Script loaded event: ${src}`);
          setLoaded(true);
        };
        const onError = () => {
          console.error(`Script failed to load: ${src}`);
          setError(`Failed to load script: ${src}`);
        };
        existingScript.addEventListener("load", onLoad);
        existingScript.addEventListener("error", onError);

        return () => {
          existingScript.removeEventListener("load", onLoad);
          existingScript.removeEventListener("error", onError);
        };
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.loaded = "false";

    script.onload = () => {
      console.log(`Script loaded (onload): ${src}`);
      script.dataset.loaded = "true";
      setLoaded(true);
    };

    script.onerror = () => {
      console.error(`Script failed to load (onerror): ${src}`);
      setError(`Failed to load script: ${src}`);
    };

    document.head.appendChild(script);

    // NOTE: No removal on cleanup to avoid flickering reloads

  }, [src]);

  return { loaded, error };
};
