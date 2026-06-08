import ml5 from "ml5";

export async function preload() {}
export const classifier = ml5.imageClassifier("MobileNet", () => {});
