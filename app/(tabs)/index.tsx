import { Button, Text, TextInput } from 'react-native';

import { getApiV1JwchCourseList, getApiV1JwchUserInfo } from '@/api/generate';
import { ThemedView } from '@/components/ThemedView';
import usePersistedQuery from '@/hooks/usePersistedQuery';
import { userLogin } from '@/utils/user';
import { useState } from 'react';

export default function HomePage() {
  const [term, setTerm] = useState('202401');
  const { status, data, error, isLoading } = usePersistedQuery({
    queryKey: ['getApiV1JwchCourseList', term],
    queryFn: () =>
      getApiV1JwchCourseList({
        term,
      }),
  });
  console.log(term, data, error);
  async function test() {
    // 保存账号密码
    const data = {
      id: '0',
      password: '0',
    };
    await userLogin(data);
  }
  async function test2() {
    const data = {
      term: '202401',
    };
    const res = await getApiV1JwchUserInfo(data);
    // console.log(res);
  }

  console.log(isLoading);
  return (
    <>
      <ThemedView>
        <Text>{isLoading}</Text>
        <TextInput value={term} onChangeText={text => setTerm(text)} />
        <Text>{JSON.stringify(data, null, 2)}</Text>

        <Button
          title="sss"
          onPress={() => {
            test();
          }}
        />
        <Button
          title="ss2"
          onPress={() => {
            test2();
          }}
        />
      </ThemedView>
    </>
  );
}
