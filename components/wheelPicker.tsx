import React, { useRef } from 'react';
import { Animated, DimensionValue, FlatList, View, type TextStyle, type ViewStyle } from 'react-native';
import WheelPickerRow from './WheelPickerRow';

interface WheelPickerProps {
  wheelWidth: DimensionValue;
  itemHeight?: number;
  data: string[];
  visibleNum?: 1 | 2 | 3;
  selectIndex: number;
  onChange?: (index: number) => void;
  rowStyle?: ViewStyle;
  textStyle?: TextStyle;
}

const WheelPicker: React.FC<WheelPickerProps> = props => {
  const _visibleNum = props.visibleNum ?? 2;

  const listRef = useRef<FlatList<string> | null>(null);
  const momentumBeginRef = useRef<boolean>(false);
  const visibleNum = _visibleNum <= 3 ? _visibleNum : 3;
  const itemHeight = props.itemHeight ?? 36;
  const listHeight = (visibleNum * 2 + 1) * itemHeight;
  const scrollY = useRef(new Animated.Value(0)).current;

  const textStyle = props.textStyle ?? { fontSize: 16 };

  let data = props.data.slice();
  let i = visibleNum;
  while (i--) {
    data.unshift('');
    data.push('');
  }

  let maxOffsetY = data.length * itemHeight - listHeight;
  maxOffsetY = maxOffsetY > 0 ? maxOffsetY : 0;

  const scrollEndDrag = (event: {
    nativeEvent: {
      contentOffset: { x: number; y: number };
    };
  }) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y < 0 || y > maxOffsetY) {
      return;
    }

    // the timing of momentunBegin even is later than scrollEndDrag even, thus delaying the drag event
    setTimeout(() => {
      if (momentumBeginRef.current) {
        return;
      }

      const idx = Math.round(y / itemHeight);
      listRef.current?.scrollToIndex({
        animated: true,
        index: idx,
      });
      setTimeout(() => {
        props.onChange && props.onChange(idx);
      }, 200);
    }, 100);
  };

  const momentumScrollEnd = (event: {
    nativeEvent: {
      contentOffset: { x: number; y: number };
    };
  }) => {
    if (!momentumBeginRef.current) {
      return;
    }

    momentumBeginRef.current = false;
    const y = event.nativeEvent.contentOffset.y;
    if (y < 0 || y > maxOffsetY) {
      return;
    }
    const idx = Math.round(y / itemHeight);
    listRef.current?.scrollToIndex({
      animated: true,
      index: idx,
    });
    setTimeout(() => {
      props.onChange && props.onChange(idx);
    }, 200);
  };

  return (
    <View style={[{ width: props.wheelWidth }]} className="justify-center">
      <View style={[{ height: itemHeight }]} className="absolute w-full rounded-lg bg-gray-100" />
      <Animated.FlatList
        ref={listRef}
        contentOffset={{
          x: 0,
          y: props.selectIndex * itemHeight,
        }}
        overScrollMode="always"
        showsVerticalScrollIndicator={false}
        style={[{ maxHeight: listHeight }]}
        data={data}
        scrollEventThrottle={1}
        onScrollEndDrag={scrollEndDrag}
        onMomentumScrollEnd={momentumScrollEnd}
        onMomentumScrollBegin={() => {
          momentumBeginRef.current = true;
        }}
        onScrollToIndexFailed={() => {}}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: scrollY,
                },
              },
            },
          ],
          { useNativeDriver: true },
        )}
        renderItem={({ item, index }) => {
          return (
            <WheelPickerRow
              rowStyle={props.rowStyle}
              textStyle={textStyle}
              itemHeight={itemHeight}
              text={item}
              scrollY={scrollY}
              idx={index}
              visibleNum={visibleNum}
            />
          );
        }}
      />
    </View>
  );
};

export default WheelPicker;
