import { Animated, PanResponder } from 'react-native';

/**
 * 创建滑动手势处理器
 * @param direction 滑动方向，可选值为 'horizontal' 或 'vertical'
 * @param onSwipeLeft 当检测到向左滑动时触发的回调
 * @param onSwipeRight 当检测到向右滑动时触发的回调
 * @param onSwipeUp 当检测到向上滑动时触发的回调
 * @param onSwipeDown 当检测到向下滑动时触发的回调
 * @returns {object} 返回一个 PanResponder 对象
 */
export function createGestureHandler({
  direction = 'horizontal',
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
}: {
  direction: 'horizontal' | 'vertical';
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}) {
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      const { dx, dy } = gestureState;
      if (direction === 'horizontal') {
        return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10; // 水平滑动
      } else {
        return Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10; // 垂直滑动
      }
    },
    onPanResponderMove: Animated.event(
      [
        null,
        direction === 'horizontal'
          ? { dx: translateX } // 水平滑动
          : { dy: translateY }, // 垂直滑动
      ],
      { useNativeDriver: false },
    ),
    onPanResponderRelease: (_, gestureState) => {
      const { dx, dy } = gestureState;
      const threshold = 50; // 滑动切换的距离阈值

      if (direction === 'horizontal') {
        if (dx > threshold && onSwipeRight) {
          onSwipeRight(); // 向右滑动
          Animated.spring(translateX, {
            toValue: 0, // 重置动画值
            useNativeDriver: false,
          }).start();
        } else if (dx < -threshold && onSwipeLeft) {
          onSwipeLeft(); // 向左滑动
          Animated.spring(translateX, {
            toValue: 0, // 重置动画值
            useNativeDriver: false,
          }).start();
        } else {
          // 未达到阈值，归位
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      } else {
        if (dy > threshold && onSwipeDown) {
          onSwipeDown(); // 向下滑动
          Animated.spring(translateY, {
            toValue: 0, // 重置动画值
            useNativeDriver: false,
          }).start();
        } else if (dy < -threshold && onSwipeUp) {
          onSwipeUp(); // 向上滑动
          Animated.spring(translateY, {
            toValue: 0, // 重置动画值
            useNativeDriver: false,
          }).start();
        } else {
          // 未达到阈值，归位
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      }
      // 重置动画值，无论是否切换页面
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: false,
      }).start();
    },
  });

  return { panResponder, translateX, translateY };
}
