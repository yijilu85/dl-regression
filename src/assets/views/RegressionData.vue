<template>
  <h2>R1: Datensätze</h2>
  <v-card class="parameter-card mt-4 pa-4 mb-4">
    <v-card-title>Parameter der Datenerzeugung</v-card-title>
    <v-card-text class="parameter-grid">
      <span><strong>Datenpunkte:</strong> 100</span>
      <span><strong>Aufteilung:</strong> 50 Training / 50 Test</span>
      <span><strong>x-Verteilung:</strong> gleichverteilt in [-2, 2]</span>
      <span><strong>Rauschverteilung:</strong> normalverteilt</span>
      <span><strong>Mittelwert des Rauschens:</strong> 0</span>
      <span><strong>Varianz:</strong> 0,05</span>
      <span><strong>Standardabweichung:</strong> √0,05 ≈ 0,2236</span>
      <span><strong>Verrauschte Größe:</strong> nur y (Label)</span>
    </v-card-text>
  </v-card>
  <div class="charts-grid">
    <v-card class="pa-4">
      <v-card-title>Ohne Rauschen</v-card-title>
      <v-card-text>
        <div ref="cleanChartContainer" class="chart-container">
          <v-skeleton-loader
            v-if="!hasStarted"
            type="image"
            class="chart-skeleton"
          />
        </div>
      </v-card-text>
    </v-card>

    <v-card class="pa-4">
      <v-card-title>Mit Rauschen</v-card-title>
      <v-card-text>
        <div ref="noisyChartContainer" class="chart-container">
          <v-skeleton-loader
            v-if="!hasStarted"
            type="image"
            class="chart-skeleton"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
  <v-card class="parameter-card mt-4 pa-4">
    <v-card-title>Modell-Parameter</v-card-title>
    <v-card-text class="parameter-grid">
      <span><strong>Architektur:</strong> 1 → 100 → 100 → 1</span>
      <span><strong>Hidden Layer:</strong> 2 × 100 Neuronen, ReLU</span>
      <span><strong>Input/Output Layer:</strong> 1 Neuron, linear</span>
      <span><strong>Loss:</strong> Mean Squared Error (MSE)</span>
      <span><strong>Optimierer:</strong> Adam</span>
      <span><strong>Lernrate:</strong> 0,01</span>
      <span><strong>Batch-Size:</strong> 32</span>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import * as tfvis from "@tensorflow/tfjs-vis";
import { onMounted, ref } from "vue";
import {
  convertToTensor,
  createModel,
  trainModel,
} from "../../services/helper/training";
import { getRegressionDataset } from "../../services/helper/regressionData";

import type { DataPoint } from "../../../types";

const props = defineProps<{
  active: boolean;
}>();

const emit = defineEmits<{
  finished: [];
}>();

const cleanChartContainer = ref<HTMLDivElement | null>(null);
const noisyChartContainer = ref<HTMLDivElement | null>(null);

const cleanTestData = ref<DataPoint[]>([]);
const cleanTrainingData = ref<DataPoint[]>([]);
const noisyTestData = ref<DataPoint[]>([]);
const noisyTrainingData = ref<DataPoint[]>([]);
const hasStarted = ref(false);

const plot = async (): Promise<void> => {
  if (!cleanChartContainer.value || !noisyChartContainer.value) {
    return;
  }

  const { cleanTraining, cleanTest, noisyTraining, noisyTest } =
    await getRegressionDataset();

  cleanTrainingData.value = cleanTraining;
  cleanTestData.value = cleanTest;
  noisyTrainingData.value = noisyTraining;
  noisyTestData.value = noisyTest;

  const model = createModel(100);
  const tensorTrainingData = convertToTensor(cleanTrainingData.value);

  await trainModel(
    model,
    tensorTrainingData.inputs,
    tensorTrainingData.labels,
    100,
    32,
    "R1 Training",
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

  emit("finished");
};

onMounted(() => {
  if (props.active && !hasStarted.value) {
    hasStarted.value = true;
    void plot();
  }
});
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

.chart-skeleton {
  min-height: 450px;
}

.chart-container :deep([aria-roledescription="legend"]) {
  display: none;
}

.parameter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 1.5rem;
}

@media (max-width: 800px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .parameter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
