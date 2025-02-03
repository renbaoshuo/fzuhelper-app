import React from 'react';
import { View } from 'react-native';

// 如果这个时段没有课程，显示一个空白的占位符，这个组件就是用来显示这个占位符的
const EmptySlot: React.FC = () => {
  return <View className="flex-grow-1 flex min-h-14 flex-shrink-0 basis-0 flex-col items-center justify-center" />;
};

export default EmptySlot;
