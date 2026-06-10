<template>
  <h2 class="mt-8">
    R4: Overfitting
    <span v-if="bestFitEpochs !== undefined">
      – Best Fit bei {{ bestFitEpochs }} Epochen
    </span>
    <span v-if="overfitEpochs !== undefined">
      – Overfitting ab {{ overfitEpochs }} Epochen
    </span>
  </h2>

  <v-card class="parameter-card mt-4 pa-4">
    <v-card-title>Trainingsparameter</v-card-title>
    <v-card-text class="parameter-grid">
      <span>
        <strong>Start:</strong>
        {{ START_EPOCHS }} Epochen
      </span>
      <span><strong>Schrittweite:</strong> 100 Epochen</span>
      <span>
        <strong>Trainingsende:</strong>
        {{ MAX_EPOCHS }} Epochen
      </span>
      <span>
        <strong>Best Fit:</strong>
        <template v-if="bestFitEpochs !== undefined">
          {{ bestFitEpochs }} Epochen
        </template>
        <v-skeleton-loader v-else type="text" class="value-skeleton" />
      </span>
      <span>
        <strong>Overfitting ab:</strong>
        <template v-if="overfitEpochs !== undefined">
          {{ overfitEpochs }} Epochen
        </template>
        <v-skeleton-loader v-else type="text" class="value-skeleton" />
      </span>
      <span>
        <strong>Overfitting-Kriterium:</strong> Test-MSE steigt und der Abstand
        zur Trainings-MSE wächst in zwei aufeinanderfolgenden Übergängen
      </span>
    </v-card-text>
    <v-divider class="my-3" />
    <v-card-subtitle>Diskussion</v-card-subtitle>
    <v-card-text>
      <p>
        Ein neues Modell wird kontinuierlich bis {{ MAX_EPOCHS }} Epochen
        trainiert. Nach jeweils 100 Epochen werden Trainings- und Test-MSE
        gemessen. Nach Abschluss des Trainings wird – wie in R3 – der Messpunkt
        mit der kleinsten Test-MSE rückblickend als Best Fit markiert.
      </p>
      <p>
        Anschließend werden ausschließlich die Messpunkte nach dem Best Fit
        untersucht. Overfitting wird registriert, wenn in zwei
        aufeinanderfolgenden Übergängen sowohl die Test-MSE als auch der Abstand
        zwischen Test- und Trainings-MSE wachsen. Die erste Stufe dieser
        bestätigten Entwicklung wird als Overfit-Schwelle markiert. Der
        zugehörige Modellzustand wird für die Scatterplots wiederhergestellt.
      </p>
      <p>
        Aufgrund der geringen Datenmenge kann die kleinste Test-MSE erst bei
        einer der letzten untersuchten Epochenzahlen auftreten. In diesem Fall
        stehen möglicherweise nicht genügend nachfolgende Messpunkte zur
        Verfügung, um Overfitting nach dem festgelegten Kriterium zu bestätigen.
        Die Auswertung erfolgt rückblickend und beeinflusst weder das Training
        noch dessen Dauer.
      </p>
    </v-card-text>
  </v-card>
  <v-card class="mt-4 pa-4">
    <v-card-title>R4: MSE-Verlauf über die Epochen</v-card-title>
    <v-card-text>
      <div class="mse-chart-container">
        <Line :data="mseChartData" :options="mseChartOptions" />
      </div>
    </v-card-text>
  </v-card>
  <v-card class="mt-4 pa-4">
    <v-card-title>R4: Suche ab {{ START_EPOCHS }} Epochen</v-card-title>
    <v-card-subtitle>
      Overfitting: zwei aufeinanderfolgende Übergänge mit steigender Test-MSE
      und wachsendem Abstand zur Trainings-MSE.
    </v-card-subtitle>
    <v-table v-if="active || searchFinished">
      <thead>
        <tr>
          <th>Epochen</th>
          <th>Trainings-MSE</th>
          <th>Test-MSE</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="trainingResults.length === 0">
          <td><v-skeleton-loader type="text" class="table-skeleton" /></td>
          <td><v-skeleton-loader type="text" class="table-skeleton" /></td>
          <td><v-skeleton-loader type="text" class="table-skeleton" /></td>
          <td><v-skeleton-loader type="text" class="table-skeleton" /></td>
        </tr>
        <tr
          v-for="result in trainingResults"
          :key="result.epochs"
          :class="{
            'best-result': result.epochs === bestFitEpochs,
            'overfit-result': result.epochs === overfitEpochs,
          }"
        >
          <td>{{ result.epochs }}</td>
          <td>{{ formatLoss(result.trainingMse) }}</td>
          <td>{{ formatLoss(result.testMse) }}</td>
          <td class="status-chips">
            <v-chip
              v-if="result.epochs === bestFitEpochs"
              color="success"
              size="small"
            >
              Best Fit
            </v-chip>
            <v-chip
              v-if="result.epochs === overfitEpochs"
              color="error"
              size="small"
            >
              Overfit
            </v-chip>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-card-text v-else>
      <v-skeleton-loader type="table-row-divider@4" />
    </v-card-text>
    <p v-if="searchFinished && overfitEpochs === undefined" class="mt-4">
      Nach dem Best Fit wurde bis {{ MAX_EPOCHS }} Epochen kein bestätigtes
      Overfitting gefunden.
    </p>
  </v-card>

  <div class="charts-grid mt-4">
    <v-card class="pa-4">
      <v-card-title>Trainingsdaten mit Rauschen</v-card-title>
      <v-card-text>
        <div ref="noisyTrainDataContainer" class="chart-container">
          <v-skeleton-loader
            v-if="!searchFinished"
            type="image"
            class="chart-skeleton"
          />
        </div>
        <p class="mt-2">
          <strong>Modell:</strong>
          <span v-if="scatterplotEpochs !== undefined">
            {{ scatterplotEpochs }} Epochen
          </span>
          <v-skeleton-loader v-else type="text" class="value-skeleton" />
        </p>
        <p class="mt-2 mse-value">
          <strong>Trainings-MSE:</strong>
          <span v-if="trainingLoss !== undefined">
            {{ formatLoss(trainingLoss) }}
          </span>
          <v-skeleton-loader v-else type="text" class="value-skeleton" />
        </p>
      </v-card-text>
    </v-card>

    <v-card class="pa-4">
      <v-card-title>Testdaten mit Rauschen</v-card-title>
      <v-card-text>
        <div ref="noisyTestDataContainer" class="chart-container">
          <v-skeleton-loader
            v-if="!searchFinished"
            type="image"
            class="chart-skeleton"
          />
        </div>
        <p class="mt-2">
          <strong>Modell:</strong>
          <span v-if="scatterplotEpochs !== undefined">
            {{ scatterplotEpochs }} Epochen
          </span>
          <v-skeleton-loader v-else type="text" class="value-skeleton" />
        </p>
        <p class="mt-2 mse-value">
          <strong>Test-MSE:</strong>
          <span v-if="testLoss !== undefined">{{ formatLoss(testLoss) }}</span>
          <v-skeleton-loader v-else type="text" class="value-skeleton" />
        </p>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { Line } from "vue-chartjs";
import {
  convertToTensor,
  createModel,
  trainModel,
  testModel,
  evaluateModel,
} from "../../services/helper/training";
import { getRegressionDataset } from "../../services/helper/regressionData";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const props = defineProps<{
  active: boolean;
}>();

const noisyTrainDataContainer = ref<HTMLDivElement | null>(null);
const noisyTestDataContainer = ref<HTMLDivElement | null>(null);
const trainingLoss = ref<number>();
const testLoss = ref<number>();
const bestFitEpochs = ref<number>();
const overfitEpochs = ref<number>();
const scatterplotEpochs = ref<number>();
const searchFinished = ref(false);
const trainingResults = ref<TrainingResult[]>([]);
const hasStarted = ref(false);

const EPOCH_STEP = 100;
const START_EPOCHS = 100;
const MAX_EPOCHS = 3000;

type TrainingResult = {
  epochs: number;
  trainingMse: number;
  testMse: number;
};

const formatLoss = (loss: number): string => loss.toFixed(6);

const hasOverfittingTrend = (
  previous: TrainingResult,
  current: TrainingResult,
): boolean => {
  const previousGap = previous.testMse - previous.trainingMse;
  const currentGap = current.testMse - current.trainingMse;

  return (
    current.testMse > previous.testMse &&
    currentGap > previousGap &&
    current.trainingMse < current.testMse
  );
};

const mseChartData = computed<ChartData<"line">>(() => ({
  labels: trainingResults.value.map((result) => result.epochs),
  datasets: [
    {
      label: "Trainings-MSE",
      data: trainingResults.value.map((result) => result.trainingMse),
      borderColor: "rgb(75, 192, 192)",
      backgroundColor: "rgba(75, 192, 192, 0.3)",
      tension: 0.2,
    },
    {
      label: "Test-MSE",
      data: trainingResults.value.map((result) => result.testMse),
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "rgba(255, 99, 132, 0.3)",
      tension: 0.2,
    },
    {
      label: "Best Fit",
      data: trainingResults.value.map((result) =>
        result.epochs === bestFitEpochs.value ? result.testMse : null,
      ),
      borderColor: "rgb(76, 175, 80)",
      backgroundColor: "rgb(76, 175, 80)",
      pointRadius: 7,
      pointHoverRadius: 9,
      showLine: false,
    },
    {
      label: "Overfit",
      data: trainingResults.value.map((result) =>
        result.epochs === overfitEpochs.value ? result.testMse : null,
      ),
      borderColor: "rgb(244, 67, 54)",
      backgroundColor: "rgb(244, 67, 54)",
      pointRadius: 7,
      pointHoverRadius: 9,
      showLine: false,
    },
  ],
}));

const mseChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index",
    intersect: false,
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Epochen",
      },
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "MSE",
      },
    },
  },
};

const plot = async (): Promise<void> => {
  if (!noisyTrainDataContainer.value || !noisyTestDataContainer.value) {
    return;
  }

  const { noisyTraining, noisyTest } = await getRegressionDataset();

  const model = createModel(100);
  const modelWeightsByEpoch = new Map<
    number,
    ReturnType<typeof model.getWeights>
  >();
  const tensorTrainingData = convertToTensor(noisyTraining);

  await trainModel(
    model,
    tensorTrainingData.inputs,
    tensorTrainingData.labels,
    START_EPOCHS,
    32,
    "R4 Overfit Training",
  );

  let currentEpochs = START_EPOCHS;
  const startingResult: TrainingResult = {
    epochs: currentEpochs,
    trainingMse: evaluateModel(model, noisyTraining, tensorTrainingData),
    testMse: evaluateModel(model, noisyTest, tensorTrainingData),
  };

  trainingResults.value.push(startingResult);
  modelWeightsByEpoch.set(
    currentEpochs,
    model.getWeights().map((weight) => weight.clone()),
  );

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
      trainingMse: evaluateModel(model, noisyTraining, tensorTrainingData),
      testMse: evaluateModel(model, noisyTest, tensorTrainingData),
    };

    trainingResults.value.push(result);
    modelWeightsByEpoch.set(
      currentEpochs,
      model.getWeights().map((weight) => weight.clone()),
    );
  }

  const bestFitIndex = trainingResults.value.reduce(
    (bestIndex, result, index, results) =>
      result.testMse < results[bestIndex].testMse ? index : bestIndex,
    0,
  );

  bestFitEpochs.value = trainingResults.value[bestFitIndex].epochs;

  for (
    let index = bestFitIndex;
    index < trainingResults.value.length - 2;
    index += 1
  ) {
    const previousResult = trainingResults.value[index];
    const firstResult = trainingResults.value[index + 1];
    const secondResult = trainingResults.value[index + 2];

    if (
      hasOverfittingTrend(previousResult, firstResult) &&
      hasOverfittingTrend(firstResult, secondResult)
    ) {
      overfitEpochs.value = firstResult.epochs;
      break;
    }
  }

  const scatterplotResult =
    trainingResults.value.find(
      (result) => result.epochs === overfitEpochs.value,
    ) ?? trainingResults.value[trainingResults.value.length - 1];
  const scatterplotWeights = modelWeightsByEpoch.get(scatterplotResult.epochs);

  if (scatterplotWeights) {
    model.setWeights(scatterplotWeights);
  }

  for (const weights of modelWeightsByEpoch.values()) {
    weights.forEach((weight) => weight.dispose());
  }

  scatterplotEpochs.value = scatterplotResult.epochs;
  trainingLoss.value = scatterplotResult.trainingMse;
  testLoss.value = scatterplotResult.testMse;
  searchFinished.value = true;

  const trainingContainer = noisyTrainDataContainer.value;
  const testContainer = noisyTestDataContainer.value;

  if (!trainingContainer || !testContainer) {
    model.dispose();
    tensorTrainingData.inputs.dispose();
    tensorTrainingData.labels.dispose();
    tensorTrainingData.inputMax.dispose();
    tensorTrainingData.inputMin.dispose();
    return;
  }

  await testModel(model, noisyTraining, tensorTrainingData, trainingContainer);

  await testModel(model, noisyTest, tensorTrainingData, testContainer);

  model.dispose();
  tensorTrainingData.inputs.dispose();
  tensorTrainingData.labels.dispose();
  tensorTrainingData.inputMax.dispose();
  tensorTrainingData.inputMin.dispose();
};
const start = async (): Promise<void> => {
  if (!props.active || hasStarted.value) {
    return;
  }

  hasStarted.value = true;
  await nextTick();
  await plot();
};

onMounted(start);
watch(() => props.active, start);
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

.mse-value {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.value-skeleton,
.headline-skeleton {
  display: inline-block;
  width: 7rem;
  vertical-align: middle;
}

.table-skeleton {
  width: 6rem;
}

.status-chips {
  display: flex;
  gap: 0.5rem;
}

.chart-container :deep([aria-roledescription="legend"]) {
  display: none;
}

.parameter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 1.5rem;
}

.mse-chart-container,
.mse-chart-skeleton {
  height: 400px;
}

.best-result {
  background: rgba(var(--v-theme-success), 0.12);
  font-weight: 600;
}

.overfit-result {
  background: rgba(var(--v-theme-error), 0.12);
  font-weight: 600;
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
