/**
 * Global test setup — mocks for modules imported at top-level by utils.
 */
import { vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'

// Mock @/plugins/i18n — used by chartHelpers, formatters, barChartTransform
vi.mock('@/plugins/i18n', () => ({
  default: {
    global: {
      t: (key: string) => key,
      n: (value: number, options?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat('en-US', options).format(value),
    },
  },
}))

// Mock @/composables/useDragHandle — used by WidgetWrapper
vi.mock('@/composables/useDragHandle', () => ({
  useDragHandle: () => ({ draggable: ref(false), dragHandle: ref(null) }),
}))

// Mock PrimeVue components — direct imports in SFCs require module-level mocks
vi.mock('primevue/button', () => ({
  default: defineComponent({
    name: 'PButton',
    props: { icon: String, severity: String, size: String, text: Boolean, ariaLabel: String, label: String },
    emits: ['click'],
    setup(props, { emit, slots }) {
      return () => h('button', { class: props.icon, onClick: () => emit('click') },
        slots.default ? slots.default() : undefined,
      )
    },
  }),
}))

vi.mock('primevue/popover', () => ({
  default: defineComponent({
    name: 'PPopover',
    setup(_, { slots, expose }) {
      expose({ toggle: () => {} })
      return () => h('div', { class: 'popover-stub' }, slots.default?.() as unknown as undefined)
    },
  }),
}))

vi.mock('primevue/divider', () => ({
  default: defineComponent({
    name: 'PDivider',
    setup() {
      return () => h('hr')
    },
  }),
}))

vi.mock('primevue/checkbox', () => ({
  default: defineComponent({
    name: 'PCheckbox',
    props: { modelValue: Boolean, binary: Boolean, inputId: String },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
      return () => h('input', {
        type: 'checkbox',
        checked: props.modelValue,
        onChange: () => emit('update:modelValue', !props.modelValue),
      })
    },
  }),
}))

vi.mock('primevue/datepicker', () => ({
  default: defineComponent({
    name: 'PDatePicker',
    props: { modelValue: [Date, Object], dateFormat: String, showIcon: Boolean, placeholder: String, minDate: Date, maxDate: Date, invalid: Boolean, size: String, fluid: Boolean },
    setup() {
      return () => h('input', { type: 'text', class: 'datepicker-stub' })
    },
  }),
}))

// Mock DonutChart — direct import in KpiCard
vi.mock('@/components/widgets/donutchart/DonutChart.vue', () => ({
  default: defineComponent({
    name: 'DonutChart',
    props: { values: Array, size: Number, colorIdxOffset: Number },
    setup() {
      return () => h('div', { class: 'donut-chart-stub' })
    },
  }),
}))

// Mock KpiCard — direct import in WidgetHeader
vi.mock('@/components/widgets/kpicard/KpiCard.vue', () => ({
  default: defineComponent({
    name: 'KpiCard',
    props: { label: String, leadingLabel: String, icon: String, iconWrapperClass: String, iconWrapperColor: String },
    setup(props) {
      return () => h('div', { class: 'kpi-card-stub' }, props.label)
    },
  }),
}))

// Mock vee-validate — used by DashboardToolbar
vi.mock('vee-validate', () => ({
  useForm: () => ({
    handleSubmit: (fn: (...args: unknown[]) => void) => fn,
    resetForm: () => {},
    errors: ref({}),
    meta: ref({ valid: true }),
  }),
  useField: (name: string) => ({
    value: ref(null),
    errorMessage: ref(''),
    meta: ref({ valid: true }),
    name,
  }),
}))

// Mock @/composables/theme — used by chartHelpers, formatters
// Returns deterministic palette values for predictable assertions
const MOCK_MAIN_PALETTE = ['#6F42C1', '#007BFF', '#17A2B8', '#00CCCC', '#0DCAF0', '#5A32A3', '#0056b3']
const MOCK_LIGHT_PALETTE = ['#C9B8E5', '#99CDFF', '#8FE0EB', '#99EBEB', '#A8ECFA', '#C4B0E3', '#8CBAFF']
const MOCK_ALL_PALETTE = [...MOCK_MAIN_PALETTE, ...MOCK_LIGHT_PALETTE]

vi.mock('@/composables/theme', () => ({
  getColorFromPalette: (index: number) => MOCK_ALL_PALETTE[index % MOCK_ALL_PALETTE.length],
  getLightColorFromPalette: (index: number) => MOCK_LIGHT_PALETTE[index % MOCK_LIGHT_PALETTE.length],
  getMainColorPalette: () => MOCK_MAIN_PALETTE,
}))
