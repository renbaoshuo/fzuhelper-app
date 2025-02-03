import { Href, Link, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

import PageContainer from '@/components/page-container';
import { Text } from '@/components/ui/text';

// 定义菜单项的类型
import { ImageSourcePropType } from 'react-native';

interface MenuItem {
  icon: ImageSourcePropType;
  name: string; // 菜单项名称
  link: Href; // 跳转链接
}

// 菜单项数据
const menuItems: MenuItem[] = [
  {
    icon: require('assets/images/toolbox/academic/ic_score.png'),
    name: '成绩查询',
    link: '/toolbox/academic/grades' as Href,
  },
  {
    icon: require('assets/images/toolbox/academic/ic_gpa.png'),
    name: '绩点排名',
    link: '/toolbox/academic/gpa' as Href,
  },
  {
    icon: require('assets/images/toolbox/academic/ic_credit.png'),
    name: '学分统计',
    link: '/toolbox/academic/credits' as Href,
  },
  {
    icon: require('assets/images/toolbox/academic/ic_unified.png'),
    name: '统考成绩',
    link: '/toolbox/academic/unified-exam' as Href,
  },
  {
    icon: require('assets/images/toolbox/academic/ic_plan.png'),
    name: '培养计划',
    link: '/toolbox/academic/plan' as Href,
  },
];

const NAVIGATION_TITLE = '学业状况';

export default function AcademicPage() {
  // 设置导航栏标题
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: NAVIGATION_TITLE });
  }, [navigation]);

  return (
    <PageContainer className="bg-background p-4">
      {/* 菜单列表 */}
      <View className="space-y-4">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.link} asChild>
            <TouchableOpacity className="flex-row items-center justify-between p-4">
              {/* 图标和名称 */}
              <View className="flex-row items-center space-x-4">
                <Image source={item.icon} className="h-7 w-7" />
                <Text className="ml-5 text-lg">{item.name}</Text>
              </View>
              {/* 右侧箭头 */}
              <Image source={require('assets/images/misc/ic_arrow_right.png')} className="h-5 w-5" />
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </PageContainer>
  );
}
