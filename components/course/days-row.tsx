import React from 'react';
import { View } from 'react-native';

interface DaysRowProps {
  children: React.ReactNode;
}

// 这个组件用于渲染一行的课程表，比如星期一到星期日
const DaysRow: React.FC<DaysRowProps> = ({ children }) => {
  return <View className="mt-2 flex flex-shrink flex-grow flex-row">{children}</View>;
};

export default DaysRow;
