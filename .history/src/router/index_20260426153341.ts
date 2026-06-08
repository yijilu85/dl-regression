import { h } from "vue";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import ImageClassification from "@/assets/views/ImageClassification.vue";
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: ImageClassification,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
