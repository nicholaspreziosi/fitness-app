import { AppHeaderActions } from '@/src/ui/shared/components/AppHeaderActions';
import { FlowLogoLink } from '@/src/ui/shared/components/FlowLogoLink';
import { APP_HEADER_BAR_HEIGHT } from '@/src/ui/shared/constants/appHeader';
import { useShowAppHeader } from '@/src/ui/shared/hooks/useShowAppHeader';
import { useAppHeaderScroll } from '@/src/ui/shared/providers/AppHeaderScrollProvider';
import * as React from 'react';
import { Platform, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AppHeader() {
  const showAppHeader = useShowAppHeader();
  const { headerTranslateY } = useAppHeaderScroll();
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + APP_HEADER_BAR_HEIGHT;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
  }));

  if (!showAppHeader) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: headerHeight,
        zIndex: 100,
        elevation: Platform.OS === 'android' ? 100 : undefined,
        overflow: 'hidden',
      }}>
      <Animated.View
        className="border-b border-border bg-card"
        style={[{ height: headerHeight, paddingTop: insets.top }, animatedStyle]}>
        <View className="h-14 flex-row items-center justify-between pl-1 pr-2">
          <FlowLogoLink />
          <AppHeaderActions />
        </View>
      </Animated.View>
    </View>
  );
}
