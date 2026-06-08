import ml5 from "ml5";

export let classifier = ml5.imageClassifier("MobileNet", () => {});

export function classify() {
  classifier.classify(img.value, gotResult);
}
