import { getApiV1JwchUserInfo, getApiV1LoginAccessToken } from '@/api/generate';
import { ThemedView } from '@/components/ThemedView';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSafeResponseSolve } from '@/hooks/useSafeResponseSolve';
import {
  JWCH_COOKIES_KEY,
  JWCH_ID_KEY,
  JWCH_USER_ID_KEY,
  JWCH_USER_INFO_KEY,
  JWCH_USER_PASSWORD_KEY,
} from '@/lib/constants';
import UserLogin from '@/lib/user-login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NAVIGATION_TITLE = '登录';
const URL_USER_AGREEMENT = 'https://fzuhelper.west2.online/onekey/UserAgreement.html';
const URL_PRIVACY_POLICY = 'https://fzuhelper.west2.online/onekey/FZUHelper.html';
const URL_RESET_PASSWORD = 'https://jwcjwxt2.fzu.edu.cn/Login/ReSetPassWord';

const LoginPage: React.FC = () => {
  const loginRef = useRef<UserLogin | null>(null);
  if (!loginRef.current) {
    loginRef.current = new UserLogin();
  }

  const [captchaImage, setCaptchaImage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAgree, setIsAgree] = useState(false);
  const { handleError } = useSafeResponseSolve();

  useEffect(() => {
    try {
      loginRef
        .current!.getCaptcha()
        .then(res => setCaptchaImage(`data:image/png;base64,${btoa(String.fromCharCode(...res))}`));
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '获取验证码失败');
    }
  }, []);

  // 打开用户协议
  const openUserAgreement = useCallback(() => {
    Linking.openURL(URL_USER_AGREEMENT).catch(err => Alert.alert('错误', '无法打开链接(' + err + ')'));
  }, []);

  // 打开隐私政策
  const openPrivacyPolicy = useCallback(() => {
    Linking.openURL(URL_PRIVACY_POLICY).catch(err => Alert.alert('错误', '无法打开链接(' + err + ')'));
  }, []);

  // 打开重置密码
  const openResetPassword = useCallback(() => {
    Alert.alert(
      '忘记密码',
      '本科生登录账号为学号，密码为教务处密码。\n\n点击「重置密码」，可前往教务处网站进行密码重置。',
      [
        {
          text: '重置密码',
          onPress: () =>
            Linking.openURL(URL_RESET_PASSWORD).catch(err => Alert.alert('错误', '无法打开链接(' + err + ')')),
        },
        { text: '确定', style: 'cancel' },
      ],
    );
  }, []);

  // 刷新验证码
  const refreshCaptcha = useCallback(async () => {
    try {
      const res = await loginRef.current!.getCaptcha();
      setCaptchaImage(`data:image/png;base64,${btoa(String.fromCharCode(...res))}`);
    } catch (error) {
      console.error(error);
      Alert.alert('错误', '获取验证码失败');
    }
  }, []);

  // 处理登录逻辑
  const handleLogin = useCallback(async () => {
    if (!isAgree) {
      Alert.alert('错误', '请先阅读并同意用户协议和隐私政策');
      return;
    }
    if (!username) {
      Alert.alert('错误', '请输入学号');
      return;
    }
    if (!password) {
      Alert.alert('错误', '请输入密码');
      return;
    }
    if (!captcha) {
      Alert.alert('错误', '请输入验证码');
      return;
    }

    setIsLoggingIn(true); // 禁用按钮

    try {
      // 尝试进行登录
      const { id, cookies } = await loginRef.current!.login(username, password, captcha);
      // 存储所需的信息，这里存储了学号、密码、ID 和 Cookies（后两位负责请求时发送）
      await AsyncStorage.multiSet([
        [JWCH_USER_ID_KEY, username],
        [JWCH_USER_PASSWORD_KEY, password],
        [JWCH_ID_KEY, id],
        [JWCH_COOKIES_KEY, cookies],
      ]);

      // 通过提供 id和 cookies 获取访问令牌
      await getApiV1LoginAccessToken();

      // 获取个人信息
      const result = await getApiV1JwchUserInfo();
      // 存储个人信息到本地
      AsyncStorage.setItem(JWCH_USER_INFO_KEY, JSON.stringify(result.data.data));

      // 跳转到首页
      router.push('/');
    } catch (error: any) {
      const data = handleError(error);
      if (data) {
        Alert.alert('请求失败', data.code + ': ' + data.message);
      }
      await refreshCaptcha();
    } finally {
      // 恢复按钮状态
      setIsLoggingIn(false);
    }
  }, [isAgree, username, password, captcha, refreshCaptcha, handleError]);

  return (
    <>
      <Stack.Screen options={{ title: NAVIGATION_TITLE, headerShown: false }} />

      <SafeAreaView className="bg-background">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            className="h-full"
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedView className="flex-1 justify-between px-6 py-3">
              {/* 左上角标题 */}
              <View className="ml-1 mt-14">
                <Text className="mb-2 text-4xl font-bold">本科生登录</Text>
                <Text className="text-lg text-muted-foreground">综合性最强的福大校内APP</Text>
              </View>

              {/* 页面内容 */}
              <View className="items-center justify-center">
                {/* 用户名输入框 */}
                <Input
                  value={username}
                  onChangeText={setUsername}
                  placeholder="请输入学号"
                  className="my-4 w-full px-1 py-3"
                />

                {/* 密码输入框 */}
                <Input
                  value={password}
                  onChangeText={setPassword}
                  placeholder="请输入密码"
                  secureTextEntry
                  className="mb-4 w-full px-1 py-3"
                />

                {/* 验证码输入框和图片 */}
                <View className="mb-12 w-full flex-row items-center justify-between">
                  <Input
                    value={captcha}
                    onChangeText={setCaptcha}
                    placeholder="请输入验证码"
                    className="mr-4 flex-1 px-1 py-3"
                  />
                  {captchaImage && (
                    <TouchableOpacity onPress={refreshCaptcha}>
                      <Image source={{ uri: captchaImage }} className="h-8 w-40" resizeMode="stretch" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* 登录按钮 */}
                <TouchableOpacity
                  onPress={isLoggingIn ? undefined : handleLogin}
                  disabled={isLoggingIn}
                  className={`mb-6 w-full items-center justify-center rounded-4xl py-3 ${
                    isLoggingIn ? 'bg-gray-400' : 'bg-primary'
                  }`}
                >
                  <Text className="text-lg font-bold text-white">{isLoggingIn ? '登录中...' : '登 录'}</Text>
                </TouchableOpacity>

                {/* 其他操作 */}
                <View className="w-full flex-row justify-between px-2">
                  <Text className="text-muted-foreground">研究生登录</Text>
                  <Text className="text-primary" onPress={openResetPassword}>
                    忘记密码
                  </Text>
                </View>
              </View>

              {/* 底部协议 */}
              <View className="mb-6 mt-12 w-full flex-row justify-center">
                <Checkbox checked={isAgree} onCheckedChange={setIsAgree} />
                <Text className="text-center text-muted-foreground">
                  {'  '}
                  阅读并同意{' '}
                  <Text className="text-primary" onPress={openUserAgreement}>
                    用户协议
                  </Text>{' '}
                  和{' '}
                  <Text className="text-primary" onPress={openPrivacyPolicy}>
                    隐私政策
                  </Text>
                </Text>
              </View>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default LoginPage;
