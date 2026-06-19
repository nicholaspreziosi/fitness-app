import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <View className={cn('mb-3 flex-row items-start justify-between gap-3', className)}>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        {description ? (
          <Text className="mt-0.5 text-sm text-muted-foreground">{description}</Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
