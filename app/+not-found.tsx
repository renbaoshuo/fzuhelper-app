import Ionicons from '@expo/vector-icons/Ionicons'; // 图标库
import { Link, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';

import PageContainer from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

const NAVIGATION_TITLE = '哎呀，页面不见啦！';

export default function NotFoundScreen() {
  // 设置导航栏标题
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: NAVIGATION_TITLE });
  }, [navigation]);

  return (
    <>
      {/* 页面内容 */}
      <PageContainer className="items-center justify-center bg-background p-5">
        {/* 可爱表情图标 */}
        <Ionicons name="sad-outline" size={80} color="#FF6F61" />

        {/* 提示文字 */}
        <Text className="mt-6 text-center text-xl font-semibold">哎呀，这个页面被小猫叼走啦！</Text>
        <Text className="mt-2 text-center text-base text-muted-foreground">不用担心，你可以回到首页重新找路~</Text>

        {/* 返回首页按钮 */}
        <Link href="/" asChild replace>
          <Button className="mt-8" size="lg">
            <Text className="text-lg">回到首页</Text>
          </Button>
        </Link>
      </PageContainer>
    </>
  );
}
