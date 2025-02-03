import { getApiV1JwchCourseList, getApiV1TermsList } from '@/api/generate';

export type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (...args: any) => Promise<infer R>
  ? R
  : any;

export type SemesterList = AsyncReturnType<typeof getApiV1TermsList>['data']['data']['terms'];
export type Course = AsyncReturnType<typeof getApiV1JwchCourseList>['data']['data'][0];
export type CourseScheduleRule = Course['scheduleRules'][0];
