import ml5 from "ml5";

let classifier: any;

export async function preload() {
  classifier = ml5.imageClassifier("MobileNet");
}

export { classifier };
