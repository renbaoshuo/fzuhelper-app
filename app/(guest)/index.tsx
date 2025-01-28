import { getApiV1LaunchScreenImagePointTime, getApiV1LaunchScreenScreen } from '@/api/generate';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Text } from '@/components/ui/text';
import {
  IS_PRIVACY_POLICY_AGREED,
  JWCH_USER_ID_KEY,
  SPLASH_DATE,
  SPLASH_DISPLAY_COUNT,
  SPLASH_ID,
  URL_PRIVACY_POLICY,
  URL_USER_AGREEMENT,
} from '@/lib/constants';
import ExpoUmengModule from '@/modules/umeng-bridge';
import { isAccountExist } from '@/utils/is-account-exist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, BackHandler, Image, Linking, Platform, View } from 'react-native';
import { SystemBars } from 'react-native-edge-to-edge';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { toast } from 'sonner-native';

export default function SplashScreen() {
  const router = useRouter();

  const [shouldShowPrivacyAgree, setShouldShowPrivacyAgree] = useState(true);
  const [privacyDialogVisible, setPrivacyDialogVisible] = useState(false);

  const [showSplashImage, setShowSplashImage] = useState(false);
  const [splashId, setSplashId] = useState(-1);
  const [splashImage, setSplashImage] = useState('');
  const [splashTarget, setSplashTarget] = useState('');
  const [splashText, setSplashText] = useState('');
  const [splashType, setSplashType] = useState(1);
  const [countdown, setCountdown] = useState(3);
  const [hideSystemBars, setHideSystemBars] = useState(true);

  // 合规初始化第三方库
  const initThirdParty = useCallback(() => {
    console.log('initUMPush and UMAnalysis');
    ExpoUmengModule.initUmeng();
  }, []);

  const navigateToHome = useCallback(() => {
    setHideSystemBars(false);
    // 延迟使得系统栏恢复显示
    setTimeout(() => {
      router.replace('/(root)');
    }, 1);
  }, [router]);

  // 拉取Splash并展示
  const getSplash = useCallback(async () => {
    console.log('getSplash');
    try {
      const result = await getApiV1LaunchScreenScreen({
        type: 1,
        // TODO: 研究生学号
        student_id: (await AsyncStorage.getItem(JWCH_USER_ID_KEY)) || '',
        device: Platform.OS,
      });
      if (result.data.data.length === 0) {
        // 理论上不会触发
        navigateToHome();
        return;
      }
      const splash = result.data.data[0];
      if (splash.id?.toString() !== (await AsyncStorage.getItem(SPLASH_ID))) {
        // ID与上次不同，重置计数
        await AsyncStorage.setItem(SPLASH_DISPLAY_COUNT, '0');
        await AsyncStorage.setItem(SPLASH_ID, splash.id?.toString() || '');
      }
      const lastDate = await AsyncStorage.getItem(SPLASH_DATE);
      let displayCount = 0;
      // 如果上次展示不是今天，重置计数
      if (lastDate !== new Date().toLocaleDateString()) {
        await AsyncStorage.setItem(SPLASH_DISPLAY_COUNT, '0');
      } else {
        displayCount = Number(await AsyncStorage.getItem(SPLASH_DISPLAY_COUNT));
      }
      if ((splash.frequency || 10) < displayCount) {
        navigateToHome();
        return;
      }
      // 未达到频次，展示
      setSplashId(splash.id || -1);
      setSplashImage(splash.url || '');
      setSplashTarget(splash.href || '');
      setCountdown(splash.duration || 3);
      setSplashText(splash.text || '点击查看详情');
      setSplashType(splash.type || 1);
      await AsyncStorage.setItem(
        SPLASH_DISPLAY_COUNT,
        (Number(await AsyncStorage.getItem(SPLASH_DISPLAY_COUNT)) + 1).toString(),
      );
      await AsyncStorage.setItem(SPLASH_DATE, new Date().toLocaleDateString());
      setShowSplashImage(true);
    } catch (error: any) {
      console.error(error);
      // 不使用 handleError，静默处理
      navigateToHome();
    }
  }, [navigateToHome]);

  const handleSplashClick = useCallback(async () => {
    // 网址或URI
    // TODO 类型判断
    if (splashTarget) {
      Linking.openURL(splashTarget).catch(err => Alert.alert('错误', '无法打开链接(' + err + ')'));
    }
    // 计数
    try {
      await getApiV1LaunchScreenImagePointTime({ picture_id: splashId });
    } catch (error: any) {
      console.error(error);
    }
    // 跳过倒计时
    navigateToHome();
  }, [navigateToHome, splashId, splashTarget]);

  // 检查登录状态
  const checkLoginStatus = useCallback(async () => {
    console.log('checkLoginStatus');
    if (!(await isAccountExist())) {
      // 未登录，跳转登录页
      router.replace('/(guest)/academic-login');
      return;
    }
    getSplash();
  }, [getSplash, router]);

  const onPrivacyAgree = useCallback(async () => {
    setShouldShowPrivacyAgree(false);
    initThirdParty();
    checkLoginStatus();
  }, [initThirdParty, checkLoginStatus]);

  const checkAndShowPrivacyAgree = useCallback(async () => {
    console.log('checkAndShowPrivacyAgree');
    const privacyAgree = await AsyncStorage.getItem(IS_PRIVACY_POLICY_AGREED);
    if (privacyAgree) {
      onPrivacyAgree();
      return;
    }
    setPrivacyDialogVisible(true);
  }, [onPrivacyAgree]);

  useEffect(() => {
    if (!shouldShowPrivacyAgree) return;
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        if (!shouldShowPrivacyAgree) {
          console.log('shouldShowPrivacyAgree false, remove listener');
          subscription.remove();
          return;
        }
        checkAndShowPrivacyAgree();
      }
    };

    checkAndShowPrivacyAgree();
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [checkAndShowPrivacyAgree, shouldShowPrivacyAgree]);

  useEffect(() => {
    if (showSplashImage) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(timer);
            navigateToHome();
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [showSplashImage, navigateToHome]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <View>
        {!showSplashImage ? (
          // 默认开屏
          <Image
            className="h-full w-full"
            source={require('@/assets/images/splash.png')}
            fadeDuration={0}
            resizeMode="cover"
          />
        ) : (
          <View className="flex h-full flex-col">
            {/* Splash内容 */}
            <View className="mb-10 flex-1">
              {/* Image 占据全部空间 */}
              <Image className="h-full w-full" src={splashImage} resizeMode="cover" />
              {/* TouchableOpacity 放置在 Image 的下方 */}
              {splashType !== 1 && (
                <TouchableOpacity onPress={handleSplashClick}>
                  <View className="mx-auto -mt-28 mb-10 h-auto w-1/2 flex-1 items-center justify-center rounded-full bg-black/60">
                    <Text className="text-white">{splashText}</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* 底部logo和跳过 */}
            <View className="flex flex-row items-center justify-center pb-11">
              {/* 居中 Image */}
              <View className="flex-1 items-center">
                <Image className="h-10" source={require('@/assets/images/splash_logo.png')} resizeMode="contain" />
              </View>

              {/* 跳过按钮靠右 */}
              <View className="absolute bottom-11 right-8 w-24 rounded-full border-gray-400 bg-gray-200 py-2">
                <TouchableOpacity onPress={navigateToHome}>
                  <Text className="mx-auto">跳过 {countdown}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <SystemBars hidden={hideSystemBars} />
          </View>
        )}
      </View>
      <AlertDialog open={privacyDialogVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>欢迎</AlertDialogTitle>
            <AlertDialogDescription>
              <Text>
                感谢您选择使用福uu！我们非常重视对您的个人信息保护，在使用福uu为您提供的服务之前，请您务必审慎阅读、充分理解以下协议：
              </Text>
              {'\n'}
              <Text
                className="text-primary"
                onPress={() => {
                  Linking.openURL(URL_USER_AGREEMENT).catch(err => Alert.alert('错误', '无法打开链接(' + err + ')'));
                }}
              >
                《福uu用户服务协议》
              </Text>
              {'\n'}
              <Text
                className="text-primary"
                onPress={() => {
                  Linking.openURL(URL_PRIVACY_POLICY).catch(err => Alert.alert('错误', '无法打开链接(' + err + ')'));
                }}
              >
                《福uu隐私政策》
              </Text>
              {'\n'}
              <Text>如您同意，请点击“同意并继续”，开始您的福uu体验之旅。</Text>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onPress={() => {
                // 退出动作仅适用于安卓
                BackHandler.exitApp();
                if (Platform.OS === 'ios') {
                  setPrivacyDialogVisible(false);
                  Alert.alert(
                    '很遗憾',
                    '我们的隐私政策协议是福uu服务的必要条件，如您不同意，我们将无法为您提供服务。您可以重新打开应用并同意协议。',
                  );
                }
              }}
            >
              <Text>{Platform.OS === 'ios' ? '不同意' : '不同意并退出'}</Text>
            </AlertDialogCancel>
            <AlertDialogAction
              onPress={async () => {
                await AsyncStorage.setItem(IS_PRIVACY_POLICY_AGREED, 'true');
                setPrivacyDialogVisible(false);
                onPrivacyAgree();
              }}
            >
              <Text>同意并继续</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
