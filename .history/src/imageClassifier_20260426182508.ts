import ml5 from "ml5";

type ImageClassifier = {
  classify: (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    callback: (
      error: Error | null,
      results: Array<{ label: string; confidence: number }>,
    ) => void,
  ) => void;
};

let classifierPromise: Promise<ImageClassifier> | null = null;

export function getClassifier(): Promise<ImageClassifier> {
  if (!classifierPromise) {
    classifierPromise = new Promise((resolve, reject) => {
      let classifier: ImageClassifier;

      try {
        classifier = ml5.imageClassifier("MobileNet", () => resolve(classifier));
      } catch (error) {
        classifierPromise = null;
        reject(error);
      }
    });
  }

  return classifierPromise;
}
