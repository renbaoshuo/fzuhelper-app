import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

export default function Web() {
  const [canGoBack, setCanGoBack] = useState(false);
  const [webpageTitle, setWebpageTitle] = useState('');
  const [currentUrl, setCurrentUrl] = useState(''); // 当前加载的 URL
  const webViewRef = useRef<WebView>(null);

  // 读取传递的参数
  const { url, cookie, title } = useLocalSearchParams<{
    url: string; // URL 地址
    cookie?: string; // （可选）Cookie
    title?: string; // （可选）未 Loading 结束时的标题
  }>();

  const headers = cookie ? { Cookie: cookie } : [];

  const onAndroidBackPress = useCallback(() => {
    if (canGoBack) {
      webViewRef.current?.goBack();
      return true; // 阻止默认行为（退出应用）
    }
    return false;
  }, [canGoBack]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
      };
    }
  }, [onAndroidBackPress]);

  // 处理新窗口打开事件
  const onOpenWindow = (event: { nativeEvent: { targetUrl: any } }) => {
    const targetUrl = event.nativeEvent.targetUrl; // 获取目标 URL
    console.log('Opening new window with URL:', targetUrl);

    // 在当前 WebView 中加载目标 URL
    if (webViewRef.current) {
      setCurrentUrl(targetUrl); // 更新当前 URL
    }
  };

  return (
    <>
      {/* 如果传递了 title 参数，则使用它；否则使用网页标题 */}
      <Stack.Screen options={{ title: title || webpageTitle }} />
      <SafeAreaView className="h-full w-full" edges={['bottom']}>
        <WebView
          source={{ uri: currentUrl || url || '', headers: headers }} // 使用当前 URL 或传递的 URL
          allowsBackForwardNavigationGestures={true} // 启用手势返回（iOS）
          ref={webViewRef}
          cacheEnabled={true} // 启用缓存
          cacheMode={'LOAD_DEFAULT'} // 设置缓存模式，LOAD_DEFAULT 表示使用默认缓存策略
          onLoadProgress={event => {
            setCanGoBack(event.nativeEvent.canGoBack);
          }} // 更新是否可以返回（Android）
          javaScriptEnabled={true} // 确保启用 JavaScript
          scalesPageToFit={true} // 启用页面缩放（Android）
          renderToHardwareTextureAndroid={true} // 启用硬件加速（Android）
          setBuiltInZoomControls={true} // 启用内置缩放控件（Android）
          setDisplayZoomControls={false} // 隐藏缩放控件图标
          contentMode="mobile" // 内容模式设置为移动模式，即可自动调整页面大小（iOS）
          allowsInlineMediaPlayback={true} // 允许内联播放媒体（iOS）
          onNavigationStateChange={event => {
            if (!event.loading) {
              // 更新当前 URL
              setCurrentUrl(event.url);

              // 更新网页标题
              console.log('event:', event);
              if (event.title && !title) {
                setWebpageTitle(event.title); // 只有在没有传递 title 参数时才更新标题
              }
            }
          }}
          onOpenWindow={onOpenWindow} // 处理新窗口打开事件
        />
      </SafeAreaView>
      <Button onPress={() => onOpenWindow({ nativeEvent: { targetUrl: url } })}>
        <Text>Refresh</Text>
      </Button>
    </>
  );
}
