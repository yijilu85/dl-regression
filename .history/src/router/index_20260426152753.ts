import { h } from "vue";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const HomeRoute = {
  name: "HomeRoute",
  render: () => h("div", { class: "pa-6" }, "Router is set up. Replace this route component with your page component."),
};

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomeRoute,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
