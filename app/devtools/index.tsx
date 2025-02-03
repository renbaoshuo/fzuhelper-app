import PageContainer from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ACCESS_TOKEN_KEY, JWCH_COOKIES_KEY, JWCH_ID_KEY, YMT_ACCESS_TOKEN_KEY } from '@/lib/constants';
import UserLogin from '@/lib/user-login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, Stack, router } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { toast } from 'sonner-native';
import { WebParams } from '../(guest)/web';

const NAVIGATION_TITLE = 'Developer Tools';

export default function HomePage() {
  const login = new UserLogin();
  const testValidateCodeVerify = async () => {
    try {
      const captchaImage = await login.getCaptcha();
      const captcha = await login.autoVerifyCaptcha(captchaImage);
      toast.success('验证码识别成功，结果为：' + captcha);
    } catch (error) {
      toast.error('验证码识别失败：' + error);
    }
  };

  // 设置过期的 jwch cookie
  const setExpiredCookie = async () => {
    const cookie = await AsyncStorage.getItem(JWCH_COOKIES_KEY);
    // 经过验证，每个 cookie 的后几位都是属于 ASP.NET_SessionId 的，删除后 5 个字母，会直接导致 cookie 过期
    const expiredCookie = cookie?.slice(0, -5);
    await AsyncStorage.setItem(JWCH_COOKIES_KEY, expiredCookie || '');
    toast.success('已经设置过期的 cookie');
  };

  // 设置过期的服务端（west2-online） access token
  const setExpiredAccessToken = async () => {
    await AsyncStorage.setItem(
      ACCESS_TOKEN_KEY,
      'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjowLCJleHAiOjE3MDAxMTA5MjksImlhdCI6MTY5OTUwNjEyOSwiaXNzIjoid2VzdDItb25saW5lIn0.wk108E9cho0wb6dOU_jYQQN1_K0Z_XAh4-mrBzJcgn1nCgsSHJHn8D6RW5T6sDhl1jQdSCrkOeXqb7egFHXMCA',
    );
    toast.success('已经设置过期的 AccessToken');
  };

  // 设置过期的服务端（一码通） access token
  const setInvalidAccessTokenYmt = async () => {
    await AsyncStorage.setItem(
      YMT_ACCESS_TOKEN_KEY,
      'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjowLCJleHAiOjE3MDAxMTA5MjksImlhdCI6MTY5OTUwNjEyOSwiaXNzIjoid2VzdDItb25saW5lIn0.wk108E9cho0wb6dOU_jYQQN1_K0Z_XAh4-mrBzJcgn1nCgsSHJHn8D6RW5T6sDhl1jQdSCrkOeXqb7egFHXMCA',
    );
    toast.success('已经为一码通设置无效的 AccessToken');
  };

  return (
    <>
      <Stack.Screen options={{ title: NAVIGATION_TITLE }} />

      <PageContainer>
        <KeyboardAwareScrollView className="h-full" keyboardShouldPersistTaps="handled">
          {/* 导航相关功能 */}
          <Text className="m-3 my-4 text-lg font-bold">Manager</Text>
          <Link href="/devtools/async-storage-list" asChild>
            <Button>
              <Text>AsyncStorage Manager</Text>
            </Button>
          </Link>
          <Link href="/devtools/push-tools" asChild>
            <Button>
              <Text>Push Tools</Text>
            </Button>
          </Link>

          {/* Toast 示例 */}
          <Text className="m-3 my-4 text-lg font-bold">Toast</Text>
          <Button onPress={() => toast('Hello world!')}>
            <Text>Show Default Toast</Text>
          </Button>
          <Button onPress={() => toast.success('success')}>
            <Text>Show Success Toast</Text>
          </Button>

          {/* 页面跳转 */}
          <Text className="m-3 my-4 text-lg font-bold">Quick Links</Text>
          <Link href="/(guest)/academic-login" asChild>
            <Button>
              <Text>Login Page (No way back)</Text>
            </Button>
          </Link>
          <Button
            onPress={async () => {
              const params: WebParams = {
                url:
                  'https://jwcjwxt2.fzu.edu.cn:81/student/glxk/xqxk/xqxk_cszt.aspx?id=' +
                  (await AsyncStorage.getItem(JWCH_ID_KEY)),
                jwchCookie: (await AsyncStorage.getItem(JWCH_COOKIES_KEY)) ?? undefined, // Cookie（可选）
                title: '(Web 测试) 选课', // 页面标题（可选）
              };

              router.push({
                pathname: '/(guest)/web',
                params, // 传递参数
              });
            }}
          >
            <Text>Choose Course (web test)</Text>
          </Button>
          <Link href="/+not-found" asChild>
            <Button>
              <Text>Not Found Page</Text>
            </Button>
          </Link>

          {/* 功能测试 */}
          <Text className="m-3 my-4 text-lg font-bold">Shortcut</Text>
          <Button onPress={testValidateCodeVerify}>
            <Text>Test Code Verify</Text>
          </Button>
          <Button onPress={setExpiredCookie}>
            <Text>Set Expired Cookie</Text>
          </Button>
          <Button onPress={setExpiredAccessToken}>
            <Text>Set Expired AccessToken (west2-online)</Text>
          </Button>
          <Button onPress={setInvalidAccessTokenYmt}>
            <Text>Set Invalid AccessToken (ymt)</Text>
          </Button>
        </KeyboardAwareScrollView>
      </PageContainer>
    </>
  );
}
