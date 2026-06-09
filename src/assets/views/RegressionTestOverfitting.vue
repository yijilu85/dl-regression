<template>
  <h2 clasS="mt-8">R4: Overfitting bei Epochs 1500</h2>

  <div class="charts-grid">
    <v-card class="pa-4">
      <v-card-title>Trainingsdaten mit Rauschen</v-card-title>
      <v-card-text>
        <div ref="noisyTrainDataContainer" class="chart-container" />
        <p class="mt-2">Trainings-MSE: {{ formatLoss(trainingLoss) }}</p>
      </v-card-text>
    </v-card>

    <v-card class="pa-4">
      <v-card-title>Testdaten mit Rauschen</v-card-title>
      <v-card-text>
        <div ref="noisyTestDataContainer" class="chart-container" />
        <p class="mt-2">Test-MSE: {{ formatLoss(testLoss) }}</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import {
  convertToTensor,
  createModel,
  trainModel,
  testModel,
  evaluateModel,
} from "../../services/helper/training";
import { getRegressionDataset } from "../../services/helper/regressionData";

const noisyTrainDataContainer = ref<HTMLDivElement | null>(null);
const noisyTestDataContainer = ref<HTMLDivElement | null>(null);
const trainingLoss = ref<number>();
const testLoss = ref<number>();
const OVERFIT_EPOCHS = 1500;

const formatLoss = (loss?: number): string =>
  loss === undefined ? "wird berechnet..." : loss.toFixed(6);

const plot = async (): Promise<void> => {
  if (!noisyTrainDataContainer.value || !noisyTestDataContainer.value) {
    return;
  }

  const { noisyTraining, noisyTest } = await getRegressionDataset();

  const model = createModel(100);
  const tensorTrainingData = convertToTensor(noisyTraining);

  await trainModel(
    model,
    tensorTrainingData.inputs,
    tensorTrainingData.labels,
    OVERFIT_EPOCHS,
    32,
    "R4 Overfit Training",
  );

  trainingLoss.value = evaluateModel(model, noisyTraining, tensorTrainingData);
  testLoss.value = evaluateModel(model, noisyTest, tensorTrainingData);

  const trainingContainer = noisyTrainDataContainer.value;
  const testContainer = noisyTestDataContainer.value;

  if (!trainingContainer || !testContainer) {
    model.dispose();
    tensorTrainingData.inputs.dispose();
    tensorTrainingData.labels.dispose();
    tensorTrainingData.inputMax.dispose();
    tensorTrainingData.inputMin.dispose();
    tensorTrainingData.labelMax.dispose();
    tensorTrainingData.labelMin.dispose();
    return;
  }

  await testModel(model, noisyTraining, tensorTrainingData, trainingContainer);

  await testModel(model, noisyTest, tensorTrainingData, testContainer);

  model.dispose();
  tensorTrainingData.inputs.dispose();
  tensorTrainingData.labels.dispose();
  tensorTrainingData.inputMax.dispose();
  tensorTrainingData.inputMin.dispose();
  tensorTrainingData.labelMax.dispose();
  tensorTrainingData.labelMin.dispose();
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
