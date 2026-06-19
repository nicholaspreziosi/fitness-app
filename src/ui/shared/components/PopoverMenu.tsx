import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import { MoreVertical } from 'lucide-react-native';
import * as React from 'react';
import { Modal, Pressable, View } from 'react-native';

export type PopoverMenuItem = {
  label: string;
  icon?: LucideIcon;
  destructive?: boolean;
  testID?: string;
  onPress: () => void;
};

type PopoverMenuProps = {
  items: PopoverMenuItem[];
  triggerTestID?: string;
  accessibilityLabel?: string;
};

export function PopoverMenu({
  items,
  triggerTestID,
  accessibilityLabel = 'Open actions menu',
}: PopoverMenuProps) {
  const triggerRef = React.useRef<View>(null);
  const [open, setOpen] = React.useState(false);
  const [menuTop, setMenuTop] = React.useState(0);

  const close = React.useCallback(() => {
    setOpen(false);
  }, []);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((_x, y, _width, height) => {
      setMenuTop(y + height + 4);
      setOpen(true);
    });
  };

  const handleItemPress = (item: PopoverMenuItem) => {
    close();
    item.onPress();
  };

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          hitSlop={8}
          testID={triggerTestID}
          className="rounded-md p-1 active:bg-muted/80"
          onPress={(event) => {
            event?.stopPropagation?.();
            openMenu();
          }}>
          <Icon as={MoreVertical} className="size-4 text-muted-foreground" />
        </Pressable>
      </View>

      <Modal animationType="fade" transparent visible={open} onRequestClose={close}>
        <Pressable className="flex-1 bg-black/20" onPress={close}>
          <View
            className="absolute right-4 min-w-40 overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            style={{ top: menuTop }}>
            {items.map((item, index) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                testID={item.testID}
                className={cn(
                  'flex-row items-center gap-2 px-3 py-2.5 active:bg-muted/80',
                  index > 0 && 'border-t border-border'
                )}
                onPress={(event) => {
                  event.stopPropagation?.();
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
        </Pressable>
      </Modal>
    </>
  );
}
