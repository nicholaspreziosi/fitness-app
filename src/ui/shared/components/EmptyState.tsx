import { FlowButton } from '@/src/ui/shared/components/FlowButton';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import { InboxIcon } from 'lucide-react-native';
import { View } from 'react-native';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  icon: EmptyIcon = InboxIcon,
  title,
  description,
  actionLabel,
  actionIcon,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <View
      className={cn(
        'items-center rounded-lg border border-dashed border-border/80 bg-muted/30 px-6 py-10',
        className
      )}>
      <View className="mb-3 rounded-lg border border-border bg-background p-2.5">
        <Icon as={EmptyIcon} className="size-5 text-muted-foreground" />
      </View>
      <Text className="text-center text-sm font-medium text-foreground">{title}</Text>
      <Text className="mt-1.5 text-center text-sm leading-5 text-muted-foreground">{description}</Text>
      {actionLabel && onAction ? (
        <FlowButton
          className="mt-4"
          icon={actionIcon}
          label={actionLabel}
          onPress={onAction}
          size="sm"
          variant="outline"
        />
      ) : null}
    </View>
  );
}
