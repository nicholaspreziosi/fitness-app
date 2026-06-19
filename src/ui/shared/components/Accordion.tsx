import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type AccordionProps = {
  title: string;
  description?: string;
  badge?: string | number;
  defaultOpen?: boolean;
  compact?: boolean;
  children: React.ReactNode;
  testID?: string;
  className?: string;
};

export function Accordion({
  title,
  description,
  badge,
  defaultOpen = false,
  compact = false,
  children,
  testID,
  className,
}: AccordionProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <View
      testID={testID}
      className={cn(
        compact ? 'border-b border-border' : 'overflow-hidden rounded-lg border border-border bg-card',
        className
      )}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        testID={testID ? `${testID}-trigger` : undefined}
        className={cn(
          'flex-row items-center justify-between gap-3',
          compact ? 'py-2' : 'p-4'
        )}
        onPress={() => setOpen((current) => !current)}>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text
              className={cn(
                'font-medium text-foreground',
                compact ? 'text-sm' : 'text-base font-semibold'
              )}>
              {title}
            </Text>
            {badge !== undefined && badge !== 0 ? (
              <View className="rounded-full bg-primary/10 px-1.5 py-0.5">
                <Text className="text-[11px] font-medium text-primary">{badge}</Text>
              </View>
            ) : null}
          </View>
          {!compact && description ? (
            <Text className="mt-0.5 text-sm text-muted-foreground">{description}</Text>
          ) : null}
        </View>
        <Icon
          as={ChevronDown}
          className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </Pressable>

      <View
        className={cn(
          'gap-3',
          compact ? 'pb-3' : 'gap-4 border-t border-border px-4 pb-4 pt-4',
          !open && 'hidden'
        )}>
        {children}
      </View>
    </View>
  );
}
