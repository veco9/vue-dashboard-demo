/**
 * Mock Widgets - SaaS / Product Analytics Dashboard
 */
import type { DashboardWidget, DashboardWidgetPartial } from "@/models/dashboardWidget";
import { computeWidgetPositions } from "@/utils/computeWidgetPositions";

// SaaS Widgets (Default)
import {
  getActiveUsersKpiWidget,
  getArpuTrendWidget,
  getArrKpiWidget,
  getChurnByReasonWidget,
  getChurnRateKpiWidget,
  getConversionFunnelWidget,
  getCustomerAcquisitionWidget,
  getCustomerSegmentsWidget,
  getFeatureAdoptionWidget,
  getMrrKpiWidget,
  getMrrTrendWidget,
  getNrrKpiWidget,
  getRevenueByPlanWidget,
  getRevenueByRegionWidget,
  getSignupTrendWidget,
  getTrialConversionKpiWidget
} from "./widgetItems/saas";

// HR Widgets (Legacy - available via getHrWidgetList)
import {
  getAbsenceTrendWidget,
  getAnnualLeaveKpiWidget,
  getEmployeesByDepartmentWidget,
  getEmployeeTurnoverKpiWidget,
  getFteWidget,
  getLiveStockWidget,
  getNewContractorsDonutWidget,
  getNewStudentsKpiWidget,
  getOvertimeByDepartmentWidget,
  getOvertimeKpiWidget,
  getSalaresByDepartmentWidget,
  getStudentTurnoverKpiWidget,
  getTotalDueKpiWidget,
  getTotalEmployeesPaletteWidget,
  getTotalEmployeesWidget,
  getTotalStudentsPaletteWidget,
  getTotalStudentsWidget,
  getTrafficSummaryKpiWidget
} from "./widgetItems/hr";

/**
 * Get all SaaS widgets for dashboard (default)
 */
export function getWidgetList(): DashboardWidget[] {
  let index = 0;

  return [
    // Row y=0: Top KPIs
    getNrrKpiWidget(index++), // x:9
    getActiveUsersKpiWidget(index++), // x:8
    getMrrKpiWidget(index++), // x:0
    getArrKpiWidget(index++), // x:3

    // Row y=3: Feature adoption + KPIs
    getFeatureAdoptionWidget(index++), // x:0, h:10
    getTrialConversionKpiWidget(index++), // x:4
    getChurnRateKpiWidget(index++), // x:6

    // Row y=6: Charts
    getMrrTrendWidget(index++), // x:4
    getChurnByReasonWidget(index++), // x:8
    getCustomerAcquisitionWidget(index++), // x:10

    // Row y=13-14: Bottom charts
    getRevenueByPlanWidget(index++), // x:0, y:13
    getSignupTrendWidget(index++), // x:4, y:14
    getRevenueByRegionWidget(index++), // x:8, y:14
  ];
}

/**
 * Get palette widgets (available to add to dashboard)
 */
export function getWidgetPaletteList(): DashboardWidget[] {
  let index = 100;

  return [
    getCustomerSegmentsWidget(index++),
    getConversionFunnelWidget(index++),
    getArpuTrendWidget(index++),
  ];
}

/**
 * Get all HR widgets for dashboard (legacy)
 */
export function getHrWidgetList(): DashboardWidget[] {
  let index = 0;

  return [
    // Row 1: KPI Widgets
    getEmployeeTurnoverKpiWidget(index++),
    getAnnualLeaveKpiWidget(index++),
    getOvertimeKpiWidget(index++),

    // Row 2: Charts
    getLiveStockWidget(index++),
    getTotalStudentsWidget(index++),
    getOvertimeByDepartmentWidget(index++),
    getFteWidget(index++),

    // Row 3: More charts
    getTotalEmployeesWidget(index++),
    getAbsenceTrendWidget(index++),
    getSalaresByDepartmentWidget(index++),
  ];
}

/**
 * Get HR palette widgets (legacy - available to add to dashboard)
 */
export function getHrWidgetPaletteList(): DashboardWidget[] {
  let index = 100;

  return [
    getEmployeesByDepartmentWidget(index++),
    getTotalDueKpiWidget(index++),
    getTotalStudentsPaletteWidget(index++),
    getNewStudentsKpiWidget(index++),
    getStudentTurnoverKpiWidget(index++),
    getNewContractorsDonutWidget(index++),
    getTotalEmployeesPaletteWidget(index++),
    getTrafficSummaryKpiWidget(index++),
  ];
}

/**
 * Removes position data so grid placement can recalculate.
 */
function clearPositions(widgets: DashboardWidget[]): DashboardWidgetPartial[] {
  return widgets.map(({ layout, ...rest }) => ({
    ...rest,
    layout: { ...layout, x: undefined, y: undefined },
  }));
}

/**
 * Returns positioned widgets for the main dashboard grid.
 */
export function getMockWidgets(columnCount: number): DashboardWidget[] {
  return computeWidgetPositions(clearPositions(getWidgetList()), { columns: columnCount });
}

/**
 * Returns positioned widgets for the palette (available to add).
 */
export function getMockPaletteWidgets(columnCount: number): DashboardWidget[] {
  return computeWidgetPositions(clearPositions(getWidgetPaletteList()), {
    columns: columnCount,
    startIndex: 100,
  });
}

/**
 * Returns positioned HR widgets for the main dashboard grid.
 */
export function getMockHrWidgets(columnCount: number): DashboardWidget[] {
  return computeWidgetPositions(clearPositions(getHrWidgetList()), { columns: columnCount });
}

/**
 * Returns positioned HR widgets for the palette (available to add).
 */
export function getMockHrPaletteWidgets(columnCount: number): DashboardWidget[] {
  return computeWidgetPositions(clearPositions(getHrWidgetPaletteList()), {
    columns: columnCount,
    startIndex: 100,
  });
}
