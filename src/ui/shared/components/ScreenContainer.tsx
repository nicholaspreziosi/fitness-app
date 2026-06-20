import { cn } from '@/lib/utils';
import { APP_HEADER_BAR_HEIGHT } from '@/src/ui/shared/constants/appHeader';
import { useShowAppHeader } from '@/src/ui/shared/hooks/useShowAppHeader';
import { useOptionalAppHeaderScroll } from '@/src/ui/shared/providers/AppHeaderScrollProvider';
import { useFocusEffect } from 'expo-router';
import * as React from 'react';
import { View, type ScrollViewProps } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenContainerProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  contentClassName?: string;
} & Pick<ScrollViewProps, 'contentContainerStyle'>;

export function ScreenContainer({
  children,
  scrollable = true,
  className,
  contentClassName,
  contentContainerStyle,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const showAppHeader = useShowAppHeader();
  const headerScroll = useOptionalAppHeaderScroll();
  const topPadding = showAppHeader ? insets.top + APP_HEADER_BAR_HEIGHT : 0;
  const bottomPadding = Math.max(insets.bottom, 16);
  const scrollOffsetRef = React.useRef(0);

  useFocusEffect(
    React.useCallback(() => {
      headerScroll?.resetHeaderScroll(scrollOffsetRef.current);
    }, [headerScroll])
  );

  const onScroll = React.useCallback<NonNullable<ScrollViewProps['onScroll']>>(
    (event) => {
      scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    },
    []
  );

  const content = (
    <View
      className={cn(
        'web:mx-auto web:w-full web:max-w-2xl flex-1 px-4',
        contentClassName
      )}
      style={{ paddingTop: topPadding, paddingBottom: bottomPadding }}>
      {children}
    </View>
  );

  if (!scrollable) {
    return (
      <View className={cn('flex-1 bg-background', className)}>{content}</View>
    );
  }

  const useHeaderScroll = showAppHeader && headerScroll;

  return (
    <Animated.ScrollView
      className={cn('flex-1 bg-background', className)}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      contentContainerClassName="flex-grow"
      scrollEventThrottle={16}
      onScroll={useHeaderScroll ? headerScroll.scrollHandler : onScroll}>
      {content}
    </Animated.ScrollView>
  );
}
