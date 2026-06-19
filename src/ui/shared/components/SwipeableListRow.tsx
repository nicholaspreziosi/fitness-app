import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export type ListRowAction = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
};

type SwipeableListRowProps = {
  children: React.ReactNode;
  onPress: () => void;
  actions: ListRowAction[];
  testID?: string;
  accessibilityLabel?: string;
  className?: string;
};

function SwipeActionButton({ action }: { action: ListRowAction }) {
  return (
    <Pressable
      accessibilityRole="button"
      testID={action.testID}
      className={cn(
        'min-w-[88px] items-center justify-center px-4',
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
}: SwipeableListRowProps) {
  const swipeableRef = React.useRef<Swipeable>(null);

  const closeSwipe = () => {
    swipeableRef.current?.close();
  };

  const runAction = (action: ListRowAction) => {
    closeSwipe();
    action.onPress();
  };

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

  const renderRightActions = () => (
    <View className="flex-row">
      {actions.map((action) => (
        <SwipeActionButton
          key={action.label}
          action={{
            ...action,
            onPress: () => runAction(action),
          }}
        />
      ))}
    </View>
  );

  const row = (
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
      className={cn('bg-background px-1 py-3.5 active:bg-muted/40', className)}
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
      {children}
    </Pressable>
  );

  if (actions.length === 0) {
    return row;
  }

  return (
    <Swipeable ref={swipeableRef} overshootRight={false} renderRightActions={renderRightActions}>
      {row}
    </Swipeable>
  );
}
