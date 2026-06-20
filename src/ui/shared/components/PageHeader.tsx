import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  rightAction?: React.ReactNode;
};

export function PageHeader({ title, description, className, rightAction }: PageHeaderProps) {
  return (
    <View className={cn('py-4', className)}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-2xl font-semibold text-foreground">{title}</Text>
          {description ? (
            <Text className="mt-1 text-muted-foreground">{description}</Text>
          ) : null}
        </View>
        {rightAction ? <View>{rightAction}</View> : null}
      </View>
    </View>
  );
}
