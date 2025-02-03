import { getApiV1JwchAcademicGpa } from '@/api/generate';
import PageContainer from '@/components/page-container';
import { Text } from '@/components/ui/text';
import { useSafeResponseSolve } from '@/hooks/useSafeResponseSolve';
import { useNavigation } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { toast } from 'sonner-native';

// 学术成绩数据项
interface AcademicDataItem {
  type: string;
  value: string;
}

// 响应 data 结构
interface AcademicData {
  time: string;
  data: AcademicDataItem[];
}

const NAVIGATION_TITLE = '绩点排名';

export default function GPAPage() {
  const [isRefreshing, setIsRefreshing] = useState(false); // 按钮是否禁用
  const [academicData, setAcademicData] = useState<AcademicData | null>(null); // 学术成绩数据

  const { handleError } = useSafeResponseSolve(); // HTTP 请求错误处理

  // 设置导航栏标题
  const navigation = useNavigation();
  useLayoutEffect(() => {
    navigation.setOptions({ title: NAVIGATION_TITLE });
  }, [navigation]);

  // 访问 west2-online 服务器
  const getAcademicData = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const result = await getApiV1JwchAcademicGpa();
      setAcademicData(result.data.data); // 第一个 data 指的是响应 HTTP 的 data 字段，第二个 data 指的是响应数据的 data 字段
    } catch (error: any) {
      const data = handleError(error);
      if (data) {
        toast.error(data.msg ? data.msg : '未知错误');
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, handleError]);

  return (
    <PageContainer className="bg-background">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* 学术成绩数据列表 */}
        {academicData && (
          <View className="mt-6">
            {/* 时间信息，居中显示 */}
            <Text className="mb-4 text-center text-lg font-bold text-gray-700">{academicData.time}</Text>

            {/* 数据列表 */}
            <View className="gap-4 rounded-lg bg-gray-100 p-4 shadow-sm">
              {academicData.data.map((item, index) => (
                <View
                  key={index}
                  className="mb-2 flex-row items-center justify-between border-b border-gray-300 pb-2 last:border-none"
                >
                  <Text className="capitalize text-gray-500">{item.type}:</Text>
                  <Text className="font-medium text-gray-800">{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 刷新按钮 */}
        <TouchableOpacity
          onPress={getAcademicData}
          disabled={isRefreshing}
          className={`mt-6 rounded-full px-6 py-3 ${isRefreshing ? 'bg-gray-300' : 'bg-blue-500'} shadow-md`}
        >
          <Text className="text-center text-lg font-semibold text-white">
            {isRefreshing ? '刷新中...' : '刷新学业情况'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </PageContainer>
  );
}
