import * as tf from "@tensorflow/tfjs";
import type { DataPoint } from "../../../types";
import { addGaussianNoise, shuffleAndGroupRandomly } from "./training";

export type RegressionDataset = {
  cleanTraining: DataPoint[];
  cleanTest: DataPoint[];
  noisyTraining: DataPoint[];
  noisyTest: DataPoint[];
};

const SAMPLE_COUNT = 100;
const NOISE_VARIANCE = 0.05;

let datasetPromise: Promise<RegressionDataset> | undefined;

const applyYFunction = (x: number): number =>
  0.5 * (x + 0.8) * (x + 1.8) * (x - 0.2) * (x - 0.3) * (x - 1.9) + 1;

const createRegressionDataset = async (): Promise<RegressionDataset> => {
  const xTensor = tf.randomUniform([SAMPLE_COUNT], -2, 2);
  const xValues = Array.from(await xTensor.data());
  xTensor.dispose();

  const cleanData = xValues.map((x) => ({
    x,
    y: applyYFunction(x),
  }));
  const { group1: cleanTraining, group2: cleanTest } =
    shuffleAndGroupRandomly(cleanData);

  const [noisyTraining, noisyTest] = await Promise.all([
    addGaussianNoise(cleanTraining, NOISE_VARIANCE),
    addGaussianNoise(cleanTest, NOISE_VARIANCE),
  ]);

  return {
    cleanTraining,
    cleanTest,
    noisyTraining,
    noisyTest,
  };
};

export const getRegressionDataset = (): Promise<RegressionDataset> => {
  datasetPromise ??= createRegressionDataset();
  return datasetPromise;
};
