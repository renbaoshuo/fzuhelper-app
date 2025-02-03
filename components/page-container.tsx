import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

export type ThemedViewProps = ViewProps;

// 这个组件的作用是为页面提供一个背景色为 bg-muted、高度至少撑满的容器
// 如果需要自定义样式，可以通过 className 属性传入&覆盖
// 页面编写时，应该将所有内容放在这个容器内。如果页面内容需要滚动，可以在这个容器内嵌套 ScrollView 组件
export default function PageContainer({ className, ...otherProps }: ThemedViewProps) {
  return <View className={cn('flex-1 bg-muted', className)} {...otherProps} />;
}
