let loadPromise: Promise<typeof H | null> | null = null;

function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), { once: true });
      if (existing.dataset.loaded === "true") {
        resolve();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export async function loadHere(apiKey: string): Promise<typeof H | null> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("HERE loader can only run in the browser"));
  }
  if (loadPromise) return loadPromise;

  const base = "https://js.api.here.com/v3/3.1";
  const scripts = [
    `${base}/mapsjs-core.js`,
    `${base}/mapsjs-service.js`,
    `${base}/mapsjs-mapevents.js`,
    `${base}/mapsjs-ui.js`,
  ];
  const styles = `${base}/mapsjs-ui.css`;

  // inject CSS
  if (!document.querySelector(`link[href="${styles}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = styles;
    document.head.appendChild(link);
  }

  loadPromise = (async () => {
    for (const s of scripts) {
      await injectScript(s);
    }
    if (typeof window.H === "undefined") {
      throw new Error("HERE global H is missing after script load");
    }
    // Validate API key existence by creating a dummy platform
    try {
      const platform = new window.H.service.Platform({ apikey: apiKey });
      void platform; // no-op
    } catch (e) {
      console.warn("HERE Platform init failed; will attempt during map init", e);
    }
    return window.H;
  })();

  return loadPromise;
}
