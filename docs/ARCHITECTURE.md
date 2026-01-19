# Architecture

## Widget Factory Pattern

Widgets are defined as `DashboardWidget` objects that encapsulate configuration and data fetching:

```typescript
import type { DashboardWidget, InitParams } from "@/models/dashboardWidget";

export function getMyWidget(id: number): DashboardWidget {
  return {
    layout: {x: 0, y: 0, w: 4, h: 8, i: id, minW: 2, minH: 6},
    type: "bar",
    displayName: "My Widget",
    initialize: async ({period, params, callbacks}: InitParams) => {
      const data = await fetchData(period);

      return {
        header: {
          title: "My Widget",
          subtitleItems: [{label: "2024"}],
        },
        data: {
          type: "bar",
          data: transformedData,
          series: chartSeries,
        },
      };
    },
  };
}
```

## State Management

State is managed through composables composed into `DashboardView`:

- **useGridLayout** - Grid calculations, breakpoint handling, responsive layout caching
- **useWidgetManager** - Widget loading states, runtime state tracking, `initialize()` orchestration
- **useGridDragDrop** - Drag events, grid coordinate calculation, palette ↔ dashboard transfers
- **useLayoutPersistence** - Save/restore layout from localStorage

## Data Flow

1. `DashboardView` holds root state: `widgetItems`, `paletteWidgets`, `globalPeriod`, `editModeActive`
2. Period changes trigger `watch(globalPeriod)` → `initializeWidgets()` for all widgets
3. Drag-drop from palette adds widget to dashboard and calls its `initialize()`
4. Widget components receive data through `useWidgetManager` accessors

## Component Hierarchy

```
DashboardView (orchestrator)
├── DashboardHeader (title + ThemeSwitcher)
├── DashboardToolbar (period selector, edit toggle, demo controls)
├── GridLayout (responsive drag-and-drop grid)
│   └── GridItem → WidgetChart or WidgetKpi
│       └── WidgetWrapper (loading/error/content shell)
│           └── AgChart / KpiCard (rendering)
├── DashboardEmptyState (when grid is empty)
└── DashboardPalette (edit mode widget catalog)
```

## Responsive Grid System

The dashboard uses a 5-breakpoint responsive grid system with per-breakpoint layout persistence:

| Breakpoint | Min Width | Columns | Use Case      |
|------------|-----------|---------|---------------|
| `lg`       | 1200px    | 12      | Desktop       |
| `md`       | 996px     | 10      | Small desktop |
| `sm`       | 768px     | 6       | Tablet        |
| `xs`       | 480px     | 4       | Large mobile  |
| `xxs`      | 0px       | 2       | Small mobile  |

When widgets are first placed at the design breakpoint (`lg`), the `computeWidgetPositions` bin-packing algorithm
automatically computes fitted layouts for all other breakpoints by scaling widget widths proportionally and re-flowing
positions. User customizations at each breakpoint are cached independently in `breakpointLayouts` and persisted to
localStorage.

## Chart Abstraction

`AgChart` handles all chart types (bar, line, pie, donut, horizontalBar) through a single polymorphic component. Widget
factory functions in `mock/widgetItems/` produce chart data using transform utilities:

- **`barChartTransform.ts`** — Converts row-based data into AG Charts bar/horizontal-bar series with optional
  year-over-year comparison stacks
- **`lineChartTransform.ts`** — Builds line/area series with period labels and comparison overlays
- **`chartTheme.ts`** — Generates AG Charts theme config that syncs with the app's Tailwind/PrimeVue theme colors

Each transform returns `{ data, series, axes? }` which maps directly to `AgChartProps`, keeping widget definitions
declarative.

## Project Structure

```
src/
├── components/
│   ├── dashboard/               # Dashboard orchestration
│   │   ├── DashboardView.vue    # Main container & state management
│   │   ├── DashboardToolbar.vue # Period selector, edit toggle
│   │   ├── DashboardPalette.vue # Widget palette (edit mode)
│   │   ├── DashboardHeader.vue
│   │   └── DashboardEmptyState.vue
│   ├── widgets/                 # Widget components
│   │   ├── WidgetChart.vue      # Chart widget container
│   │   ├── WidgetKpi.vue        # KPI widget container
│   │   ├── WidgetWrapper.vue    # Loading/error states shell
│   │   ├── WidgetHeader.vue
│   │   ├── WidgetPlaceholder.vue
│   │   ├── AgChart.vue          # AG Charts renderer
│   │   ├── KpiCard.vue
│   │   └── DonutChart.vue
│   └── ThemeSwitcher.vue        # Theme toggle component
├── composables/
│   ├── useGridLayout.ts         # Grid calculations & breakpoints
│   ├── useGridDragDrop.ts       # Drag and drop logic
│   ├── useWidgetManager.ts      # Widget state & initialization
│   ├── useDragHandle.ts         # Drag handle behavior
│   ├── useLayoutPersistence.ts  # localStorage persistence
│   ├── useKeyboardShortcuts.ts  # Keyboard shortcut handlers
│   ├── useDemoFeatures.ts       # Demo simulation controls
│   └── theme/                   # Theme management
│       ├── useTheme.ts          # Theme composable
│       ├── palettes.ts          # Color palette definitions
│       ├── storage.ts           # Theme persistence
│       └── types.ts             # Theme type definitions
├── models/                      # TypeScript interfaces
│   ├── dashboardWidget.ts       # Widget types & interfaces
│   ├── layoutItem.ts            # Grid layout types
│   └── datePresets.ts           # Date range preset definitions
├── mock/
│   ├── mockWidgets.ts           # Widget collection & registration
│   ├── mockData.ts              # Data simulation utilities
│   └── widgetItems/
│       └── saas/                # SaaS metrics widgets
│           └── *.ts             # Widget factory functions
├── plugins/
│   └── i18n.ts                  # vue-i18n configuration
├── utils/
│   ├── barChartTransform.ts     # Bar chart data transforms
│   ├── lineChartTransform.ts    # Line chart data transforms
│   ├── chartHelpers.ts          # Shared chart utilities
│   ├── chartTheme.ts            # AG Charts theme config
│   ├── computeWidgetPositions.ts # Bin-packing algorithm
│   ├── layoutUtils.ts           # Layout calculation helpers
│   └── formatters.ts            # Number & date formatters
├── locales/
│   └── en.json                  # English translations
├── App.vue                      # Root component
└── main.ts                      # Application entry point
```

## Widget Types

| Type            | Description                   |
|-----------------|-------------------------------|
| `bar`           | Vertical bar chart            |
| `horizontalBar` | Horizontal bar chart          |
| `line`          | Line/area chart               |
| `pie`           | Pie chart                     |
| `donut`         | Donut chart with center label |
| `kpi`           | Key performance indicators    |
