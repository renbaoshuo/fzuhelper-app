import type { CourseSetting } from '@/interface';

const defaultCourseSetting: CourseSetting = {
  selectedSemester: '',
  calendarExportEnabled: false,
  showNonCurrentWeekCourses: false,
  autoImportAdjustmentEnabled: false,
};

const normalizeCourseSetting = (courseSetting: Partial<CourseSetting>) => {
  return { ...defaultCourseSetting, ...courseSetting } as CourseSetting;
};

export default normalizeCourseSetting;
