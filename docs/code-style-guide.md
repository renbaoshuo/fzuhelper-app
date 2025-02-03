# 代码规范 & 代码风格指南

## import 分组顺序

import 内容主要分为三组：

1. 标准库导入（React、Expo 等外部库）
2. 组件导入（`@/components` 目录下的文件）
3. 其他导入（`@/lib`、`@/utils` 等目录下的工具类函数等）

## 组件使用

1. 使用已经封装好的组件来应用主题样式，避免自行配置。
   1. 如使用 `@/components/text` 组件来代替从 `react-native` 中导入的 `Text` 组件。
2. 使用 `@/components` 目录下的组件，避免使用 `TouchableOpacity` 等较低层组件。

## 页面编写

1. 对于一般的页面，请使用 `PageContainer` 作为页面顶层组件。
2. 不要混用 function 和箭头函数定义组件、函数等，推荐使用箭头函数，以配合 `useCallback` 等优化。

## 正确使用 ESLint

1. 请确保你的代码通过 ESLint 检查，避免提交时出现错误。
   1. VSCode 可以安装 ESLint 插件，以实时检查代码。
2. 临时关闭规则前需要慎重考虑，并征求主要负责同学的意见，以尝试可能的解决方案。
3. 多想想是不是自己的错误。不要因为自己的错误而关闭某条规则。
   1. 常见的错误有 `react-hooks/exhaustive-deps`、`react-hooks/rules-of-hooks` 等，这些情况下大概率是你的代码写错了。
