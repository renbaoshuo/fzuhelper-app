import { getApiV1TermsInfo } from '@/api/generate';
import type { LocateDateResult } from '@/interface';
import { get } from '@/modules/native-request';

/*
返回内容（文本，这个注释也是它直接返回的）：
var week = "23"; //定义当前第几周
var xn = "2024";  //定义当前学年
var xq = "01";  //定义当前学期
*/
const JWCH_LOCATE_DATE_URL = 'https://jwcjwxt2.fzu.edu.cn:82/week.asp';
// 基于教务处的数据定位今天是第几周，以及今天的日期
// 返回一个对象，包含 date（当前日期）、week（当前周数）、day（当前星期几）、semester（当前学期，格式样例：202401）、semesterStart（学期开始日期）
// e.g. { date: '2024-06-01', week: 23, day: 3, semester: '202401', semesterStart: '2024-03-04' }
export default async function locateDate(): Promise<LocateDateResult> {
  const response = await get(JWCH_LOCATE_DATE_URL, { responseType: 'text' });
  // 确保 data 是字符串
  const data = typeof response.data === 'string' ? response.data : new TextDecoder('utf-8').decode(response.data);
  console.log(data);

  // 使用 `s` 标志（dotAll 模式）以支持匹配多行内容
  const match = data.match(/var week = "(\d+)";\s*\/\/.*\s*var xn = "(\d{4})";\s*\/\/.*\s*var xq = "(\d{2})";/);
  if (!match) {
    throw new Error('Failed to parse response from JWCH_LOCATE_DATE_URL');
  }
  const [week, xn, xq] = match.slice(1).map(Number);

  // 获取当前日期
  const date = new Date();
  // 提取星期几（1 表示周一，7 表示周日）
  const day = date.getDay() === 0 ? 7 : date.getDay();
  // 拼接学期信息，xq 如果不足 2 位需要补前导零
  const semester = `${xn}${xq.toString().padStart(2, '0')}`;
  // 格式化日期为 YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];

  // 获取学期开始日期，这个需要爬取校历，参数需要有学期信息
  const semesterStartResponse = await getApiV1TermsInfo({ term: semester });

  console.log(semesterStartResponse);

  // 检查 API 响应是否正常
  if (!semesterStartResponse || semesterStartResponse.status !== 200) {
    throw new Error('Failed to fetch semester start date from API');
  }

  // 提取事件列表
  const events = semesterStartResponse.data.data.events;

  // 查找 name 为“正式上课”的事件
  const startClassEvent = events.find(event => event.name === '正式上课');
  if (!startClassEvent) {
    throw new Error('Failed to find "正式上课" event in API response');
  }

  // 提取 start_date
  const semesterStart = startClassEvent.start_date;

  return { date: formattedDate, week, day, semester, semesterStart };
}
