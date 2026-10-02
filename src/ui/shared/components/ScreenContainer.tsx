import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { APP_HEADER_BAR_HEIGHT, TITLE_TOP_PADDING } from '@/src/ui/shared/constants/appHeader';
import { useShowAppHeader } from '@/src/ui/shared/hooks/useShowAppHeader';
import { useOptionalAppHeaderScroll } from '@/src/ui/shared/providers/AppHeaderScrollProvider';
import { useFocusEffect } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform, RefreshControl, View, type LayoutChangeEvent, type ScrollViewProps } from 'react-native';
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
  const useAutomaticSafeArea = Platform.OS === 'ios' && !showAppHeader && scrollable;
  const topPadding = showAppHeader
    ? insets.top + APP_HEADER_BAR_HEIGHT
    : useAutomaticSafeArea
      ? TITLE_TOP_PADDING
      : insets.top + TITLE_TOP_PADDING;
  const bottomPadding = useAutomaticSafeArea ? 16 : Math.max(insets.bottom, 16);
  const [scrollHeight, setScrollHeight] = React.useState(0);
  const scrollOffsetRef = React.useRef(0);
  const scrollRef = React.useRef<ScrollView>(null);
  const [pullRefreshing, setPullRefreshing] = React.useState(false);
  const initialScrollY = 0;
  const needsInitialScrollRef = React.useRef(false);

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
        tintColor={theme.brand}
        colors={[theme.brand]}
        progressViewOffset={Platform.OS === 'android' ? insets.top : undefined}
      />
    ) : undefined;

  const contentPaddingStyle = {
    paddingTop: topPadding,
    paddingBottom: bottomPadding,
  };
  const content = (
    <View
      className={cn(
        'web:mx-auto web:w-full web:max-w-2xl px-4',
        !scrollable && 'flex-1',
        contentClassName
      )}
      style={scrollable ? undefined : contentPaddingStyle}>
      {children}
    </View>
  );

  const useHeaderScroll = showAppHeader && headerScroll;
  const scrollHandler = useHeaderScroll ? headerScroll.scrollHandler : onScroll;
  const safeAreaScrollProps = useAutomaticSafeArea
    ? { contentInsetAdjustmentBehavior: 'automatic' as const }
    : { contentInsetAdjustmentBehavior: 'never' as const };
  const contentMinHeight =
    useAutomaticSafeArea && scrollHeight > 0
      ? Math.max(0, scrollHeight - insets.top - insets.bottom)
      : undefined;
  const scrollContentStyle = [
    {
      paddingTop: topPadding,
      paddingBottom: bottomPadding,
      minHeight: contentMinHeight,
      ...(useAutomaticSafeArea ? {} : { flexGrow: 1 }),
    },
    contentContainerStyle,
  ];
  const onScrollViewLayout = React.useCallback((event: LayoutChangeEvent) => {
    setScrollHeight(event.nativeEvent.layout.height);
  }, []);

  if (!scrollable) {
    return (
      <View className={cn('flex-1 bg-background', className)}>{content}</View>
    );
  }

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
        contentContainerStyle={scrollContentStyle}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        alwaysBounceVertical
        onLayout={onScrollViewLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={scrollHandler}
        {...safeAreaScrollProps}>
        {content}
      </AnimatedScrollView>
    );
  }

  return wrapWithScrollGesture(
    <Animated.ScrollView
      ref={scrollRef}
      className={cn('flex-1 bg-background', className)}
      contentContainerStyle={scrollContentStyle}
      scrollEventThrottle={16}
      onLayout={onScrollViewLayout}
      onContentSizeChange={handleContentSizeChange}
      onScroll={scrollHandler}
      {...safeAreaScrollProps}>
      {content}
    </Animated.ScrollView>
  );
}
