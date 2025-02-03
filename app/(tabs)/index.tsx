import { getApiV1JwchCourseList } from '@/api/generate';
import PageContainer from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import usePersistedQuery from '@/hooks/usePersistedQuery';
import { useState } from 'react';
import { View } from 'react-native';

export default function HomePage() {
  const [term, setTerm] = useState('202401');
  const [currentTab, setCurrentTab] = useState('account');

  const { data, isLoading } = usePersistedQuery({
    queryKey: ['getApiV1JwchCourseList', term],
    queryFn: () =>
      getApiV1JwchCourseList({
        term,
      }),
  });
  async function test2() {
    const data = {
      term: '202401',
    };
    // const res = await getApiV1JwchUserInfo(data);
    // Alert.alert(JSON.stringify(res));
  }

  return (
    <>
      <PageContainer className="justify-center p-6">
        <View>
          <Text>{isLoading}</Text>
          <Input value={term} onChangeText={text => setTerm(text)} />
          {/* <Text>{JSON.stringify(data, null, 2)}</Text> */}

          <Button
            onPress={() => {
              test2();
            }}
          >
            <Text>ss2</Text>
          </Button>

          <Button variant="link">
            <Text>link</Text>
          </Button>
        </View>

        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="mx-auto w-full max-w-[400px] flex-col gap-1.5"
        >
          <TabsList className="w-full flex-row">
            <TabsTrigger value="account" className="flex-1">
              <Text>Account</Text>
            </TabsTrigger>
            <TabsTrigger value="password" className="flex-1">
              <Text>Password</Text>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Make changes to your account here. Click save when you're done.</CardDescription>
              </CardHeader>
              <CardContent className="native:gap-2 gap-4">
                <View className="gap-1">
                  <Label nativeID="name">Name</Label>
                  <Input aria-aria-labelledby="name" defaultValue="Pedro Duarte" />
                </View>
                <View className="gap-1">
                  <Label nativeID="username">Username</Label>
                  <Input id="username" defaultValue="@peduarte" />
                </View>
              </CardContent>
              <CardFooter>
                <Button>
                  <Text>Save changes</Text>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password here. After saving, you'll be logged out.</CardDescription>
              </CardHeader>
              <CardContent className="native:gap-2 gap-4">
                <View className="gap-1">
                  <Label nativeID="current">Current password</Label>
                  <Input placeholder="********" aria-labelledby="current" secureTextEntry />
                </View>
                <View className="gap-1">
                  <Label nativeID="new">New password</Label>
                  <Input placeholder="********" aria-labelledby="new" secureTextEntry />
                </View>
              </CardContent>
              <CardFooter>
                <Button>
                  <Text>Save password</Text>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </>
  );
}
