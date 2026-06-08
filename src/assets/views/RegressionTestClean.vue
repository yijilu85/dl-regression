<template>
  <h2 clasS="mt-8">R2: Vorhersage ohne Rauschen</h2>

  <div class="charts-grid">
    <v-card class="pa-4">
      <v-card-title>Trainingsdaten</v-card-title>
      <v-card-text>
        <div ref="cleanTrainDataContainer" class="chart-container" />
      </v-card-text>
    </v-card>

    <v-card class="pa-4">
      <v-card-title>Testdaten</v-card-title>
      <v-card-text>
        <div ref="cleanTestDataContainer" class="chart-container" />
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
  testModel,
} from "../../services/helper/training";

import type { DataPoint } from "../../../types";

const emit = defineEmits<{
  finished: [];
}>();

const NOISE_VARIANCE = 0.05;

const cleanTrainDataContainer = ref<HTMLDivElement | null>(null);
const cleanTestDataContainer = ref<HTMLDivElement | null>(null);

const cleanTestData = ref<DataPoint[]>([]);
const cleanTrainingData = ref<DataPoint[]>([]);
const applyYFunction = (x: number): number =>
  0.5 * (x + 0.8) * (x + 1.8) * (x - 0.2) * (x - 0.3) * (x - 1.9) + 1;

const plot = async (): Promise<void> => {
  if (!cleanTrainDataContainer.value || !cleanTestDataContainer.value) {
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

  const model = createModel(100);
  const tensorTrainingDataOnTraining = convertToTensor(cleanTrainingData.value);

  await trainModel(
    model,
    tensorTrainingDataOnTraining.inputs,
    tensorTrainingDataOnTraining.labels,
    100,
    32,
    "R2 Training ohne Rauschen",
  );

  await testModel(
    model,
    cleanTrainingData.value,
    tensorTrainingDataOnTraining,
    cleanTrainDataContainer.value,
  );

  await testModel(
    model,
    cleanTestData.value,
    tensorTrainingDataOnTraining,
    cleanTestDataContainer.value,
  );

  emit("finished");
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
