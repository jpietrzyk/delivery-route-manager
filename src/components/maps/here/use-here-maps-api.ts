import { useEffect, useState } from "react";

export function useHereMapsApi() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const [H, setH] = useState<any>(null);

  useEffect(() => {
    let tries = 0;
    const maxTries = 30; // 3 seconds
    const interval = setInterval(() => {
      // @ts-ignore
      if (window.H) {
        // @ts-ignore
        setH(window.H);
        setLoaded(true);
        clearInterval(interval);
      } else if (++tries >= maxTries) {
        setError("HERE Maps API failed to load (not found on window.H after waiting)");
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return { loaded, error, H };
}
