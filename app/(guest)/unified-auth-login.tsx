import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useSafeResponseSolve } from '@/hooks/useSafeResponseSolve';
import { URL_PRIVACY_POLICY, URL_USER_AGREEMENT, YMT_ACCESS_TOKEN_KEY, YMT_USERNAME_KEY } from '@/lib/constants';
import YMTLogin from '@/lib/ymt-login';

const NAVIGATION_TITLE = '统一身份认证';
const URL_FORGET_PASSWORD = 'https://sso.fzu.edu.cn/public/client/forget-password/qr';

const UnifiedLoginPage: React.FC = () => {
  const [account, setAccount] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAgree, setIsAgree] = useState(false);
  const { handleError } = useSafeResponseSolve();
  const ymtLogin = useRef<YMTLogin | null>(null);
  if (!ymtLogin.current) {
    ymtLogin.current = new YMTLogin();
  }

  // 打开服务协议
  const openUserAgreement = useCallback(() => {
    router.push({
      pathname: '/web',
      params: {
        url: URL_USER_AGREEMENT,
        title: '服务协议',
      },
    });
  }, []);

  // 打开隐私政策
  const openPrivacyPolicy = useCallback(() => {
    router.push({
      pathname: '/web',
      params: {
        url: URL_PRIVACY_POLICY,
        title: '隐私政策',
      },
    });
  }, []);

  // 忘记密码
  const openForgetPassword = useCallback(() => {
    Linking.openURL(URL_FORGET_PASSWORD).catch(err => Alert.alert('错误', '无法打开链接(' + err + ')'));
  }, []);

  // 处理登录逻辑
  const handleLogin = useCallback(async () => {
    if (!isAgree) {
      toast.error('请先阅读并同意服务协议和隐私政策');
      return;
    }
    if (!account) {
      toast.error('请输入用户名');
      return;
    }
    if (!accountPassword) {
      toast.error('请输入密码');
      return;
    }

    setIsLoggingIn(true); // 禁用按钮

    try {
      // 调用统一身份认证登录逻辑
      // !! 注意：此处调用的是一码通登录。后续如有其他需求再进行改进 !!
      const { name, accessToken } = await ymtLogin.current!.login(account, accountPassword);

      // 存储所需的信息
      await AsyncStorage.multiSet([
        [YMT_ACCESS_TOKEN_KEY, accessToken],
        [YMT_USERNAME_KEY, name],
      ]);

      console.log('登录成功:', name, accessToken);

      // 跳转到上一页
      router.back();
    } catch (error: any) {
      const data = handleError(error);
      if (data) {
        Alert.alert('请求失败', data.code + ': ' + data.message);
      }
    } finally {
      // 恢复按钮状态
      setIsLoggingIn(false);
    }
  }, [isAgree, account, accountPassword, ymtLogin, handleError]);

  return (
    <>
      <Stack.Screen options={{ title: NAVIGATION_TITLE }} />

      <SafeAreaView className="bg-background" edges={['bottom', 'left', 'right']}>
        <KeyboardAwareScrollView
          className="h-full"
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-between px-6 py-3">
            {/* 左上角标题 */}
            <View className="ml-1 mt-14">
              <Text className="mb-2 text-3xl font-bold">统一身份认证平台登录</Text>
            </View>

            {/* 页面内容 */}
            <View className="items-center justify-center">
              {/* 用户名输入框 */}
              <Input
                value={account}
                onChangeText={setAccount}
                placeholder="请输入学号"
                className="my-4 w-full px-1 py-3"
              />

              {/* 密码输入框 */}
              <Input
                value={accountPassword}
                onChangeText={setAccountPassword}
                placeholder="请输入密码"
                secureTextEntry
                className="mb-12 w-full px-1 py-3"
              />

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

              <View className="w-full flex-row justify-end px-2">
                {/* 忘记密码按钮 */}
                <Text className="text-primary" onPress={openForgetPassword}>
                  重置密码
                </Text>
              </View>

              {/* 公告栏 */}
              <View className="mt-10 w-full px-1">
                <Text className="my-2 text-lg font-bold text-muted-foreground">友情提示</Text>
                <Text className="text-base text-muted-foreground">
                  1. 统一身份认证平台为福州大学统一登录系统，可用于登录图书馆、一码通、智汇福大等平台。
                </Text>
                <Text className="text-base text-muted-foreground">2. 新生可使用身份证号作为登录账号。</Text>
                <Text className="text-base text-muted-foreground">
                  3. 福州大学教务处系统独立于统一身份认证平台，需使用专有密码登录。
                </Text>
              </View>
            </View>

            {/* 底部协议 */}
            <TouchableOpacity
              activeOpacity={1}
              className="mb-4 mt-12 w-full flex-row justify-center py-2"
              onPress={() => setIsAgree(!isAgree)}
            >
              <Checkbox checked={isAgree} onCheckedChange={setIsAgree} />
              <Text className="text-center text-muted-foreground">
                {'  '}
                阅读并同意{' '}
                <Text
                  className="text-primary"
                  onPress={event => {
                    event.stopPropagation();
                    openUserAgreement();
                  }}
                >
                  服务协议
                </Text>{' '}
                和{' '}
                <Text
                  className="text-primary"
                  onPress={event => {
                    event.stopPropagation();
                    openPrivacyPolicy();
                  }}
                >
                  隐私政策
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
});

export default UnifiedLoginPage;
