import { Tabs, useNavigation } from 'expo-router';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';

import { getApiV1JwchPing } from '@/api/generate';
import { useSafeResponseSolve } from '@/hooks/useSafeResponseSolve';

const NAVIGATION_TITLE = '首页';

// 进入这个 Layout，我们视为进入 app 主页面，因此会设置一些额外逻辑，比如关于 app 状态的一些信息
export default function TabLayout() {
  const navigation = useNavigation();
  const appState = useRef(AppState.currentState);
  const { handleError } = useSafeResponseSolve();
  useLayoutEffect(() => {
    // 设置标题栏为不可见，但必须设置标题，否则当你进入其他页面时，返回 button 只能显示文件夹
    navigation.setOptions({ title: NAVIGATION_TITLE, headerShown: false });

    // 下面这个 return 语句是用来在组件销毁时恢复标题栏的
    return () => {
      navigation.setOptions({ headerShown: true });
    };
  }, [navigation]);

  // 携带本地 token 去请求服务器，检查 token 活跃状态
  // 这个 token 和用户的 cookie 是两个不同的东西，token 的作用是我们服务端用于验证合法请求的
  // 而 cookie 则是我们用于携带访问教务处的身份信息
  const pingToServre = useCallback(async () => {
    try {
      await getApiV1JwchPing(); // 这里是一个 ping 接口，用来测试服务器是否正常
    } catch (error: any) {
      console.error('pingToServre error', error);
      const data = handleError(error);
      if (data) {
        Alert.alert('服务器连接失败', data.message);
      }
      // 如果出现异常，例如网络错误或超时，会在 hooks/useSafeResponseSolve.ts 中处理
      // 这里不必做额外的处理
    }
  }, [handleError]);

  // 设置 app 状态监听
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        pingToServre();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  });

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: '主页',
          href: '/',
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="toolbox"
        options={{
          title: '工具箱',
          href: '/toolbox',
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'albums' : 'albums-outline'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="qrcode"
        options={{
          title: '一码通',
          href: '/qrcode',
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'qr-code' : 'qr-code-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: '我的',
          href: '/user',
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />,
        }}
      />
    </Tabs>
  );
}
