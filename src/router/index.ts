import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import SensorsView from "@/views/SensorsView.vue";
import AdminPanelLayout from "@/components/AdminPanelLayout.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", name: "Login", component: LoginView },
    { path: "/register", name: "Register", component: RegisterView },
    {
      path: "/dashboard",
      name: "Dashboard",
      component: AdminPanelLayout,

      meta: { requiresAuth: true },
      redirect: "/dashboard/sensors",
      children: [
        {
          path: "sensors",
          name: "Sensors",
          component: SensorsView,
        },
      ],
    },
    {
      path: "/",
      redirect: "/dashboard",
    },
  ],
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const token = localStorage.getItem("authToken");

  if (requiresAuth && !token) {
    next({ name: "Login" });
  } else if ((to.name === "Login" || to.name === "Register") && token) {
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;
