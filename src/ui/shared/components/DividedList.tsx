import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';

type DividedListProps = {
  children: React.ReactNode;
  className?: string;
};

export function DividedList({ children, className }: DividedListProps) {
  const items = React.Children.toArray(children).filter(Boolean);

  return (
    <View className={cn('border-y border-border', className)}>
      {items.map((child, index) => (
        <View
          key={index}
          className={index < items.length - 1 ? 'border-b border-border' : undefined}>
          {child}
        </View>
      ))}
    </View>
  );
}
