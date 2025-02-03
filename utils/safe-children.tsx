import { Children } from 'react';

import { Text } from '@/components/ui/text';

type TextComponent = React.ComponentType<{ className?: string; children?: React.ReactNode }>;

const safeChildren = (children: React.ReactNode, TextComponent: TextComponent = Text) =>
  Children.map(children, (child, index) => {
    if (typeof child === 'string') {
      return <TextComponent key={index}>{child}</TextComponent>;
    }

    return child;
  });

export default safeChildren;
