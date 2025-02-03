import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, router } from 'expo-router';
import { Image, Linking, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListRow,
  DescriptionListTerm,
} from '@/components/DescriptionList';
import PageContainer from '@/components/page-container';
import { Text } from '@/components/ui/text';

import { URL_PRIVACY_POLICY, URL_USER_AGREEMENT } from '@/lib/constants';

export default function AboutPage() {
  return (
    <>
      <Stack.Screen options={{ title: '关于福uu' }} />

      <PageContainer>
        <View className="flex items-center p-12">
          <Image
            source={require('@/assets/images/icon_transparent.png')}
            className="mb-6 h-20 w-20 rounded-full bg-background"
          />
          <View>
            <Text className="text-xl text-primary">7.0.0</Text>
          </View>
        </View>

        <View className="flex-1 rounded-tr-4xl bg-background px-4 pt-8">
          <DescriptionList className="gap-6">
            <DescriptionListRow>
              <DescriptionListTerm>版本更新</DescriptionListTerm>
              <DescriptionListDescription>点我检查更新</DescriptionListDescription>
            </DescriptionListRow>
            <DescriptionListRow>
              <DescriptionListTerm>研发团队</DescriptionListTerm>
              <DescriptionListDescription>西二在线福uu项目组</DescriptionListDescription>
            </DescriptionListRow>
            <Pressable
              onPress={() => {
                Linking.openURL('https://fzuhelper.w2fzu.com/');
              }}
            >
              <DescriptionListRow>
                <DescriptionListTerm>官方网站</DescriptionListTerm>
                <DescriptionListDescription>
                  <Ionicons name="chevron-forward" />
                </DescriptionListDescription>
              </DescriptionListRow>
            </Pressable>
          </DescriptionList>

          <SafeAreaView className="flex-1 items-center justify-end gap-2" edges={['bottom']}>
            <View className="flex-row">
              <Text
                className="text-primary"
                onPress={() => {
                  router.push({
                    pathname: '/(guest)/web',
                    params: {
                      url: URL_USER_AGREEMENT,
                      title: '服务协议',
                    },
                  });
                }}
              >
                服务协议
              </Text>
              <Text className="mx-5 text-primary">|</Text>
              <Text
                className="text-primary"
                onPress={() => {
                  router.push({
                    pathname: '/(guest)/web',
                    params: {
                      url: URL_PRIVACY_POLICY,
                      title: '隐私政策',
                    },
                  });
                }}
              >
                隐私政策
              </Text>
            </View>
            <View className="flex-row">
              <Text className="text-sm text-muted-foreground">本APP由</Text>
              <Text
                className="text-sm text-primary"
                onPress={() => {
                  Linking.openURL('https://www.upyun.com/?utm_source=lianmeng&utm_medium=referral');
                }}
              >
                又拍云
              </Text>
              <Text className="text-sm text-muted-foreground">提供CDN加速/云存储服务</Text>
            </View>
            <Pressable
              className="flex-row items-center"
              onPress={() => {
                Linking.openURL('https://beian.miit.gov.cn/');
              }}
            >
              <Text className="mr-1 text-sm text-muted-foreground">ICP备案号：闽ICP备19020557号-4A</Text>
              <Ionicons name="chevron-forward" size={10} />
            </Pressable>
            <Text className="mb-6 text-sm text-muted-foreground">
              Copyright © 2017-{new Date().getFullYear()} west2-online. All Rights Reserved
            </Text>
          </SafeAreaView>
        </View>
      </PageContainer>
    </>
  );
}
