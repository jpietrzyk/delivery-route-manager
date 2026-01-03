declare const Loader: {
  async: boolean;
  load: (config: unknown, onLoad: () => void, apiKey?: string) => void;
};

declare const SMap: any;
declare const JAK: {
  gel: (element: string | HTMLElement) => HTMLElement;
};
