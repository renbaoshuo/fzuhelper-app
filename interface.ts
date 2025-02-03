export interface CourseSetting {
  selectedSemester: string;
  calendarExportEnabled: boolean;
  showNonCurrentWeekCourses: boolean;
  autoImportAdjustmentEnabled: boolean;
}

export interface LocateDateResult {
  date: string;
  week: number;
  day: number;
  semester: string;
  semesterStart: string;
}
