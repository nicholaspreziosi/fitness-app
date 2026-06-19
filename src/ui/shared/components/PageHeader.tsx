import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <View className={cn('py-4', className)}>
      <Text className="text-2xl font-semibold text-foreground">{title}</Text>
      {description ? (
        <Text className="mt-1 text-muted-foreground">{description}</Text>
      ) : null}
    </View>
  );
}
