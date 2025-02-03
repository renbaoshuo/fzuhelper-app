import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import CoursePage from '@/components/course/course-page';

import { getApiV1TermsList } from '@/api/generate';
import { SemesterList } from '@/backend';
import Loading from '@/components/loading';
import type { CourseSetting, LocateDateResult } from '@/interface';
import { COURSE_SETTINGS_KEY } from '@/lib/constants';
import locateDate from '@/utils/locate-date';
import normalizeCourseSetting from '@/utils/normalize-course-setting';

export default function HomePage() {
  const [config, setConfig] = useState<CourseSetting | null>(null);
  const [locateDateResult, setLocateDateResult] = useState<LocateDateResult | null>(null);
  const [semesterList, setSemesterList] = useState<SemesterList>([]);

  useEffect(() => {
    locateDate().then(async res => {
      setLocateDateResult(res);

      const setting = await AsyncStorage.getItem(COURSE_SETTINGS_KEY);
      const parsedSettings = normalizeCourseSetting(setting ? JSON.parse(setting) : { selectedSemester: res.semester });

      setConfig(parsedSettings);
    });
    getApiV1TermsList().then(res => {
      setSemesterList(res.data.data.terms);
    });
  }, []);

  return config && locateDateResult ? (
    <CoursePage config={config} locateDateResult={locateDateResult} semesterList={semesterList} />
  ) : (
    <Loading />
  );
}
