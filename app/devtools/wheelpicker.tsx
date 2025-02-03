import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import WheelPicker from '@/components/wheelPicker';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

export default function WheelPickerTest() {
  const [selectIndex, setSelectIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');

  return (
    <View className="flex-1 items-center justify-center">
      <TextInput value={inputValue} onChangeText={setInputValue} placeholder="index" />
      <Button onPress={() => setSelectIndex(Number(inputValue))}>
        <Text>Set Index</Text>
      </Button>
      <WheelPicker
        visibleNum={2}
        textStyle={{ fontSize: 20 }}
        wheelWidth={'80%'}
        itemHeight={36}
        data={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']}
        selectIndex={selectIndex}
        onChange={idx => {
          setSelectIndex(idx);
          console.log(`idx ${idx}`);
        }}
      />
    </View>
  );
}
