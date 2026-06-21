import { THEME } from '@/lib/theme';
import { FlowLogo } from '@/src/ui/shared/components/FlowLogo';
import { useColorScheme } from 'nativewind';
import { View, type LayoutChangeEvent } from 'react-native';

type SplashViewProps = {
  onReady?: () => void;
};

export function SplashView({ onReady }: SplashViewProps) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  const handleLayout = (_event: LayoutChangeEvent) => {
    onReady?.();
  };

  return (
    <View
      testID="splash-screen"
      className="flex-1 items-center justify-center bg-background"
      style={{ backgroundColor: theme.background }}
      onLayout={handleLayout}>
      <FlowLogo variant="auth-mobile" />
    </View>
  );
}
