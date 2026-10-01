import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { ActivityIndicator, View } from 'react-native';

type LoadingStateProps = {
  className?: string;
};

export function LoadingState({ className }: LoadingStateProps) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  return (
    <View className={cn('items-center py-6', className)} testID="loading-state">
      <ActivityIndicator accessibilityLabel="loading" color={theme.brand} size="large" />
    </View>
  );
}
