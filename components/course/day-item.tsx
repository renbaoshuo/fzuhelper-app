import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface DayItemProps {
  day: string; // 星期几，例如 "一", "二"
  date: number; // 日期，例如 10, 11
  isSelected?: boolean; // 是否选中
  isMuted?: boolean; // 是否为非工作日（例如周六、周日）
  onPress?: () => void; // 点击事件
}

// 这个组件用于渲染一个日期的单元格，比如星期一到星期日
const DayItem: React.FC<DayItemProps> = ({ day, date, isSelected = false, isMuted = false, onPress }) => {
  return (
    <Pressable className="flex flex-grow flex-col items-center pb-3 pt-2" onPress={onPress}>
      <Text className={`text-sm ${isMuted ? 'text-muted-foreground' : isSelected ? 'text-primary' : ''}`}>{day}</Text>
      <Text
        className={`mt-1 flex h-8 w-8 items-center justify-center text-center align-middle text-xl font-medium ${
          isSelected ? 'text-primary' : 'text-gray-900'
        }`}
      >
        {date}
      </Text>
      {/* 始终渲染一个固定高度的 View */}
      <View className={`mt-1 h-1 w-9 rounded-sm ${isSelected ? 'bg-primary' : 'bg-transparent'}`} />
    </Pressable>
  );
};

export default DayItem;
