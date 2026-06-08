import ml5 from "ml5";

export let classifier = ml5.imageClassifier("MobileNet", () => {});

export function classify(img) {
  classifier.classify(img.value, gotResult);
}

function gotResult(res: Result[]) {
  results.value = [...res].sort((a, b) => b.confidence - a.confidence);
}
