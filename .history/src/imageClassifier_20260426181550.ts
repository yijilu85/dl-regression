import ml5 from "ml5";

let classifier: ml5.ImageClassifier;

export async function preload() {
  classifier = ml5.imageClassifier("MobileNet");
}

export { classifier };
