/* eslint-disable */
// @ts-ignore
import * as API from './types';
import request from '../axios';

/** 指定学期课表 数据源：我的选课 GET /api/v1/jwch/course/list https://apifox.com/web/project/3275694/apis/api-109631154-run */
export async function getApiV1JwchCourseList(
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.getApiV1JwchCourseListParams,
  options?: { [key: string]: unknown }
) {
  return request<{
    code: string;
    message: string;
    data: {
      name: string;
      teacher: string;
      scheduleRules: {
        location: string;
        startClass: number;
        endClass: number;
        startWeek: number;
        endWeek: number;
        weekday: number;
        single: boolean;
        double: boolean;
        adjust: boolean;
      }[];
      remark: string;
      lessonplan: string;
      syllabus: string;
      rawScheduleRules: string;
      rawAdjust: string;
    }[];
  }>('/api/v1/jwch/course/list', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 就读学期列表 GET /api/v1/jwch/term/list https://apifox.com/web/project/3275694/apis/api-257606812-run */
export async function getApiV1JwchTermList(options?: {
  [key: string]: unknown;
}) {
  return request<{ code: string; message: string; data: string[] }>(
    '/api/v1/jwch/term/list',
    {
      method: 'GET',
      ...(options || {}),
    }
  );
}
