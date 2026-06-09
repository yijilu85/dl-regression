<template>
  <h2 class="mt-8">
    R4: Overfitting
    <span v-if="overfitEpochs !== undefined">
      bei {{ overfitEpochs }} Epochen
    </span>
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
    <v-card-title>
      R4: Suche ab {{ bestFitEpochs }} Epochen
    </v-card-title>
    <v-card-subtitle>
      Overfitting: Trainings-MSE mindestens 30 % kleiner als Test-MSE und
      Test-MSE größer als beim Best Fit.
    </v-card-subtitle>
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
          :class="{ 'overfit-result': result.epochs === overfitEpochs }"
        >
          <td>{{ result.epochs }}</td>
          <td>{{ formatLoss(result.trainingMse) }}</td>
          <td>{{ formatLoss(result.testMse) }}</td>
        </tr>
      </tbody>
    </v-table>
    <p v-if="searchFinished && overfitEpochs === undefined" class="mt-4">
      Bis {{ MAX_EPOCHS }} Epochen wurde das festgelegte
      Overfitting-Kriterium nicht erreicht.
    </p>
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

const props = defineProps<{
  bestFitEpochs: number;
  bestFitTestMse: number;
}>();

const noisyTrainDataContainer = ref<HTMLDivElement | null>(null);
const noisyTestDataContainer = ref<HTMLDivElement | null>(null);
const trainingLoss = ref<number>();
const testLoss = ref<number>();
const overfitEpochs = ref<number>();
const searchFinished = ref(false);
const trainingResults = ref<TrainingResult[]>([]);

const EPOCH_STEP = 100;
const MAX_EPOCHS = 5000;
const MINIMUM_MSE_GAP = 0.3;

type TrainingResult = {
  epochs: number;
  trainingMse: number;
  testMse: number;
};

const formatLoss = (loss?: number): string =>
  loss === undefined ? "wird berechnet..." : loss.toFixed(6);

const isOverfitting = (result: TrainingResult): boolean =>
  result.testMse > props.bestFitTestMse &&
  result.trainingMse <= result.testMse * (1 - MINIMUM_MSE_GAP);

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
    props.bestFitEpochs,
    32,
    "R4 Overfit Training",
  );

  let currentEpochs = props.bestFitEpochs;
  const startingResult: TrainingResult = {
    epochs: currentEpochs,
    trainingMse: evaluateModel(
      model,
      noisyTraining,
      tensorTrainingData,
    ),
    testMse: evaluateModel(model, noisyTest, tensorTrainingData),
  };

  trainingResults.value.push(startingResult);
  trainingLoss.value = startingResult.trainingMse;
  testLoss.value = startingResult.testMse;

  while (currentEpochs < MAX_EPOCHS) {
    await trainModel(
      model,
      tensorTrainingData.inputs,
      tensorTrainingData.labels,
      EPOCH_STEP,
      32,
      "R4 Overfit Training",
      false,
    );

    currentEpochs += EPOCH_STEP;

    const result: TrainingResult = {
      epochs: currentEpochs,
      trainingMse: evaluateModel(
        model,
        noisyTraining,
        tensorTrainingData,
      ),
      testMse: evaluateModel(model, noisyTest, tensorTrainingData),
    };

    trainingResults.value.push(result);
    trainingLoss.value = result.trainingMse;
    testLoss.value = result.testMse;

    if (isOverfitting(result)) {
      overfitEpochs.value = currentEpochs;
      break;
    }
  }

  searchFinished.value = true;

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

.overfit-result {
  background: rgba(var(--v-theme-error), 0.12);
  font-weight: 600;
}

@media (max-width: 800px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
