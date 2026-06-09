<template>
  <h2 class="mt-8">
    R3: Best Fit
    <span v-if="isFinished">bei {{ BEST_FIT_EPOCHS }} Epochen</span>
  </h2>

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

  <v-card class="mt-4 pa-4 mb-6">
    <v-card-title>R3: Vergleich der Trainingsergebnisse</v-card-title>
    <v-table>
      <thead>
        <tr>
          <th>Epochen</th>
          <th>Trainings-MSE</th>
          <th>Test-MSE</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="result in trainingResults"
          :key="result.epochs"
          :class="{
            'best-result': isFinished && result.epochs === BEST_FIT_EPOCHS,
          }"
        >
          <td>{{ result.epochs }}</td>
          <td>{{ formatLoss(result.trainingMse) }}</td>
          <td>{{ formatLoss(result.testMse) }}</td>
        </tr>
      </tbody>
    </v-table>
  </v-card>
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

const emit = defineEmits<{
  finished: [];
}>();

const noisyTrainDataContainer = ref<HTMLDivElement | null>(null);
const noisyTestDataContainer = ref<HTMLDivElement | null>(null);
const trainingLoss = ref<number>();
const testLoss = ref<number>();
const isFinished = ref(false);
const BEST_FIT_EPOCHS = 600;

type TrainingResult = {
  epochs: number;
  trainingMse?: number;
  testMse?: number;
};

const trainingResults = ref<TrainingResult[]>(
  [50, 100, 200, 300, 400, 500, 600, 700].map((epochs) => ({
    epochs,
  })),
);

const formatLoss = (loss?: number): string =>
  loss === undefined ? "wird berechnet..." : loss.toFixed(6);

const plot = async (): Promise<void> => {
  if (!noisyTrainDataContainer.value || !noisyTestDataContainer.value) {
    return;
  }

  const { noisyTraining, noisyTest } = await getRegressionDataset();

  const tensorTrainingData = convertToTensor(noisyTraining);
  let bestFitModel: ReturnType<typeof createModel> | undefined;

  for (const result of trainingResults.value) {
    const model = createModel(100);

    await trainModel(
      model,
      tensorTrainingData.inputs,
      tensorTrainingData.labels,
      result.epochs,
      32,
      `R3 Training: ${result.epochs} Epochen`,
    );

    result.trainingMse = evaluateModel(
      model,
      noisyTraining,
      tensorTrainingData,
    );
    result.testMse = evaluateModel(model, noisyTest, tensorTrainingData);

    if (result.epochs === BEST_FIT_EPOCHS) {
      bestFitModel = model;
      trainingLoss.value = result.trainingMse;
      testLoss.value = result.testMse;
    } else {
      model.dispose();
    }
  }

  if (!bestFitModel) {
    return;
  }

  const trainingContainer = noisyTrainDataContainer.value;
  const testContainer = noisyTestDataContainer.value;

  if (!trainingContainer || !testContainer) {
    bestFitModel.dispose();
    tensorTrainingData.inputs.dispose();
    tensorTrainingData.labels.dispose();
    tensorTrainingData.inputMax.dispose();
    tensorTrainingData.inputMin.dispose();
    tensorTrainingData.labelMax.dispose();
    tensorTrainingData.labelMin.dispose();
    return;
  }

  await testModel(
    bestFitModel,
    noisyTraining,
    tensorTrainingData,
    trainingContainer,
  );

  await testModel(bestFitModel, noisyTest, tensorTrainingData, testContainer);

  bestFitModel.dispose();
  tensorTrainingData.inputs.dispose();
  tensorTrainingData.labels.dispose();
  tensorTrainingData.inputMax.dispose();
  tensorTrainingData.inputMin.dispose();
  tensorTrainingData.labelMax.dispose();
  tensorTrainingData.labelMin.dispose();

  isFinished.value = true;
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

.best-result {
  background: rgba(var(--v-theme-success), 0.12);
  font-weight: 600;
}

@media (max-width: 800px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
