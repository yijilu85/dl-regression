import ml5 from "ml5";

type Ml5Classifier = {
  classify: (
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    callback: (error: Error | null, results: Array<{ label: string; confidence: number }>) => void,
  ) => void;
};

let classifierPromise: Promise<Ml5Classifier> | null = null;

export const getSharedImageClassifier = (): Promise<Ml5Classifier> => {
  if (!classifierPromise) {
    classifierPromise = new Promise((resolve, reject) => {
      let classifier: Ml5Classifier;

      try {
        classifier = ml5.imageClassifier("MobileNet", () => resolve(classifier));
      } catch (error) {
        classifierPromise = null;
        reject(error);
      }
    });
  }

  return classifierPromise;
};
