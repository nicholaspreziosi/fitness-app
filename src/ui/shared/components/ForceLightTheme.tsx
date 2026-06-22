import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import { View } from 'react-native';

type ForceLightThemeProps = {
  children: ReactNode;
  className?: string;
};

export function ForceLightTheme({ children, className }: ForceLightThemeProps) {
  return <View className={cn('light flex-1', className)}>{children}</View>;
}
