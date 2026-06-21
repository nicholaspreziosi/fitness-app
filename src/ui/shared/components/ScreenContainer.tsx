import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { APP_HEADER_BAR_HEIGHT } from '@/src/ui/shared/constants/appHeader';
import { useShowAppHeader } from '@/src/ui/shared/hooks/useShowAppHeader';
import { useOptionalAppHeaderScroll } from '@/src/ui/shared/providers/AppHeaderScrollProvider';
import { useFocusEffect } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform, RefreshControl, View, type ScrollViewProps } from 'react-native';
import { GestureDetector, ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type ScreenContainerProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
  contentClassName?: string;
  refreshing?: boolean;
  onRefresh?: () => void | Promise<unknown>;
  refreshEnabled?: boolean;
  scrollGesture?: React.ComponentProps<typeof GestureDetector>['gesture'];
} & Pick<ScrollViewProps, 'contentContainerStyle'>;

export function ScreenContainer({
  children,
  scrollable = true,
  className,
  contentClassName,
  contentContainerStyle,
  refreshing = false,
  onRefresh,
  refreshEnabled = true,
  scrollGesture,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const showAppHeader = useShowAppHeader();
  const headerScroll = useOptionalAppHeaderScroll();
  const topPadding = showAppHeader ? insets.top + APP_HEADER_BAR_HEIGHT : 0;
  const bottomPadding = Math.max(insets.bottom, 16);
  const scrollOffsetRef = React.useRef(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const [pullRefreshing, setPullRefreshing] = React.useState(false);
  const useIosRefreshInset = onRefresh != null && Platform.OS === 'ios' && topPadding > 0;
  const initialScrollY = useIosRefreshInset ? -topPadding : 0;
  const needsInitialScrollRef = React.useRef(useIosRefreshInset);

  React.useLayoutEffect(() => {
    needsInitialScrollRef.current = useIosRefreshInset;
  }, [useIosRefreshInset]);

  const applyInitialScrollPosition = React.useCallback(() => {
    scrollRef.current?.scrollTo({ x: 0, y: initialScrollY, animated: false });
    scrollOffsetRef.current = Math.max(0, initialScrollY);
    headerScroll?.resetHeaderScroll(scrollOffsetRef.current);
  }, [headerScroll, initialScrollY]);

  const handleContentSizeChange = React.useCallback(() => {
    if (!needsInitialScrollRef.current) {
      return;
    }

    applyInitialScrollPosition();
    needsInitialScrollRef.current = false;
  }, [applyInitialScrollPosition]);

  React.useLayoutEffect(() => {
    if (!scrollable) {
      return;
    }

    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      if (cancelled) {
        return;
      }

      if (!scrollRef.current) {
        return;
      }

      applyInitialScrollPosition();
      needsInitialScrollRef.current = false;
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [applyInitialScrollPosition, scrollable]);

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

  const handleRefresh = React.useCallback(async () => {
    if (!onRefresh || !refreshEnabled) {
      return;
    }

    setPullRefreshing(true);

    try {
      await onRefresh();
    } finally {
      setPullRefreshing(false);
    }
  }, [onRefresh, refreshEnabled]);

  const showRefreshing = pullRefreshing || refreshing;

  const refreshControl =
    onRefresh != null ? (
      <RefreshControl
        enabled={refreshEnabled}
        refreshing={showRefreshing}
        onRefresh={handleRefresh}
        tintColor={theme.primary}
        colors={[theme.primary]}
        progressViewOffset={Platform.OS === 'android' ? topPadding : undefined}
      />
    ) : undefined;

  const content = (
    <View
      className={cn(
        'web:mx-auto web:w-full web:max-w-2xl flex-1 px-4',
        contentClassName
      )}
      style={{
        paddingTop: useIosRefreshInset ? 0 : topPadding,
        paddingBottom: bottomPadding,
      }}>
      {children}
    </View>
  );

  if (!scrollable) {
    return (
      <View className={cn('flex-1 bg-background', className)}>{content}</View>
    );
  }

  const useHeaderScroll = showAppHeader && headerScroll;
  const scrollHandler = useHeaderScroll ? headerScroll.scrollHandler : onScroll;
  const iosRefreshScrollProps = React.useMemo(() => {
    if (!useIosRefreshInset) {
      return undefined;
    }

    return {
      contentInset: { top: topPadding },
      contentInsetAdjustmentBehavior: 'never' as const,
    };
  }, [topPadding, useIosRefreshInset]);

  const wrapWithScrollGesture = (scrollView: React.ReactElement) =>
    scrollGesture != null ? (
      <GestureDetector gesture={scrollGesture}>{scrollView}</GestureDetector>
    ) : (
      scrollView
    );

  if (onRefresh != null) {
    return wrapWithScrollGesture(
      <AnimatedScrollView
        ref={scrollRef}
        className={cn('flex-1 bg-background', className)}
        contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
        contentContainerClassName="flex-grow"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        onContentSizeChange={handleContentSizeChange}
        onScroll={scrollHandler}
        {...iosRefreshScrollProps}>
        {content}
      </AnimatedScrollView>
    );
  }

  return wrapWithScrollGesture(
    <Animated.ScrollView
      ref={scrollRef}
      className={cn('flex-1 bg-background', className)}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      contentContainerClassName="flex-grow"
      scrollEventThrottle={16}
      onContentSizeChange={handleContentSizeChange}
      onScroll={scrollHandler}>
      {content}
    </Animated.ScrollView>
  );
}
