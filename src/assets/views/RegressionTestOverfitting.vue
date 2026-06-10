<template>
  <h2 class="mt-8">
    R4: Overfitting
    <span v-if="overfitEpochs !== undefined">
      ab {{ overfitEpochs }} Epochen
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
      <span><strong>Maximale Suche:</strong> {{ MAX_EPOCHS }} Epochen</span>
      <span>
        <strong>Nach Overfitting:</strong>
        {{ POST_OVERFIT_STEPS }} weitere Schritte
      </span>
      <span>
        <strong>Overfitting ab:</strong>
        <template v-if="overfitEpochs !== undefined">
          {{ overfitEpochs }} Epochen
        </template>
        <v-skeleton-loader v-else type="text" class="value-skeleton" />
      </span>
      <span>
        <strong>Abbruchkriterium:</strong> Trainings-MSE ≤ 50 % der Test-MSE in
        zwei aufeinanderfolgenden Stufen
      </span>
    </v-card-text>
    <v-divider class="my-3" />
    <v-card-subtitle>Diskussion</v-card-subtitle>
    <v-card-text>
      Ein zweites Modell ebenso zunächst für 100 Epochen trainiert und
      anschließend in 100er-Epochenschritten weitertrainiert. Overfitting wird
      angenommen, sobald die Trainings-MSE in zwei aufeinanderfolgenden Stufen
      mindestens 50 % kleiner als die Test-MSE ausfällt. Markiert wird die erste
      dieser beiden Stufen. Nach der Bestätigung wird das Modell noch drei
      weitere Schritte trainiert, um die weitere Entwicklung beobachten zu
      können. Der zunehmende Abstand zeigt, dass das Modell die Trainingsdaten
      und ihr Rauschen immer genauer abbildet, während sich die Generalisierung
      auf unbekannte Daten nicht entsprechend verbessert.
    </v-card-text>
  </v-card>

  <v-card class="mt-4 pa-4">
    <v-card-title>R4: Suche ab {{ START_EPOCHS }} Epochen</v-card-title>
    <v-card-subtitle>
      Overfitting: Trainings-MSE in zwei aufeinanderfolgenden Stufen mindestens
      50 % kleiner als Test-MSE.
    </v-card-subtitle>
    <v-table v-if="active || searchFinished">
      <thead>
        <tr>
          <th>Epochen</th>
          <th>Trainings-MSE</th>
          <th>Test-MSE</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="trainingResults.length === 0">
          <td><v-skeleton-loader type="text" class="table-skeleton" /></td>
          <td><v-skeleton-loader type="text" class="table-skeleton" /></td>
          <td><v-skeleton-loader type="text" class="table-skeleton" /></td>
        </tr>
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
    <v-card-text v-else>
      <v-skeleton-loader type="table-row-divider@4" />
    </v-card-text>
    <p v-if="searchFinished && overfitEpochs === undefined" class="mt-4">
      Bis {{ MAX_EPOCHS }} Epochen wurde das festgelegte Overfitting-Kriterium
      nicht erreicht.
    </p>
  </v-card>

  <v-card class="mt-4 pa-4">
    <v-card-title>R4: MSE-Verlauf über die Epochen</v-card-title>
    <v-card-text>
      <div class="mse-chart-container">
        <Line :data="mseChartData" :options="mseChartOptions" />
      </div>
    </v-card-text>
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
const overfitEpochs = ref<number>();
const scatterplotEpochs = ref<number>();
const searchFinished = ref(false);
const trainingResults = ref<TrainingResult[]>([]);
const hasStarted = ref(false);

const EPOCH_STEP = 100;
const START_EPOCHS = 100;
const MAX_EPOCHS = 5000;
const MINIMUM_MSE_GAP = 0.5;
const POST_OVERFIT_STEPS = 3;

type TrainingResult = {
  epochs: number;
  trainingMse: number;
  testMse: number;
};

const formatLoss = (loss: number): string => loss.toFixed(6);

const isOverfitting = (result: TrainingResult): boolean =>
  result.trainingMse <= result.testMse * (1 - MINIMUM_MSE_GAP);

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
  trainingLoss.value = startingResult.trainingMse;
  testLoss.value = startingResult.testMse;

  let remainingPostOverfitSteps: number | undefined;
  let overfitCandidateEpochs = isOverfitting(startingResult)
    ? currentEpochs
    : undefined;

  while (
    overfitEpochs.value !== undefined
      ? (remainingPostOverfitSteps ?? 0) > 0
      : currentEpochs < MAX_EPOCHS
  ) {
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
    trainingLoss.value = result.trainingMse;
    testLoss.value = result.testMse;

    if (overfitEpochs.value === undefined) {
      if (isOverfitting(result)) {
        if (overfitCandidateEpochs !== undefined) {
          overfitEpochs.value = overfitCandidateEpochs;
          remainingPostOverfitSteps = POST_OVERFIT_STEPS;
        } else {
          overfitCandidateEpochs = currentEpochs;
        }
      } else {
        overfitCandidateEpochs = undefined;
      }
    } else if (remainingPostOverfitSteps !== undefined) {
      remainingPostOverfitSteps -= 1;
    }
  }

  scatterplotEpochs.value = currentEpochs;
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
