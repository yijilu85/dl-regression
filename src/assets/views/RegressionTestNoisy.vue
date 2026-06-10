<template>
  <h2 class="mt-8">
    R3: Best Fit Vorhersage für verrauschte Daten
    <span v-if="isFinished && bestFitEpochs !== undefined">
      bei {{ bestFitEpochs }} Epochen
    </span>
  </h2>

  <v-card class="parameter-card mt-4 pa-4">
    <v-card-title>Trainingsparameter</v-card-title>
    <v-card-text class="parameter-grid">
      <span><strong>Getestete Epochen:</strong> 100 bis 900</span>
      <span><strong>Best-Fit-Kriterium:</strong> kleinste Test-MSE</span>
      <span>
        <strong>Best-Fit-Epochen:</strong>
        <span v-if="isFinished">{{ bestFitEpochs }}</span>
        <v-skeleton-loader v-else type="text" class="value-skeleton" />
      </span>
    </v-card-text>
    <v-divider class="my-3" />
    <v-card-subtitle>Diskussion</v-card-subtitle>
    <v-card-text>
      Von 100 bis 1000 wird in jeweils 100er Epochenschritten ein unabhängiges
      Modell neu trainiert, um den Best Fit anhand des kleinsten Test-MSE pro
      Durchlauf zu ermitteln. Damit soll die beste Generalisierung gefunden
      werden. Die Experimente haben ergeben, dass der Best-Fit je nach
      Verteilung der Daten am häufigsten im Bereich 500-700 Epochen liegt. 1000
      wird als obere Grenze angenommen, da hier erfahrungsgemäß bereits
      Overfitting vorliegen kann.
    </v-card-text>
  </v-card>

  <v-card class="mt-4 pa-4">
    <v-card-title>R3: Vergleich der Trainingsergebnisse</v-card-title>
    <v-table v-if="active || isFinished">
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
            'best-result': isFinished && result.epochs === bestFitEpochs,
          }"
        >
          <td>{{ result.epochs }}</td>
          <td>
            <span v-if="result.trainingMse !== undefined">
              {{ formatLoss(result.trainingMse) }}
            </span>
            <v-skeleton-loader v-else type="text" class="table-skeleton" />
          </td>
          <td>
            <span v-if="result.testMse !== undefined">
              {{ formatLoss(result.testMse) }}
            </span>
            <v-skeleton-loader v-else type="text" class="table-skeleton" />
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-card-text v-else>
      <v-skeleton-loader type="table-row-divider@4" />
    </v-card-text>
  </v-card>

  <v-card class="mt-4 pa-4">
    <v-card-title>R3: MSE-Verlauf über die Epochen</v-card-title>
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
            v-if="!isFinished"
            type="image"
            class="chart-skeleton"
          />
        </div>
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
            v-if="!isFinished"
            type="image"
            class="chart-skeleton"
          />
        </div>
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

const emit = defineEmits<{
  finished: [result: { epochs: number; testMse: number }];
}>();

const noisyTrainDataContainer = ref<HTMLDivElement | null>(null);
const noisyTestDataContainer = ref<HTMLDivElement | null>(null);
const trainingLoss = ref<number>();
const testLoss = ref<number>();
const isFinished = ref(false);
const bestFitEpochs = ref<number>();
const hasStarted = ref(false);

type TrainingResult = {
  epochs: number;
  trainingMse?: number;
  testMse?: number;
};

const trainingResults = ref<TrainingResult[]>(
  [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((epochs) => ({
    epochs,
  })),
);

const formatLoss = (loss: number): string => loss.toFixed(6);

const mseChartData = computed<ChartData<"line">>(() => ({
  labels: trainingResults.value.map((result) => result.epochs),
  datasets: [
    {
      label: "Trainings-MSE",
      data: trainingResults.value.map((result) => result.trainingMse ?? null),
      borderColor: "rgb(75, 192, 192)",
      backgroundColor: "rgba(75, 192, 192, 0.3)",
      tension: 0.2,
    },
    {
      label: "Test-MSE",
      data: trainingResults.value.map((result) => result.testMse ?? null),
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

  const tensorTrainingData = convertToTensor(noisyTraining);
  let bestFitModel: ReturnType<typeof createModel> | undefined;
  let lowestTestMse = Number.POSITIVE_INFINITY;

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

    if (result.testMse < lowestTestMse) {
      bestFitModel?.dispose();
      bestFitModel = model;
      lowestTestMse = result.testMse;
      bestFitEpochs.value = result.epochs;
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

  if (bestFitEpochs.value === undefined || testLoss.value === undefined) {
    return;
  }

  isFinished.value = true;
  emit("finished", {
    epochs: bestFitEpochs.value,
    testMse: testLoss.value,
  });
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

.value-skeleton {
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

.best-result {
  background: rgba(var(--v-theme-success), 0.12);
  font-weight: 600;
}

.mse-chart-container {
  height: 400px;
}

.mse-chart-skeleton {
  height: 400px;
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
