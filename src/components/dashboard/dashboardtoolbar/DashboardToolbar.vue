<template>
  <div class="dashboard-toolbar">
    <div class="dashboard-toolbar-left">
      <!-- Period picker button + popover -->
      <div v-if="!hidePeriod" class="period-picker-wrapper">
        <PButton
          v-tooltip.bottom="t('toolbar.selectPeriod')"
          :aria-label="t('toolbar.selectPeriod')"
          size="small"
          rounded
          @click="togglePopover"
        >
          <template #default>
            <i class="pi pi-calendar" aria-hidden="true" />
            <span class="period-picker-btn-label p-button-label">{{ periodButtonLabel }}</span>
            <i class="pi pi-chevron-down" aria-hidden="true" />
          </template>
        </PButton>

        <PPopover ref="popoverRef" @hide="initFromProps">
          <div class="period-popover-content">
            <div class="period-popover-header">
              <span class="period-popover-title">{{ t("toolbar.selectPeriod") }}</span>
            </div>

            <!-- Date presets -->
            <div class="period-presets">
              <button
                v-for="preset in datePresets"
                :key="preset.code"
                type="button"
                class="period-preset-btn"
                :class="{ active: isPresetActive(preset) }"
                @click="selectPreset(preset)"
              >
                {{ t(`datePresets.${preset.code}`) }}
              </button>
            </div>

            <!-- Date range inputs -->
            <div class="date-inputs-wrapper">
              <div class="date-input-group">
                <label class="date-input-label">{{ t("toolbar.from") }}</label>
                <PDatePicker
                  v-model="dateFrom"
                  dateFormat="M dd, yy"
                  :showIcon="true"
                  :placeholder="t('toolbar.startDate')"
                  :minDate="minDate"
                  :maxDate="maxDate"
                  :invalid="!!validationErrors.dateFrom"
                  size="small"
                  fluid
                />
                <small v-if="validationErrors.dateFrom" class="date-input-error" role="alert">
                  {{ validationErrors.dateFrom }}
                </small>
              </div>
              <div class="date-input-group">
                <label class="date-input-label">{{ t("toolbar.to") }}</label>
                <PDatePicker
                  v-model="dateTo"
                  dateFormat="M dd, yy"
                  :showIcon="true"
                  :placeholder="t('toolbar.endDate')"
                  :minDate="minDate"
                  :maxDate="maxDate"
                  :invalid="!!validationErrors.dateTo"
                  size="small"
                  fluid
                />
                <small v-if="validationErrors.dateTo" class="date-input-error" role="alert">
                  {{ validationErrors.dateTo }}
                </small>
              </div>
            </div>

            <!-- Compare toggle -->
            <div class="compare-toggle-wrapper">
              <PCheckbox v-model="compareActive" :binary="true" inputId="compareToggle" />
              <label for="compareToggle" class="compare-toggle-label">
                {{ t("toolbar.compareWithLastYear") }}
              </label>
            </div>

            <!-- Compare period preview -->
            <div
              v-if="compareActive && compareDates.from && compareDates.to"
              class="compare-preview"
            >
              <i class="pi pi-info-circle compare-preview-icon" />
              <span>
                {{ formatDate(compareDates.from, "ll") }} →
                {{ formatDate(compareDates.to, "ll") }}
              </span>
            </div>

            <div class="period-popover-actions">
              <PButton
                :label="t('toolbar.cancel')"
                severity="secondary"
                outlined
                size="small"
                @click="cancelChanges"
              />
              <PButton
                :label="t('toolbar.apply')"
                severity="primary"
                size="small"
                :disabled="!hasChanges || hasErrors"
                @click="applyPeriod"
              />
            </div>
          </div>
        </PPopover>
      </div>
      <PButton
        v-tooltip.bottom="t('toolbar.refresh')"
        icon="pi pi-refresh"
        :label="t('toolbar.refresh')"
        class="shortcut-button"
        severity="secondary"
        size="small"
        outlined
        rounded
        @click="$emit('refresh')"
      />
    </div>

    <div class="dashboard-toolbar-right">
      <PButton
        v-if="editModeActive"
        v-tooltip.bottom="t('toolbar.simulateLoading')"
        icon="pi pi-spin pi-spinner"
        :label="t('toolbar.simulateLoading')"
        severity="secondary"
        size="small"
        outlined
        rounded
        @click="$emit('simulate-loading')"
      />
      <PButton
        v-if="editModeActive"
        v-tooltip.bottom="t('toolbar.simulateError')"
        icon="pi pi-exclamation-triangle"
        :label="t('toolbar.simulateError')"
        severity="danger"
        size="small"
        outlined
        rounded
        @click="$emit('simulate-error')"
      />
      <PButton
        v-if="!hideEdit"
        v-tooltip.bottom="t('toolbar.resetDashboard')"
        icon="pi pi-replay"
        :label="t('toolbar.resetDashboard')"
        severity="secondary"
        size="small"
        outlined
        rounded
        @click="$emit('reset')"
      />
      <PButton
        v-if="!hideEdit"
        v-tooltip.bottom="editModeActive ? t('toolbar.done') : t('toolbar.editDashboard')"
        :icon="editModeActive ? 'pi pi-check' : 'pi pi-pencil'"
        :label="editModeActive ? t('toolbar.done') : t('toolbar.editDashboard')"
        :class="{ 'shortcut-button': !editModeActive }"
        size="small"
        rounded
        @click="toggleEditMode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useField, useForm } from "vee-validate";
import dayjs from "dayjs";
import PButton from "primevue/button";
import PPopover from "primevue/popover";
import PCheckbox from "primevue/checkbox";
import PDatePicker from "primevue/datepicker";
import { formatDate } from "@/utils/formatters";
import type { WidgetPeriod } from "@/models/dashboardWidget";
import { type DatePreset, getDatePresets } from "@/models/datePresets";
import type { DashboardToolbarEmits, DashboardToolbarProps } from "./DashboardToolbar";

const { t } = useI18n();

interface PeriodFormValues {
  dateFrom: Date | null;
  dateTo: Date | null;
}

const props = defineProps<DashboardToolbarProps>();

const emit = defineEmits<DashboardToolbarEmits>();

// Popover ref
const popoverRef = ref();

// Period constraints
const minDate = dayjs().startOf("year").toDate();
const maxDate = dayjs().toDate();

// VeeValidate form setup
const {
  handleSubmit,
  resetForm,
  errors: validationErrors,
} = useForm<PeriodFormValues>({
  validationSchema: {
    dateFrom: (value: Date | null) => {
      if (!value) return t("validation.dateFromRequired");
      return true;
    },
    dateTo: (value: Date | null, ctx: { form: PeriodFormValues }) => {
      if (!value) return t("validation.dateToRequired");
      if (ctx.form.dateFrom && value < ctx.form.dateFrom) {
        return t("validation.dateToAfterFrom");
      }
      return true;
    },
  },
});

const { value: dateFrom } = useField<Date | null>("dateFrom");
const { value: dateTo } = useField<Date | null>("dateTo");
const compareActive = ref(false);

// Date presets
const datePresets = getDatePresets();

function selectPreset(preset: DatePreset) {
  // Clamp dates to min/max constraints
  const clampedFrom = preset.dateFrom < minDate ? minDate : preset.dateFrom;
  const clampedTo = preset.dateTo > maxDate ? maxDate : preset.dateTo;

  dateFrom.value = clampedFrom;
  dateTo.value = clampedTo;
}

function isPresetActive(preset: DatePreset): boolean {
  if (!dateFrom.value || !dateTo.value) return false;
  const fromMatch = dayjs(dateFrom.value).isSame(dayjs(preset.dateFrom), "day");
  const toMatch = dayjs(dateTo.value).isSame(dayjs(preset.dateTo), "day");
  return fromMatch && toMatch;
}

// Button label showing current period
const periodButtonLabel = computed(() => {
  if (!props.period.dateFrom || !props.period.dateTo) return t("toolbar.selectPeriod");
  const from = formatDate(props.period.dateFrom, "ll");
  const to = formatDate(props.period.dateTo, "ll");
  const hasCompare = !!props.period.compareDateFrom && !!props.period.compareDateTo;
  const baseLabel = `${from} → ${to}`;
  return hasCompare ? `${baseLabel} | ${t("widget.comparison")}` : baseLabel;
});

// Initialize local state from props
function initFromProps() {
  resetForm({
    values: {
      dateFrom: props.period.dateFrom,
      dateTo: props.period.dateTo,
    },
  });
  compareActive.value = !!props.period.compareDateFrom && !!props.period.compareDateTo;
}

// Compute last year's comparison dates
const compareDates = computed(() => {
  if (!compareActive.value || !dateFrom.value || !dateTo.value) {
    return { from: null, to: null };
  }
  return {
    from: new Date(
      dateFrom.value.getFullYear() - 1,
      dateFrom.value.getMonth(),
      dateFrom.value.getDate(),
    ),
    to: new Date(dateTo.value.getFullYear() - 1, dateTo.value.getMonth(), dateTo.value.getDate()),
  };
});

// Check if there are unsaved changes
const hasChanges = computed(() => {
  const propsHasCompare = !!props.period.compareDateFrom && !!props.period.compareDateTo;
  return (
    dateFrom.value?.getTime() !== props.period.dateFrom.getTime() ||
    dateTo.value?.getTime() !== props.period.dateTo.getTime() ||
    compareActive.value !== propsHasCompare
  );
});

// Check if there are validation errors
const hasErrors = computed(() => {
  return !!(validationErrors.value.dateFrom || validationErrors.value.dateTo);
});

// Toggle popover
function togglePopover(event: Event) {
  popoverRef.value?.toggle(event);
}

// Cancel changes and close popover
function cancelChanges() {
  initFromProps();
  popoverRef.value?.hide();
}

// Apply the period
const applyPeriod = handleSubmit((values) => {
  const newPeriod: WidgetPeriod = {
    dateFrom: values.dateFrom!,
    dateTo: values.dateTo!,
  };

  if (compareActive.value && compareDates.value.from && compareDates.value.to) {
    newPeriod.compareDateFrom = compareDates.value.from;
    newPeriod.compareDateTo = compareDates.value.to;
  }

  emit("update:period", newPeriod);
  popoverRef.value?.hide();
});

// Watch for external prop changes
watch(
  () => props.period,
  () => {
    initFromProps();
  },
  { deep: true },
);

function toggleEditMode() {
  emit("update:editModeActive", !props.editModeActive);
}

onMounted(() => {
  initFromProps();
});
</script>
