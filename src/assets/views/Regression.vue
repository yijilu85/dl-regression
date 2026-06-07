<template>
  <div class="charts-grid">
    <v-card class="pa-4">
      <v-card-title>Ohne Rauschen</v-card-title>
      <v-card-text>
        <div ref="cleanChartContainer" class="chart-container" />
      </v-card-text>
    </v-card>

    <v-card class="pa-4">
      <v-card-title>Mit Rauschen</v-card-title>
      <v-card-text>
        <div ref="noisyChartContainer" class="chart-container" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import * as tf from "@tensorflow/tfjs";
import * as tfvis from "@tensorflow/tfjs-vis";
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  shuffleAndGroupRandomly,
  convertToTensor,
  createModel,
  trainModel,
  addGaussianNoise,
} from "../../services/helper/training";

import type { DataPoint } from "../../../../regression-training-app/types";

const NOISE_VARIANCE = 0.05;

const cleanChartContainer = ref<HTMLDivElement | null>(null);
const noisyChartContainer = ref<HTMLDivElement | null>(null);

const cleanTestData = ref<DataPoint[]>([]);
const cleanTrainingData = ref<DataPoint[]>([]);
const noisyTestData = ref<DataPoint[]>([]);
const noisyTrainingData = ref<DataPoint[]>([]);

const applyYFunction = (x: number): number =>
  0.5 * (x + 0.8) * (x + 1.8) * (x - 0.2) * (x - 0.3) * (x - 1.9) + 1;

const plot = async (): Promise<void> => {
  if (!cleanChartContainer.value || !noisyChartContainer.value) {
    return;
  }

  const xTensor = tf.randomUniform([100], -2, 2);
  const xValues = Array.from(await xTensor.data());
  xTensor.dispose();

  const values = xValues.map((x) => ({
    x,
    y: applyYFunction(x),
  }));

  const shuffled = shuffleAndGroupRandomly(values);

  cleanTrainingData.value = shuffled.group1;
  cleanTestData.value = shuffled.group2;
  noisyTrainingData.value = await addGaussianNoise(
    cleanTrainingData.value,
    NOISE_VARIANCE,
  );
  noisyTestData.value = await addGaussianNoise(
    cleanTestData.value,
    NOISE_VARIANCE,
  );

  const model = createModel(100);
  const tensorTrainingData = convertToTensor(cleanTrainingData.value);

  await trainModel(
    model,
    tensorTrainingData.inputs,
    tensorTrainingData.labels,
    100,
    32,
  );

  await tfvis.render.scatterplot(
    cleanChartContainer.value,
    {
      values: [cleanTestData.value, cleanTrainingData.value],
      series: ["Test", "Training"],
    },
    {
      xLabel: "x",
      yLabel: "y",
      height: 450,
      width: 400,
      zoomToFit: true,
    },
  );

  await tfvis.render.scatterplot(
    noisyChartContainer.value,
    {
      values: [noisyTestData.value, noisyTrainingData.value],
      series: ["Test", "Training"],
    },
    {
      xLabel: "x",
      yLabel: "y",
      height: 450,
      width: 400,
      zoomToFit: true,
    },
  );
};

onMounted(plot);
</script>

<style scoped>
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.chart-container {
  width: 100%;
  min-height: 450px;
}

.chart-container :deep([aria-roledescription="legend"]) {
  display: none;
}

@media (max-width: 800px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
