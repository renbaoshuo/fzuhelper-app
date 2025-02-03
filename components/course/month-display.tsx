import React from 'react';
import { Text, View } from 'react-native';

interface MonthDisplayProps {
  month: number;
}

const MonthDisplay: React.FC<MonthDisplayProps> = ({ month }) => {
  return (
    <View className="w-[32px] flex-shrink-0 flex-grow-0">
      <View className="flex flex-shrink-0 flex-col items-center justify-center px-2 py-3">
        <Text>{month}</Text>
        <Text>月</Text>
      </View>
    </View>
  );
};

export default MonthDisplay;
