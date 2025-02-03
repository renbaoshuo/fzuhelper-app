import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Href, Link, Tabs } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ImageSourcePropType, ScrollView, TouchableOpacity, View } from 'react-native';

import PageContainer from '@/components/page-container';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

import { getApiV1JwchUserInfo } from '@/api/generate';
import { useRedirectWithoutHistory } from '@/hooks/useRedirectWithoutHistory';
import { useSafeResponseSolve } from '@/hooks/useSafeResponseSolve';
import { JWCH_USER_INFO_KEY } from '@/lib/constants';
import { clearUserStorage } from '@/utils/user';

export default function HomePage() {
  const { handleError } = useSafeResponseSolve();
  const redirect = useRedirectWithoutHistory();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    stu_id: '', // 学号
    birthday: '', // 生日
    name: '', // 姓名
    sex: '', // 性别
    college: '', // 所属学院
    grade: '', // 所属年级
    major: '', // 所属专业
  });

  const userInfoLabels: Record<string, string> = {
    stu_id: '学号',
    birthday: '生日',
    sex: '性别',
    name: '姓名',
    college: '所属学院',
    grade: '所属年级',
    major: '所属专业',
  };

  interface MenuItem {
    icon: ImageSourcePropType;
    name: string; // 菜单项名称
    link: Href; // 跳转链接
  }

  // 菜单项数据
  const menuItems: MenuItem[] = [
    {
      icon: require('assets/images/my/ic_homework.png'),
      name: '我的作业',
      link: '/my/grades' as Href,
    },
    {
      icon: require('assets/images/my/ic_note.png'),
      name: '备忘录',
      link: '/my/gpa' as Href,
    },
    {
      icon: require('assets/images/my/ic_calendar.png'),
      name: '校历',
      link: '/my/credits' as Href,
    },
    {
      icon: require('assets/images/my/ic_ecard.png'),
      name: '一卡通',
      link: '/my/unified-exam' as Href,
    },
    {
      icon: require('assets/images/my/ic_help.png'),
      name: '帮助与反馈',
      link: '/my/plan' as Href,
    },
  ];

  // 从 AsyncStorage 加载用户信息
  const loadUserInfoFromStorage = useCallback(async () => {
    try {
      const storedData = await AsyncStorage.getItem(JWCH_USER_INFO_KEY);
      if (storedData) {
        setUserInfo(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Failed to load user info from AsyncStorage:', error);
    }
  }, []);

  // 将用户信息保存到 AsyncStorage
  const saveUserInfoToStorage = useCallback(async (info: typeof userInfo) => {
    try {
      await AsyncStorage.setItem(JWCH_USER_INFO_KEY, JSON.stringify(info));
    } catch (error) {
      console.error('Failed to save user info to AsyncStorage:', error);
    }
  }, []);

  // 访问服务器获取用户信息
  const getUserInfo = useCallback(async () => {
    if (isRefreshing) return; // 防止重复点击
    setIsRefreshing(true); // 禁用按钮
    try {
      const result = await getApiV1JwchUserInfo();
      const fetchedInfo = result.data.data;
      setUserInfo(fetchedInfo);
      await saveUserInfoToStorage(fetchedInfo); // 同步到 AsyncStorage
    } catch (error: any) {
      const data = handleError(error);
      if (data) {
        Alert.alert('请求失败', data.code + ': ' + data.message);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [handleError, saveUserInfoToStorage, isRefreshing]);

  // 登出
  const logout = useCallback(async () => {
    Alert.alert('确认退出', '确认要退出账号吗？', [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '退出',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearUserStorage();
            redirect('/(guest)/academic-login');
          } catch (error) {
            console.error('Error clearing storage:', error);
            Alert.alert('清理用户数据失败', '无法清理用户数据');
          }
        },
      },
    ]);
  }, [redirect]);

  // 在组件加载时初始化数据
  useEffect(() => {
    loadUserInfoFromStorage();
  }, [loadUserInfoFromStorage]);

  return (
    <>
      <Tabs.Screen
        options={{
          // eslint-disable-next-line react/no-unstable-nested-components
          headerRight: () => (
            <Link href="/(guest)/about" asChild>
              <Ionicons name="settings-outline" size={24} className="mr-4 text-foreground" />
            </Link>
          ),
        }}
      />

      <PageContainer>
        <ScrollView>
          <View className="flex-row items-center p-8">
            <Image source={require('@/assets/images/my/avatar_default.png')} className="mr-6 h-24 w-24 rounded-full" />
            <View>
              <Text className="text-xl font-bold">{userInfo.name}</Text>
              <Text className="mt-2 text-sm text-gray-500">这是一条签名</Text>
            </View>
          </View>

          <View className="h-full rounded-tr-4xl bg-background px-8">
            <View className="mt-6">
              <View className="w-full flex-row justify-between">
                <Text>{userInfo.college}</Text>
                <Text>{userInfo.stu_id}</Text>
              </View>
              <View className="mt-2 w-full flex-row justify-between">
                <Text className="text-muted-foreground">2024年1学期</Text>
                <Text className="text-muted-foreground">第 22 周</Text>
              </View>
            </View>

            {/* 菜单列表 */}
            <View className="mt-4 space-y-4">
              {menuItems.map((item, index) => (
                <Link key={index} href={item.link} asChild>
                  <TouchableOpacity className="flex-row items-center justify-between py-4">
                    {/* 图标和名称 */}
                    <View className="flex-row items-center space-x-4">
                      <Image source={item.icon} className="h-7 w-7" />
                      <Text className="ml-5 text-lg text-foreground">{item.name}</Text>
                    </View>
                    {/* 右侧箭头 */}
                    <Image source={require('assets/images/misc/ic_arrow_right.png')} className="h-5 w-5" />
                  </TouchableOpacity>
                </Link>
              ))}
            </View>

            {/* 按钮部分 */}
            <View className="mt-6">
              <Button onPress={getUserInfo} disabled={isRefreshing} className="mb-4">
                <Text>{isRefreshing ? '刷新中...' : '刷新个人信息'}</Text>
              </Button>
              <Button onPress={logout} className="mb-4">
                <Text>退出当前账户</Text>
              </Button>
              <Link href="/devtools" asChild>
                <Button>
                  <Text>开发者选项</Text>
                </Button>
              </Link>
            </View>
          </View>
        </ScrollView>
      </PageContainer>
    </>
  );
}
