import { createMemoryHistory, createRouter } from "vue-router";

import ImageClassification from "@/assets/views/ImageClassification.vue";

const routes = [
  { path: "/", component: ImageClassification },
  { path: "/about", component: AboutView },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
