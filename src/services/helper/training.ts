import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import type { DataPoint } from "../../../../regression-training-app/types";

export const createModel = (units: number) => {
  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      inputShape: [1],
      units: units,
      activation: "relu",
      useBias: true,
    }),
  );

  model.add(
    tf.layers.dense({
      units: units,
      activation: "relu",
      useBias: true,
    }),
  );

  model.add(tf.layers.dense({ units: 1 }));

  return model;
};

export const shuffleAndGroupRandomly = (input: DataPoint[]) => {
  const shuffled = [...input].sort(() => Math.random() - 0.5);
  return {
    group1: shuffled.slice(0, 50),
    group2: shuffled.slice(50),
  };
};

export const convertToTensor = (data: DataPoint[]) => {
  return tf.tidy(() => {
    tf.util.shuffle(data);

    const inputs = data.map((d) => d.x);
    const labels = data.map((d) => d.y);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    const inputMax = inputTensor.max();
    const inputMin = inputTensor.min();
    const labelMax = labelTensor.max();
    const labelMin = labelTensor.min();

    const normalizedInputs = inputTensor
      .sub(inputMin)
      .div(inputMax.sub(inputMin));
    const normalizedLabels = labelTensor
      .sub(labelMin)
      .div(labelMax.sub(labelMin));

    return {
      inputs: normalizedInputs,
      labels: normalizedLabels,
      inputMax,
      inputMin,
      labelMax,
      labelMin,
    };
  });
};

export const addGaussianNoise = async (
  input: DataPoint[],
  variance: number,
): Promise<DataPoint[]> => {
  const standardDeviation = Math.sqrt(variance);
  const noiseTensor = tf.randomNormal([input.length], 0, standardDeviation);
  const noiseValues = Array.from(await noiseTensor.data());
  noiseTensor.dispose();

  return input.map(({ x, y }, index) => ({
    x,
    y: y + noiseValues[index],
  }));
};

export const trainModel = async (
  model: tf.Sequential,
  inputs: tf.Tensor<tf.Rank>,
  labels: tf.Tensor<tf.Rank>,
  epochs: number,
  batchSize: number,
) => {
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: tf.losses.meanSquaredError,
    metrics: ["mse"],
  });

  return model.fit(inputs, labels, {
    batchSize: batchSize,
    epochs,
    shuffle: true,
    callbacks: tfvis.show.fitCallbacks(
      { name: "Training Performance" },
      ["loss", "mse"],
      {
        height: 300,
        callbacks: ["onEpochEnd"],
      },
    ),
  });
};

export const testModel = (
  model: tf.Sequential,
  inputData: any,
  normalizationData: any,
) => {
  const { inputMax, inputMin, labelMin, labelMax } = normalizationData;

  const [xs, preds] = tf.tidy(() => {
    const xsNorm = tf.linspace(0, 1, 100);
    const predictions = model.predict(xsNorm.reshape([100, 1]));

    const unNormXs = xsNorm.mul(inputMax.sub(inputMin)).add(inputMin);

    const unNormPreds = predictions.mul(labelMax.sub(labelMin)).add(labelMin);

    // Un-normalize the data
    return [unNormXs.dataSync(), unNormPreds.dataSync()];
  });

  const predictedPoints = Array.from(xs).map((val, i) => {
    return { x: val, y: preds[i] };
  });

  const originalPoints = inputData.map((d) => ({
    x: d.x,
    y: d.y,
  }));

  tfvis.render.scatterplot(
    { name: "Model Predictions vs Original Data" },
    {
      values: [originalPoints, predictedPoints],
      series: ["original", "predicted"],
    },
    {
      xLabel: "Horsepower",
      yLabel: "MPG",
      height: 300,
    },
  );
};
