import ml5 from "ml5";

export let classifier = ml5.imageClassifier("MobileNet", () => {});

function gotResult(res: Result[]) {
  return [...res].sort((a, b) => b.confidence - a.confidence);
}

export function classify(img) {
  classifier.classify(img.value, gotResult);
}
