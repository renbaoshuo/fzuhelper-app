/* eslint-disable */
// @ts-ignore
import * as API from './types';
import request from '../axios';

/** 学期信息 GET /api/v1/terms/info https://apifox.com/web/project/3275694/apis/api-227251089-run */
export async function getApiV1TermsInfo(
  // 叠加生成的Param类型 (非body参数openapi默认没有生成对象)
  params: API.getApiV1TermsInfoParams,
  options?: { [key: string]: unknown }
) {
  return request<{
    code: string;
    message: string;
    data: {
      term_id: string;
      term: string;
      school_year: string;
      events: { name: string; start_date: string; end_date: string }[];
    };
  }>('/api/v1/terms/info', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 学期列表 GET /api/v1/terms/list https://apifox.com/web/project/3275694/apis/api-227251088-run */
export async function getApiV1TermsList(options?: { [key: string]: unknown }) {
  return request<{
    code: string;
    message: string;
    data: {
      current_term: string;
      terms: {
        term_id: string;
        school_year: string;
        term: string;
        start_date: string;
        end_date: string;
      }[];
    };
  }>('/api/v1/terms/list', {
    method: 'GET',
    ...(options || {}),
  });
}
