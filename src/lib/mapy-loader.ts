const MAPY_LOADER_URL = "https://api.mapy.cz/loader.js";

let loadPromise: Promise<void> | null = null;

function injectScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${MAPY_LOADER_URL}"]`
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Mapy loader failed to load")), { once: true });
      if (existing.dataset.loaded === "true") {
        resolve();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = MAPY_LOADER_URL;
    script.async = true;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Mapy.cz loader script"));
    document.head.appendChild(script);
  });
}

export function loadMapy(apiKey?: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Mapy.cz loader can only run in the browser"));
  }

  if (loadPromise) return loadPromise;

  loadPromise = injectScript()
    .then(() => {
      if (typeof Loader === "undefined") {
        throw new Error("Mapy.cz Loader global is missing after script load");
      }
      Loader.async = true;
      return new Promise<void>((resolve, reject) => {
        try {
          Loader.load(null, () => resolve(), apiKey);
        } catch (error) {
          reject(error);
        }
      });
    })
    .catch((error) => {
      loadPromise = null; // allow retry
      throw error;
    });

  return loadPromise;
}
