import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export type ListRowAction = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
};

type SwipeableListRowProps = {
  children: React.ReactNode;
  onPress?: () => void;
  actions: ListRowAction[];
  testID?: string;
  accessibilityLabel?: string;
  className?: string;
  contained?: boolean;
  containerClassName?: string;
};

function SwipeActionButton({
  action,
  contained = false,
}: {
  action: ListRowAction;
  contained?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      testID={action.testID}
      className={cn(
        'min-w-[88px] items-center justify-center px-4',
        contained && 'h-full self-stretch',
        action.destructive ? 'bg-destructive' : 'bg-muted'
      )}
      onPress={action.onPress}>
      <Text
        className={cn(
          'text-sm font-medium',
          action.destructive ? 'text-white' : 'text-foreground'
        )}>
        {action.label}
      </Text>
    </Pressable>
  );
}

export function SwipeableListRow({
  children,
  onPress,
  actions,
  testID,
  accessibilityLabel,
  className,
  contained = false,
  containerClassName,
}: SwipeableListRowProps) {
  const swipeableRef = React.useRef<Swipeable>(null);
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const surfaceColor = contained ? theme.card : theme.background;

  const rowSurfaceStyle = React.useMemo<StyleProp<ViewStyle>>(
    () => ({
      width: '100%',
      backgroundColor: surfaceColor,
      opacity: 1,
    }),
    [surfaceColor]
  );

  const closeSwipe = React.useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const runAction = React.useCallback(
    (action: ListRowAction) => {
      closeSwipe();
      action.onPress();
    },
    [closeSwipe]
  );

  const showActionSheet = React.useCallback(() => {
    if (actions.length === 0) {
      return;
    }

    Alert.alert(
      'Actions',
      undefined,
      [
        ...actions.map((action) => ({
          text: action.label,
          style: action.destructive ? ('destructive' as const) : ('default' as const),
          onPress: action.onPress,
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
      { cancelable: true }
    );
  }, [actions]);

  const renderRightActions = React.useCallback(
    () => (
      <View className={cn('flex-row', contained && 'h-full')}>
        {actions.map((action) => (
          <SwipeActionButton
            key={action.label}
            contained={contained}
            action={{
              ...action,
              onPress: () => runAction(action),
            }}
          />
        ))}
      </View>
    ),
    [actions, contained, runAction]
  );

  const rowInnerClassName = cn(contained ? undefined : 'px-1 py-3.5', className);

  const row = onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={
        actions.length > 0
          ? Platform.OS === 'web'
            ? 'Right-click for more actions'
            : 'Swipe left or long-press for more actions'
          : undefined
      }
      testID={testID}
      style={({ pressed }) => [
        rowSurfaceStyle,
        pressed ? { backgroundColor: theme.muted } : null,
      ]}
      onPress={onPress}
      onLongPress={actions.length > 0 && Platform.OS !== 'web' ? showActionSheet : undefined}
      onContextMenu={
        actions.length > 0 && Platform.OS === 'web'
          ? (event) => {
              event.preventDefault();
              showActionSheet();
            }
          : undefined
      }>
      <View className={rowInnerClassName}>{children}</View>
    </Pressable>
  ) : (
    <View style={rowSurfaceStyle} className={rowInnerClassName}>
      {children}
    </View>
  );

  if (actions.length === 0) {
    if (contained) {
      return (
        <View className={cn('overflow-hidden rounded-lg border border-border', containerClassName)}>
          {row}
        </View>
      );
    }

    return row;
  }

  const swipeable = (
    <Swipeable
      ref={swipeableRef}
      overshootRight={false}
      useNativeAnimations={Platform.OS !== 'web'}
      childrenContainerStyle={rowSurfaceStyle}
      containerStyle={rowSurfaceStyle}
      renderRightActions={renderRightActions}>
      {row}
    </Swipeable>
  );

  if (contained) {
    return (
      <View className={cn('overflow-hidden rounded-lg border border-border', containerClassName)}>
        {swipeable}
      </View>
    );
  }

  return swipeable;
}
