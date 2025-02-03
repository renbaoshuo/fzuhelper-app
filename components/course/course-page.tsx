import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, Tabs, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, ScrollView, View } from 'react-native';
import { toast } from 'sonner-native';

import { Text } from '@/components/ui/text';

import DayItem from '@/components/course/day-item';
import DaysRow from '@/components/course/days-row';
import HeaderContainer from '@/components/course/header-container';
import MonthDisplay from '@/components/course/month-display';
import TimeCol from '@/components/course/time-col';

import { getApiV1JwchCourseList } from '@/api/generate';
import { SemesterList } from '@/backend';
import CalendarCol from '@/components/course/calendar-col';
import usePersistedQuery from '@/hooks/usePersistedQuery';
import type { CourseSetting, LocateDateResult } from '@/interface';
import { JWCH_COOKIES_KEY, JWCH_ID_KEY } from '@/lib/constants';
import { createGestureHandler } from '@/lib/gesture-handler';
import { getDatesByWeek, parseCourses } from '@/utils/course';

const DAYS = ['一', '二', '三', '四', '五', '六', '日'] as const;

interface CoursePageProps {
  config: CourseSetting;
  locateDateResult: LocateDateResult;
  semesterList: SemesterList;
}

const CoursePage: React.FC<CoursePageProps> = ({ config, locateDateResult, semesterList }) => {
  const [week, setWeek] = useState(1); // 当前周数
  const [date, setDate] = useState('2025-01-01'); // 当前日期
  const router = useRouter();

  const { selectedSemester: term } = config;
  const { data } = usePersistedQuery({
    queryKey: ['getApiV1JwchCourseList', term],
    queryFn: () => getApiV1JwchCourseList({ term }),
  });

  const semesterListMap = useMemo(
    () => Object.fromEntries(semesterList.map(semester => [semester.term, semester])),
    [semesterList],
  );

  useEffect(() => {
    setWeek(term === locateDateResult.semester ? locateDateResult.week : 1);
    setDate(term === locateDateResult.semester ? locateDateResult.date : semesterListMap[term].start_date);
  }, [term, locateDateResult, semesterListMap]);

  // 基于滑动手势处理器，创建手势处理对象的回调逻辑，用于 ScrollView 组件的滑动事件处理
  const { panResponder, translateX } = createGestureHandler({
    direction: 'horizontal',
    onSwipeLeft: async () => {
      setWeek(prev => prev + 1);
      const dates = getDatesByWeek(semesterListMap[term].start_date, week + 1);
      setDate(dates[0]);

      // 重置 translateX
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    },
    onSwipeRight: async () => {
      setWeek(prev => Math.max(prev - 1, 1));
      const dates = getDatesByWeek(semesterListMap[term].start_date, Math.max(week - 1, 1));
      setDate(dates[0]);

      // 重置 translateX
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    },
  });

  const schedules = useMemo(() => (data ? parseCourses(data.data.data) : []), [data]);
  const daysRowData = useMemo(() => {
    const today = new Date();
    today.setHours(today.getHours() + 8);

    const isValidDate = (d: Date) => !isNaN(d.getTime()); // 检查日期是否有效

    return Array.from({ length: 7 }, (_, i) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + i);

      const isToday =
        isValidDate(newDate) &&
        isValidDate(today) &&
        newDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];

      return {
        key: newDate.toISOString(),
        day: DAYS[i],
        date: newDate.getDate(),
        isToday,
        isWeekend: i >= 5, // i 从 0 开始，5 和 6 分别对应周六和周日
      };
    });
  }, [date]);

  // 教学大纲点击事件，这个入参会在点击时由 ScheduleItem 提供
  const onSyllabusPress = useCallback(
    async (syllabus: string) => {
      router.push({
        pathname: '/web',
        params: {
          url: `${syllabus}&id=${await AsyncStorage.getItem(JWCH_ID_KEY)}`,
          jwchCookie: await AsyncStorage.getItem(JWCH_COOKIES_KEY),
        },
      });
    },
    [router],
  );

  // 授课计划点击事件，这个入参会在点击时由 ScheduleItem 提供
  const onLessonPlanPress = useCallback(
    async (lessonPlan: string) => {
      router.push({
        pathname: '/web',
        params: {
          url: `${lessonPlan}&id=${await AsyncStorage.getItem(JWCH_ID_KEY)}`,
          jwchCookie: await AsyncStorage.getItem(JWCH_COOKIES_KEY),
        },
      });
    },
    [router],
  );

  return (
    <>
      <Tabs.Screen
        options={{
          headerTitleAlign: 'center',
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: () => <Text className="ml-4 text-2xl font-medium">课程表</Text>,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerTitle: () => (
            <Pressable onPress={() => toast.info('周数切换')} className="flex flex-row items-center">
              <Text className="mr-1 text-lg">第 {week} 周 </Text>
              <AntDesign name="caretdown" size={10} color="black" />
            </Pressable>
          ),
          // eslint-disable-next-line react/no-unstable-nested-components
          headerRight: () => (
            <Link href="/course/course-settings" asChild>
              <AntDesign name="setting" size={24} color="black" className="mr-4" />
            </Link>
          ),
        }}
      />

      <ScrollView
        {...panResponder.panHandlers} // 绑定滑动手势
        stickyHeaderIndices={[0]}
        overScrollMode="never"
        bounces={false}
      >
        <HeaderContainer>
          <MonthDisplay month={new Date(date).getMonth() + 1} />

          <DaysRow>
            {daysRowData.map(item => (
              <DayItem
                key={item.key}
                day={item.day}
                date={item.date}
                isSelected={item.isToday}
                isMuted={item.isWeekend}
              />
            ))}
          </DaysRow>
        </HeaderContainer>

        <Animated.View className="flex flex-none flex-grow flex-row py-1" style={{ transform: [{ translateX }] }}>
          <TimeCol />

          <View className="flex flex-shrink flex-grow flex-row">
            {Array.from({ length: 7 }, (_, i) => (
              <CalendarCol
                key={`${date}_${i}`}
                week={week}
                weekday={i + 1}
                schedules={schedules}
                onLessonPlanPress={onLessonPlanPress}
                onSyllabusPress={onSyllabusPress}
              />
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </>
  );
};

export default CoursePage;
