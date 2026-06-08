<template>
  <v-card
    :class="`mx-auto ${bgColor}`"
    max-width="1000"
    @mouseover="onHover"
    @mouseleave="onLeave"
  >
    <v-container fluid>
      <v-row density="comfortable">
        <v-col>
          <img
            ref="img"
            :src="props.imgSrc"
            alt="Image to classify"
            loading="lazy"
            class="object-cover"
          />
        </v-col>
        <v-col>
          <div
            class="mb-8 grid items-center"
            style="grid-template-columns: 1fr auto 1fr"
          >
            <div class="col-start-2 flex flex-col items-center">
              <h2 class="text-center text-medium">{{ confidence }}</h2>
              <h3 class="text-center text-xl font-bold">
                {{ classificationResultLabel }}
              </h3>
            </div>

            <div class="justify-self-end" :class="{ invisible: !isHovering }">
              <v-btn
                density="comfortable"
                icon="$close"
                variant="plain"
                @click="$emit('remove')"
              ></v-btn>
            </div>
          </div>
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
  </v-card>
</template>

<script setup lang="ts">
import { getClassifier } from "@/imageClassifier";

import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue";

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

const data = computed(() => ({
  labels: results.value?.map((r) => r.label) ?? [],
  datasets: [
    {
      label: "Confidence",
      data: results.value?.map((r) => r.confidence) ?? [],
      backgroundColor: "rgba(75, 192, 192, 0.5)",
    },
  ],
}));

const emit = defineEmits<{
  (e: "remove"): void;
}>();
const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    indexAxis: "x",
  },
  scales: {
    y: {
      ticks: {
        callback: (value: any) => `${(value * 100).toFixed(0)}%`,
      },
    },
  },
};
const props = defineProps<{
  imgSrc: string;
  correct: boolean | undefined;
}>();

const img = useTemplateRef("img");
const results = ref<Result[]>();
const classificationError = ref<string | null>(null);
let observer: IntersectionObserver | null = null;
let hasClassified = false;

const isHovering = ref(false);

const onHover = () => {
  isHovering.value = true;
};

const onLeave = () => {
  isHovering.value = false;
};

const confidence = computed(() => {
  let topResult =
    results.value && results.value.length > 0 ? results.value[0] : null;

  let suffix =
    results.value && results.value.length > 0
      ? `${topResult?.confidence ? (topResult.confidence * 100).toFixed(2) + "% confidence" : ""}`
      : "...";
  return `Klassifikation: ${suffix}`;
});
const classificationResultLabel = computed(() => {
  let topResult =
    results.value && results.value.length > 0 ? results.value[0] : null;

  if (topResult) {
    return topResult.label;
  }
});

const bgColor = computed(() => {
  if (classificationError.value) return "bg-amber-50";

  if (results.value && results.value.length > 0) {
    if (props.correct === undefined) return "bg-gray-100";
    return props.correct ? "bg-green-100" : "bg-red-100";
  }

  return "bg-gray-100";
});

async function classify() {
  if (!img.value || hasClassified) return;

  try {
    const classifier = await getClassifier();

    classifier.classify(img.value, (error, res) => {
      if (error) {
        classificationError.value = "Klassifikation fehlgeschlagen";
        console.error("Classification failed", error);
        return;
      }

      if (!Array.isArray(res)) {
        classificationError.value = "Ungueltige Klassifikationsdaten";
        console.error("Classification returned invalid result", res);
        return;
      }

      hasClassified = true;
      results.value = [...res].sort((a, b) => b.confidence - a.confidence);
    });
  } catch (error) {
    classificationError.value = "Modell konnte nicht geladen werden";
    console.error("Model loading failed", error);
  }
}

onMounted(async () => {
  if (!img.value) return;

  if (typeof IntersectionObserver === "undefined") {
    await classify();
    return;
  }

  observer = new IntersectionObserver(
    async (entries) => {
      const [entry] = entries;

      if (entry?.isIntersecting) {
        observer?.disconnect();
        observer = null;
        await classify();
      }
    },
    {
      root: null,
      rootMargin: "120px",
      threshold: 0.1,
    },
  );

  observer.observe(img.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<style scoped>
@reference "../styles/tailwind.css";
</style>
