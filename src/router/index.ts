import { createRouter, createWebHistory } from "vue-router";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import SensorsView from "@/views/SensorsView.vue";
import AdminPanelLayout from "@/components/layout/AdminPanelLayout.vue";
import DashboardView from "@/views/DashboardView.vue";
import AlertsView from "@/views/AlertsView.vue";
import AlertRulesView from "@/views/AlertRulesView.vue";
import SensorDetailView from "@/views/SensorDetailView.vue";
import SensorGroupsView from "@/views/SensorGroupsView.vue";
import SensorTypeView from "@/views/SensorTypeView.vue";
import SensorTypeDetailView from "@/views/SensorTypeDetailView.vue";
import UserSettingsView from "@/views/UserSettingsView.vue";
import ResetPasswordView from "@/views/ResetPasswordView.vue";
import ForgotPasswordView from "@/views/ForgotPasswordView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", name: "Login", component: LoginView },
    { path: "/register", name: "Register", component: RegisterView },
    {
      path: "/panel",
      name: "Panel",
      component: AdminPanelLayout,
      meta: { requiresAuth: true },
      redirect: "/panel",
      children: [
        {
          path: "",
          name: "Dashboard",
          component: DashboardView,
        },
        {
          path: "sensors",
          name: "Sensory",
          component: SensorsView,
        },
        {
          path: "sensors/:id",
          name: "Szczegóły sensora",
          component: SensorDetailView,
          props: true,
        },
        {
          path: "sensor-types",
          name: "Typy sensorów",
          component: SensorTypeView,
        },
        {
          path: "sensor-types/:id",
          name: "Szczegóły typu sensora",
          component: SensorTypeDetailView,
          props: true,
        },
        {
          path: "groups",
          name: "Grupy sensorów",
          component: SensorGroupsView,
        },
        {
          path: "alerts",
          name: "Alerty",
          component: AlertsView,
        },
        {
          path: "alert-rules",
          name: "Reguły alertów",
          component: AlertRulesView,
        },
        {
          path: "settings",
          name: "Ustawienia konta",
          component: UserSettingsView,
        },
      ],
    },
    {
      path: "/",
      redirect: "/panel",
    },
    {
      path: "/forgot-password",
      name: "ForgotPassword",
      component: ForgotPasswordView,
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    }
  ],
});

router.beforeEach((to, _from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const token = localStorage.getItem("authToken");

  if (requiresAuth && !token) {
    next({ name: "Login" });
  } else if ((to.name === "Login" || to.name === "Register") && token) {
    next({ name: "Panel" });
  } else {
    next();
  }
});

export default router;
