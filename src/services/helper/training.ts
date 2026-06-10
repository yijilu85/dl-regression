import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import type { DataPoint } from "../../../types";

export type NormalizationData = {
  inputMax: tf.Scalar;
  inputMin: tf.Scalar;
};

export type TensorData = NormalizationData & {
  inputs: tf.Tensor2D;
  labels: tf.Tensor2D;
};

export const createModel = (units: number): tf.Sequential => {
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

  model.add(tf.layers.dense({ units: 1, activation: "linear" }));

  return model;
};

export const shuffleAndGroupRandomly = (input: DataPoint[]) => {
  const shuffled = [...input];
  tf.util.shuffle(shuffled);

  return {
    group1: shuffled.slice(0, 50),
    group2: shuffled.slice(50),
  };
};

export const convertToTensor = (
  data: DataPoint[],
  normalizationData?: NormalizationData,
): TensorData => {
  return tf.tidy(() => {
    const shuffled = [...data];
    tf.util.shuffle(shuffled);

    const inputs = shuffled.map((d) => d.x);
    const labels = shuffled.map((d) => d.y);

    const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    const inputMax =
      normalizationData?.inputMax ?? (inputTensor.max() as tf.Scalar);
    const inputMin =
      normalizationData?.inputMin ?? (inputTensor.min() as tf.Scalar);

    const normalizedInputs = inputTensor
      .sub(inputMin)
      .div(inputMax.sub(inputMin)) as tf.Tensor2D;

    return {
      inputs: normalizedInputs,
      labels: labelTensor,
      inputMax,
      inputMin,
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
  chartName: string,
  compileModel = true,
) => {
  if (compileModel) {
    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: tf.losses.meanSquaredError,
    });
  }

  const visor = tfvis.visor();
  const surface = visor.surface({
    name: chartName,
    tab: "Training",
    styles: { height: "350px" },
  });
  visor.setActiveTab("Training");

  const moveSurfaceToTop = () => {
    const surfacesContainer = surface.container.parentElement;

    if (surfacesContainer?.firstElementChild !== surface.container) {
      surfacesContainer?.prepend(surface.container);
    }
  };

  const fitCallbacks = tfvis.show.fitCallbacks(surface, ["loss"], {
    height: 200,
    callbacks: ["onEpochEnd"],
  });

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      moveSurfaceToTop();
      resolve();
    });
  });

  return model.fit(inputs, labels, {
    batchSize,
    epochs,
    shuffle: true,
    callbacks: {
      onEpochEnd: async (epoch, logs) => {
        if (logs) {
          await fitCallbacks.onEpochEnd(epoch, logs);
        }

        moveSurfaceToTop();
      },
    },
  });
};

export const testModel = (
  model: tf.Sequential,
  inputData: DataPoint[],
  normalizationData: NormalizationData,
  container: HTMLDivElement | null,
): Promise<void> => {
  if (!container || !container.isConnected) {
    return Promise.resolve();
  }

  const { inputMax, inputMin } = normalizationData;

  const [xs, preds] = tf.tidy(() => {
    const xsNorm = tf.linspace(0, 1, 100);
    const predictions = model.predict(xsNorm.reshape([100, 1])) as tf.Tensor2D;

    const unNormXs = xsNorm.mul(inputMax.sub(inputMin)).add(inputMin);

    return [unNormXs.dataSync(), predictions.dataSync()];
  });

  const predictedPoints = Array.from(xs).map((val, i) => {
    return { x: val, y: preds[i] };
  });

  const originalPoints = inputData.map((d) => ({
    x: d.x,
    y: d.y,
  }));

  return tfvis.render.scatterplot(
    { drawArea: container },
    {
      values: [originalPoints, predictedPoints],
      series: ["original", "predicted"],
    },
    {
      xLabel: "x",
      yLabel: "y",
      height: 400,
    },
  );
};

export const evaluateModel = (
  model: tf.Sequential,
  data: DataPoint[],
  normalizationData: NormalizationData,
): number => {
  return tf.tidy(() => {
    const normalizedInputs = tf
      .tensor2d(
        data.map((point) => point.x),
        [data.length, 1],
      )
      .sub(normalizationData.inputMin)
      .div(
        normalizationData.inputMax.sub(normalizationData.inputMin),
      ) as tf.Tensor2D;
    const predictions = model.predict(normalizedInputs) as tf.Tensor2D;
    const labels = tf.tensor2d(
      data.map((point) => point.y),
      [data.length, 1],
    );

    return tf.losses.meanSquaredError(labels, predictions).mean().dataSync()[0];
  });
};
