import type { Course, CourseScheduleRule } from '@/backend';

export type ParsedCourse = Omit<Course, 'rawAdjust' | 'rawScheduleRules' | 'scheduleRules'> & CourseScheduleRule;

export function parseCourses(courses: Course[]): ParsedCourse[] {
  const parsedCourses = courses.flatMap(course =>
    course.scheduleRules.map(rule => {
      const { rawAdjust, rawScheduleRules, scheduleRules, ...rest } = course;

      return {
        ...rest,
        ...rule,
      };
    }),
  );

  return parsedCourses;
}

export function getDatesByWeek(semesterStart: string, currentWeek: number): string[] {
  const startDate = new Date(semesterStart);
  const startDayOfWeek = (startDate.getDay() + 6) % 7; // 将星期日（0）转换为 6，其他天数减 1 对应星期一到星期六
  const adjustedStartDate = new Date(startDate);

  // 如果学期开始日期不是星期一，则调整到最近的星期一
  adjustedStartDate.setDate(startDate.getDate() - startDayOfWeek);

  const firstDayOfWeek = new Date(adjustedStartDate);
  firstDayOfWeek.setDate(firstDayOfWeek.getDate() + (currentWeek - 1) * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(firstDayOfWeek);
    date.setDate(firstDayOfWeek.getDate() + i);
    return date.toISOString().split('T')[0]; // 返回日期字符串格式 YYYY-MM-DD
  });
}
