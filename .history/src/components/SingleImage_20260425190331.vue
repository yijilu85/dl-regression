<template>
  <v-card :class="`mx-auto ${bgColor}`" max-width="1000" v.hover="onHover">
    <v-container fluid>
      <v-row density="comfortable">
        <v-col>
          <img
            ref="img"
            :src="props.imgSrc"
            alt="Image to classify"
            class="object-cover"
          />
        </v-col>
        <v-col>
          <div
            class="mb-8 grid items-center"
            style="grid-template-columns: 1fr auto 1fr"
          >
            <div></div>
            <h2 class="m-0 text-center">{{ headline }}</h2>
            <div class="justify-self-end">
              <v-btn
                density="comfortable"
                icon="$close"
                variant="plain"
              ></v-btn>
            </div>
          </div>
          <!-- {{ results }} -->
          <div v-if="results && results?.length > 0">
            <Bar :data="data" :options="options" />
          </div>
          <div class="flex justify-center" v-else>
            <v-progress-circular
              :size="200"
              :width="15"
              color="rgba(75, 192, 192, 0.5)"
              indeterminate
            ></v-progress-circular>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <!-- <template v-slot:append> </template> -->
  </v-card>
</template>

<script setup lang="ts">
import ml5 from "ml5";
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { vElementHover } from "@vueuse/components";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const data = {
  labels: [] as string[],
  datasets: [
    {
      label: "Confidence",
      data: [] as number[],
      backgroundColor: "rgba(75, 192, 192, 0.5)",
    },
  ],
};
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    indexAxis: "x",
  },
};
const props = defineProps<{
  imgSrc: string;
  correct: boolean | undefined;
}>();
let classifier: any;

const img = useTemplateRef("img");

const results = ref<Result[]>();
async function preload() {
  classifier = ml5.imageClassifier("MobileNet");
}

const onHover = () => {
  console.log("Image element on hover:", img.value);
};

const headline = computed(() => {
  let correctWording = "undecided";
  console.log("Computing headline with props:", props);
  if (props.correct !== undefined) {
    correctWording = props.correct ? "Correct" : "Wrong";
  }
  let suffix =
    results.value && results.value.length > 0 ? correctWording : "...";

  return `Classification result: ${suffix}`;
});

const computationCorrect = computed(() => {
  if (props.correct !== undefined) {
    return props.correct;
  }

  return props.correct;
});

const bgColor = computed(() => {
  if (results.value && results.value.length > 0) {
    return props.correct ? "bg-green-100" : "bg-red-100";
  }
  return "bg-gray-100";
});

function gotResult(res: Result[]) {
  console.log("Classification results:", res);
  res.forEach((element: Result) => {
    data.labels.push(element.label);
    data.datasets[0].data.push(element.confidence);
  });
  results.value = res.map(
    (r) =>
      ({
        label: r.label,
        confidence: r.confidence,
      }) as Result,
  );
}
function classify() {
  console.log("Classifying image...");

  console.log("Image element:", img.value);
  classifier.classify(img.value, gotResult);
}

onMounted(async () => {
  await preload();
  classify();
});
</script>

<style scoped>
@reference "../styles/tailwind.css";
</style>
