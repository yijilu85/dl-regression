<template>
  <h2 class="mt-8">R2: Vorhersage ohne Rauschen</h2>

  <v-card class="parameter-card mt-4 pa-4">
    <v-card-title>Trainingsparameter</v-card-title>
    <v-card-text class="parameter-grid">
      <span><strong>Getestete Epochen:</strong> 100 bis 500</span>
    </v-card-text>
    <v-divider class="my-3" />
    <v-card-subtitle>Diskussion</v-card-subtitle>
    <v-card-text>
      Ein Modell wird auf den unverrauschten Daten kontinuierlich bis 500
      Epochen trainiert. Nach jeweils 100 Epochen werden die Trainings- und
      Test-MSE protokolliert. Da die Trainings- und Testpunkte derselben
      rauschfreien Funktion folgen, sollten beide Werte bereits innerhalb dieses
      Epochenbereichs ähnlich ausfallen.
    </v-card-text>
  </v-card>
  <v-card class="mt-4 pa-4">
    <v-card-title>R2: MSE-Verlauf über die Epochen</v-card-title>
    <v-card-text>
      <div class="mse-chart-container">
        <Line :data="mseChartData" :options="mseChartOptions" />
      </div>
    </v-card-text>
  </v-card>

  <v-card class="mt-4 pa-4">
    <v-card-title>R2: Vergleich der Trainingsergebnisse</v-card-title>
    <v-table v-if="active || isFinished">
      <thead>
        <tr>
          <th>Epochen</th>
          <th>Trainings-MSE</th>
          <th>Test-MSE</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="result in trainingResults" :key="result.epochs">
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

  <div class="charts-grid mt-4">
    <v-card class="pa-4">
      <v-card-title>Trainingsdaten</v-card-title>
      <v-card-text>
        <div ref="cleanTrainDataContainer" class="chart-container">
          <v-skeleton-loader
            v-if="!isFinished"
            type="image"
            class="chart-skeleton"
          />
        </div>
        <p class="mt-2">
          <strong>Modell:</strong> {{ scatterplotEpochs }} Epochen
        </p>
        <p class="mt-2 mse-value">
          <strong>Trainings-MSE:</strong>
          <span v-if="trainingMse !== undefined">
            {{ formatLoss(trainingMse) }}
          </span>
          <v-skeleton-loader v-else type="text" class="value-skeleton" />
        </p>
      </v-card-text>
    </v-card>

    <v-card class="pa-4">
      <v-card-title>Testdaten</v-card-title>
      <v-card-text>
        <div ref="cleanTestDataContainer" class="chart-container">
          <v-skeleton-loader
            v-if="!isFinished"
            type="image"
            class="chart-skeleton"
          />
        </div>
        <p class="mt-2">
          <strong>Modell:</strong> {{ scatterplotEpochs }} Epochen
        </p>
        <p class="mt-2 mse-value">
          <strong>Test-MSE:</strong>
          <span v-if="testMse !== undefined">{{ formatLoss(testMse) }}</span>
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

import type { DataPoint } from "../../../types";

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
  finished: [];
}>();

const cleanTrainDataContainer = ref<HTMLDivElement | null>(null);
const cleanTestDataContainer = ref<HTMLDivElement | null>(null);

const cleanTestData = ref<DataPoint[]>([]);
const cleanTrainingData = ref<DataPoint[]>([]);
const trainingMse = ref<number>();
const testMse = ref<number>();
const hasStarted = ref(false);
const isFinished = ref(false);

type TrainingResult = {
  epochs: number;
  trainingMse?: number;
  testMse?: number;
};

const trainingResults = ref<TrainingResult[]>(
  [100, 200, 300, 400, 500].map((epochs) => ({ epochs })),
);
const scatterplotEpochs =
  trainingResults.value[trainingResults.value.length - 1].epochs;

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
  if (!cleanTrainDataContainer.value || !cleanTestDataContainer.value) {
    return;
  }

  const { cleanTraining, cleanTest } = await getRegressionDataset();

  cleanTrainingData.value = cleanTraining;
  cleanTestData.value = cleanTest;

  const tensorTrainingDataOnTraining = convertToTensor(cleanTrainingData.value);
  const model = createModel(100);

  for (const [index, result] of trainingResults.value.entries()) {
    await trainModel(
      model,
      tensorTrainingDataOnTraining.inputs,
      tensorTrainingDataOnTraining.labels,
      index === 0
        ? result.epochs
        : result.epochs - trainingResults.value[index - 1].epochs,
      32,
      "R2 Training",
      index === 0,
    );

    result.trainingMse = evaluateModel(
      model,
      cleanTrainingData.value,
      tensorTrainingDataOnTraining,
    );
    result.testMse = evaluateModel(
      model,
      cleanTestData.value,
      tensorTrainingDataOnTraining,
    );

    if (index === trainingResults.value.length - 1) {
      trainingMse.value = result.trainingMse;
      testMse.value = result.testMse;
    }
  }

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

  model.dispose();
  tensorTrainingDataOnTraining.inputs.dispose();
  tensorTrainingDataOnTraining.labels.dispose();
  tensorTrainingDataOnTraining.inputMax.dispose();
  tensorTrainingDataOnTraining.inputMin.dispose();

  isFinished.value = true;
  emit("finished");
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

.mse-chart-container {
  height: 400px;
}

.mse-chart-skeleton {
  height: 400px;
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
