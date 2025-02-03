import React from 'react';
import { Animated, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';

interface WheelPickerRowProps {
  idx: number;
  text: string;
  scrollY: Animated.Value;
  itemHeight: number;
  rowStyle?: ViewStyle;
  textStyle?: TextStyle;
  visibleNum: 1 | 2 | 3;
}

const WheelPickerRow: React.FC<WheelPickerRowProps> = props => {
  const step = 1;
  const visibleNum = (props.visibleNum + 1) * step;
  const itemHeight = props.itemHeight / step;
  const degEach = 90;
  const radEach = (degEach / 180) * 3.14;
  const _idx = (props.idx - props.visibleNum) * step;

  const rotateFunc = (idx: number) => {
    const i = (1 / visibleNum) * idx;
    return -Math.pow(1 / 4, i) + 1;
  };

  const rotateX = props.scrollY.interpolate({
    inputRange: (() => {
      const initScrollY = _idx * itemHeight;
      const range: number[] = [initScrollY];
      for (let i = 1; i <= visibleNum; i++) {
        range.unshift(initScrollY - itemHeight * i);
        range.push(initScrollY + itemHeight * i);
      }

      return range;
    })(),
    outputRange: (() => {
      const range: string[] = [`0rad`];
      for (let i = 1; i <= visibleNum; i++) {
        const rad = rotateFunc(i) * radEach;
        range.unshift(`${-rad}rad`);
        range.push(`${rad}rad`);
      }
      return range;
    })(),
  });

  const translateY = props.scrollY.interpolate({
    inputRange: (() => {
      const initScrollY = _idx * itemHeight;
      const range: number[] = [initScrollY];
      for (let i = 1; i <= visibleNum; i++) {
        range.unshift(initScrollY - itemHeight * i);
        range.push(initScrollY + itemHeight * i);
      }

      return range;
    })(),
    outputRange: (() => {
      const range: number[] = [0];
      for (let i = 1; i <= visibleNum; i++) {
        let y = (itemHeight / 2) * (1 - Math.sin(Math.PI / 2 - rotateFunc(i) * radEach)); // prettier-ignore

        for (let j = 1; j < i; j++) {
          y = y + itemHeight * (1 - Math.sin(Math.PI / 2 - rotateFunc(j) * radEach)); // prettier-ignore
        }
        range.unshift(-y);
        range.push(y);
      }
      return range;
    })(),
    extrapolate: 'clamp',
  });

  const opacity = props.scrollY.interpolate({
    inputRange: (() => {
      const initScrollY = _idx * itemHeight;
      const range: number[] = [initScrollY];
      for (let i = 1; i <= visibleNum; i++) {
        range.unshift(initScrollY - itemHeight * i);
        range.push(initScrollY + itemHeight * i);
      }

      return range;
    })(),
    outputRange: (() => {
      const range = [1];
      for (let x = 1; x <= visibleNum; x++) {
        const y = Math.pow(1 / 2, x);
        range.unshift(y);
        range.push(y);
      }
      return range;
    })(),
  });

  return (
    <Animated.View
      style={[
        styles.row,
        props.rowStyle,
        { opacity, height: props.itemHeight, width: 'auto' },
        { transform: [{ rotateX }, { translateY }] },
      ]}
    >
      <Text style={[styles.rowTitle, props.textStyle]}>{props.text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowTitle: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'normal',
  },
});

export default WheelPickerRow;
