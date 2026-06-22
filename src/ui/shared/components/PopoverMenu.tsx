import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import { MoreVertical } from 'lucide-react-native';
import * as React from 'react';
import { Dimensions, Modal, Pressable, View } from 'react-native';

export type PopoverMenuItem = {
  label: string;
  icon?: LucideIcon;
  destructive?: boolean;
  testID?: string;
  onPress: () => void;
};

type PopoverMenuProps = {
  items: PopoverMenuItem[];
  trigger?: React.ReactNode;
  triggerTestID?: string;
  accessibilityLabel?: string;
  size?: 'default' | 'lg';
  menuAlign?: 'start' | 'end';
};

const MENU_MIN_WIDTH = 160;
const SCREEN_PADDING = 8;

function computeMenuLeft(
  triggerX: number,
  triggerWidth: number,
  menuWidth: number,
  align: 'start' | 'end'
): number {
  const screenWidth = Dimensions.get('window').width;
  let left = align === 'end' ? triggerX + triggerWidth - menuWidth : triggerX;

  if (left + menuWidth > screenWidth - SCREEN_PADDING) {
    left = triggerX + triggerWidth - menuWidth;
  }

  if (left < SCREEN_PADDING) {
    left = SCREEN_PADDING;
  }

  return left;
}

export function PopoverMenu({
  items,
  trigger,
  triggerTestID,
  accessibilityLabel = 'Open actions menu',
  size = 'default',
  menuAlign = 'start',
}: PopoverMenuProps) {
  const triggerRef = React.useRef<View>(null);
  const [open, setOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(
    null
  );

  const close = React.useCallback(() => {
    setOpen(false);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setMenuPosition(null);
    }
  }, [open]);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({
        top: y + height + 4,
        left: computeMenuLeft(x, width, MENU_MIN_WIDTH, menuAlign),
      });
      setOpen(true);
    });
  };

  const handleItemPress = (item: PopoverMenuItem) => {
    close();
    item.onPress();
  };

  const triggerNode = trigger ?? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      testID={triggerTestID}
      className={cn(
        'rounded-md active:bg-muted/80',
        size === 'lg' ? 'p-2.5' : 'p-1'
      )}
      onPress={(event) => {
        event?.stopPropagation?.();
        openMenu();
      }}>
      <Icon
        as={MoreVertical}
        className={cn(
          'text-muted-foreground',
          size === 'lg' ? 'size-6' : 'size-4'
        )}
      />
    </Pressable>
  );

  const renderedTrigger = trigger
    ? React.isValidElement(trigger)
      ? React.cloneElement(trigger as React.ReactElement<{ onPress?: () => void }>, {
          onPress: () => {
            openMenu();
          },
        })
      : trigger
    : triggerNode;

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        {renderedTrigger}
      </View>

      <Modal animationType="none" transparent visible={open} onRequestClose={close}>
        <View className="flex-1">
          <Pressable className="absolute inset-0 bg-black/20" onPress={close} />
          {menuPosition ? (
            <View
              className="absolute min-w-40 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
              style={{ top: menuPosition.top, left: menuPosition.left }}>
              {items.map((item, index) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  testID={item.testID}
                  className={cn(
                    'flex-row items-center gap-2 px-3 py-3 active:bg-muted/80',
                    index > 0 && 'border-t border-border'
                  )}
                  onPress={(event) => {
                    event?.stopPropagation?.();
                    handleItemPress(item);
                  }}>
                  {item.icon ? (
                    <Icon
                      as={item.icon}
                      className={cn(
                        'size-4',
                        item.destructive ? 'text-destructive' : 'text-muted-foreground'
                      )}
                    />
                  ) : null}
                  <Text
                    className={cn(
                      'text-sm font-medium',
                      item.destructive ? 'text-destructive' : 'text-foreground'
                    )}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </Modal>
    </>
  );
}
