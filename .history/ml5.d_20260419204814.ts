declare module 'ml5' {
  function imageClassifier(model: string, callback?: () => void): {
    classify: (
      input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
      callback: (error: Error | null, results: Array<{ label: string; confidence: number }>) => void
    ) => void;
  };
}