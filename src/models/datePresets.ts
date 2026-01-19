import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";

dayjs.extend(quarterOfYear);

export enum DatePresetCode {
  TODAY = "today",
  YESTERDAY = "yesterday",
  LAST_7_DAYS = "last7Days",
  THIS_WEEK = "thisWeek",
  LAST_WEEK = "lastWeek",
  THIS_MONTH = "thisMonth",
  LAST_MONTH = "lastMonth",
  THIS_QUARTER = "thisQuarter",
  YEAR_TO_DATE = "yearToDate",
}

export interface DatePreset {
  code: DatePresetCode;
  dateFrom: Date;
  dateTo: Date;
}

export function getDatePresets(): DatePreset[] {
  const now = dayjs();

  return [
    {
      code: DatePresetCode.TODAY,
      dateFrom: now.startOf("day").toDate(),
      dateTo: now.endOf("day").toDate(),
    },
    {
      code: DatePresetCode.YESTERDAY,
      dateFrom: now.subtract(1, "day").startOf("day").toDate(),
      dateTo: now.subtract(1, "day").endOf("day").toDate(),
    },
    {
      code: DatePresetCode.LAST_7_DAYS,
      dateFrom: now.subtract(6, "day").startOf("day").toDate(),
      dateTo: now.endOf("day").toDate(),
    },
    {
      code: DatePresetCode.THIS_WEEK,
      dateFrom: now.startOf("week").toDate(),
      dateTo: now.endOf("week").toDate(),
    },
    {
      code: DatePresetCode.LAST_WEEK,
      dateFrom: now.subtract(1, "week").startOf("week").toDate(),
      dateTo: now.subtract(1, "week").endOf("week").toDate(),
    },
    {
      code: DatePresetCode.THIS_MONTH,
      dateFrom: now.startOf("month").toDate(),
      dateTo: now.endOf("month").toDate(),
    },
    // {
    //   code: DatePresetCode.LAST_MONTH,
    //   dateFrom: now.subtract(1, "month").startOf("month").toDate(),
    //   dateTo: now.subtract(1, "month").endOf("month").toDate(),
    // },
    {
      code: DatePresetCode.THIS_QUARTER,
      dateFrom: now.startOf("quarter").toDate(),
      dateTo: now.endOf("quarter").toDate(),
    },
    {
      code: DatePresetCode.YEAR_TO_DATE,
      dateFrom: now.startOf("year").toDate(),
      dateTo: now.endOf("day").toDate(),
    },
  ];
}
