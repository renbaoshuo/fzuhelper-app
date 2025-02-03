import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { toast } from 'sonner-native';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';

import { useSafeResponseSolve } from '@/hooks/useSafeResponseSolve';
import { YMT_ACCESS_TOKEN_KEY, YMT_USERNAME_KEY } from '@/lib/constants';
import YMTLogin, { IdentifyRespData, PayCodeRespData } from '@/lib/ymt-login';
import { ScrollView } from 'react-native-gesture-handler';

export default function YiMaTongPage() {
  const ymtLogin = useMemo(() => new YMTLogin(), []);
  const [accessToken, setAccessToken] = useState<string | null>(null); // 访问令牌
  const [currentTime, setCurrentTime] = useState(new Date()); // 当前时间
  const [name, setName] = useState<string | null>(null); // 用户名
  const [payCodes, setPayCodes] = useState<PayCodeRespData[]>(); // 支付码
  const [identifyCode, setIdentifyCode] = useState<IdentifyRespData>(); // 身份码
  const [currentTab, setCurrentTab] = useState('消费码'); // 当前选项卡
  const [isRefreshing, setIsRefreshing] = useState(false); // 用于触发重新渲染
  const handleErrorRef = useRef(useSafeResponseSolve().handleError);
  const handleError = handleErrorRef.current;

  const logoutCleanData = useCallback(async () => {
    await AsyncStorage.multiRemove([YMT_ACCESS_TOKEN_KEY, YMT_USERNAME_KEY]);
    setAccessToken(null);
  }, []);

  // 刷新支付码和身份码
  const refresh = useCallback(async () => {
    setIsRefreshing(true); // 触发重新渲染
    if (accessToken) {
      try {
        const [newPayCodes, newIdentifyCode] = await Promise.all([
          ymtLogin.getPayCode(accessToken),
          ymtLogin.getIdentifyCode(accessToken),
        ]);

        setPayCodes(newPayCodes);
        setIdentifyCode(newIdentifyCode);

        // 如果获取成功，续期 Token，在下次切换到该页面时使用
        const newToken = await ymtLogin.getRenewToken(accessToken);
        await AsyncStorage.setItem(YMT_ACCESS_TOKEN_KEY, newToken);
      } catch (error: any) {
        console.error('刷新失败:', error);
        const data = handleError(error);
        if (data) {
          if (data.code === 401) {
            logoutCleanData();
            toast.info('一码通登录过期，请重新登录');
            return;
          }
          toast.error('刷新失败：' + data.msg);
        }
      } finally {
        setIsRefreshing(false); // 恢复按钮状态
      }
    }
  }, [accessToken, ymtLogin, handleError, logoutCleanData]);

  // 当 accessToken 变更时，自动刷新
  useEffect(() => {
    if (accessToken) {
      refresh();
    }
  }, [accessToken, refresh]);

  // 获取焦点时读取本地数据（初始化时，Tab切换时，登录页返回时）
  useFocusEffect(
    useCallback(() => {
      // 读取本地数据
      async function getLocalData() {
        try {
          const storedAccessToken = await AsyncStorage.getItem(YMT_ACCESS_TOKEN_KEY);
          const storedName = await AsyncStorage.getItem(YMT_USERNAME_KEY);
          setAccessToken(storedAccessToken);
          setName(storedName);
        } catch (error) {
          console.error('读取本地数据失败:', error);
          logoutCleanData();
        }
      }
      getLocalData();
      // 设置刷新和时间间隔
      const refreshInterval = setInterval(() => {
        if (accessToken) {
          refresh();
        }
      }, 50000);
      const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

      return () => {
        clearInterval(refreshInterval);
        clearInterval(timeInterval);
      };
      // 解决重复刷新的问题
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const logout = useCallback(() => {
    Alert.alert(
      '确认退出',
      '您确定要退出吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: logoutCleanData,
        },
      ],
      { cancelable: false },
    );
  }, [logoutCleanData]);

  const renderQRCodeCard = useCallback(
    (title: string, codeContent: string | null, codeColor: string) => (
      <Card>
        <CardHeader>
          {/* TODO: 安卓端渲染行高不足问题 将在 RN 0.77 合入 到时可移除此 padding
          https://github.com/facebook/react-native/commit/65d8f66b50471d2fb4ddd5e63e17fcc808623110 */}
          <CardTitle className="pt-2">{title}</CardTitle>
          <CardDescription>
            {currentTime.toLocaleDateString() + ' '}
            {currentTime.toLocaleTimeString()}
            {name ? ' - ' + name : ''}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-col items-center justify-center gap-4">
          {codeContent ? <QRCode value={codeContent} size={320} color={codeColor} /> : <Text>Loading...</Text>}
          <View className="flex-row gap-4">
            <Button onPress={logout} className="width-full flex-5">
              <Text>退出</Text>
            </Button>
            <Button onPress={refresh} className="width-full flex-1" disabled={isRefreshing}>
              <Text>{isRefreshing ? '刷新中...' : '刷新'}</Text>
            </Button>
          </View>
        </CardContent>

        <CardFooter className="flex-row gap-4">
          <View className="w-full px-1">
            <Text className="my-2 text-lg font-bold text-muted-foreground">友情提示</Text>
            {currentTab === '消费码' ? (
              <Text className="text-base text-muted-foreground">
                消费码：适用于福州大学大门、生活区入口及宿舍楼门禁，不可用于桃李园消费。
              </Text>
            ) : (
              <Text className="text-base text-muted-foreground">认证码：目前暂无实际用途。</Text>
            )}
          </View>
        </CardFooter>
      </Card>
    ),
    [currentTime, name, logout, refresh, isRefreshing, currentTab],
  );

  return (
    <View className="flex-1">
      {accessToken ? (
        <ScrollView className="flex-1 px-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="my-6 flex-1 items-center">
            <TabsList className="w-full flex-row">
              <TabsTrigger value="消费码" className="flex-1">
                <Text className="text-center">消费码</Text>
              </TabsTrigger>
              <TabsTrigger value="认证码" className="flex-1">
                <Text className="text-center">认证码</Text>
              </TabsTrigger>
            </TabsList>

            <View className="mt-3 flex-1">
              <TabsContent value="消费码">
                {payCodes && renderQRCodeCard('消费码', payCodes[0].prePayId, '#000000')}
              </TabsContent>

              <TabsContent value="认证码">
                {identifyCode && renderQRCodeCard('认证码', identifyCode.content, identifyCode.color)}
              </TabsContent>
            </View>
          </Tabs>
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center gap-10">
          <Text className="text-lg">登录统一身份认证平台，享受一码通服务</Text>
          <Link href="/unified-auth-login" asChild>
            <Button className="w-1/2">
              <Text>前往登录</Text>
            </Button>
          </Link>
        </View>
      )}
    </View>
  );
}
