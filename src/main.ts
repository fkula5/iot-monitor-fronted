import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { toast } from "vue-sonner";

const app = createApp(App);

app.config.globalProperties.$appName = "IoT Dashboard";
app.config.errorHandler = (err, instance, info) => {
  console.error("Global Error Caught:", err);
  console.error("Component:", instance);
  console.error("Error Info:", info);
  toast.error("An unexpected error occurred.", {
    description:
      "Our technical team has been notified. Please try refreshing the page.",
    duration: 5000,
  });
};

window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise rejection caught:", event.reason);
  toast.error("Network or Server Error", {
    description:
      "Failed to communicate with the server. Check your connection.",
  });
});

app.use(router);
app.mount("#app");
