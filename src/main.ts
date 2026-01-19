import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";
import Tooltip from "primevue/tooltip";
import i18n from "@/plugins/i18n";
import App from "./App.vue";
import "./assets/style.css";
import "primeicons/primeicons.css";
import {
  ModuleRegistry,
  BarSeriesModule,
  LineSeriesModule,
  PieSeriesModule,
  DonutSeriesModule,
  NumberAxisModule,
  CategoryAxisModule,
  LegendModule,
  LocaleModule,
} from "ag-charts-community";
import { AnimationModule } from "ag-charts-enterprise";
import { initTheme } from "@/composables/theme";

ModuleRegistry.registerModules([
  BarSeriesModule,
  LineSeriesModule,
  PieSeriesModule,
  DonutSeriesModule,
  NumberAxisModule,
  CategoryAxisModule,
  LegendModule,
  LocaleModule,
  AnimationModule,
]);

// Define custom preset with azia (purple-blue) as primary color
const AziaPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#f5f1fa",
      100: "#ebe4f5",
      200: "#d7c9eb",
      300: "#b99bdb",
      400: "#9b6dc9",
      500: "#6F42C1",
      600: "#5a32a3",
      700: "#4a2987",
      800: "#3d226e",
      900: "#321c5a",
      950: "#1f1038",
    },
    surface: {
      50: "{slate.50}",
      100: "{slate.100}",
      200: "{slate.200}",
      300: "{slate.300}",
      400: "{slate.400}",
      500: "{slate.500}",
      600: "{slate.600}",
      700: "{slate.700}",
      800: "{slate.800}",
      900: "{slate.900}",
      950: "{slate.950}",
    },
  },
  components: {
    button: {
      root: {
        borderRadius: "0.375rem",
        roundedBorderRadius: "0.75rem",
      },
    },
  },
});

const app = createApp(App);

app.use(i18n);
app.use(PrimeVue, {
  theme: {
    preset: AziaPreset,
    options: {
      darkModeSelector: ".app-dark",
    },
  },
});

app.directive("tooltip", Tooltip);
app.use(ToastService);

// Global error handler — safety net for unhandled errors
app.config.errorHandler = (err) => {
  console.error(err);
};

// Initialize theme from localStorage (must be after PrimeVue is installed)
initTheme();

app.mount("#app");
