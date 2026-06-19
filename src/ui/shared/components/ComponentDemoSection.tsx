import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type ComponentDemoSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function ComponentDemoSection({
  title,
  description,
  children,
  className,
}: ComponentDemoSectionProps) {
  return (
    <View className={cn('mb-6', className)}>
      <Text className="text-base font-semibold text-foreground">{title}</Text>
      {description ? (
        <Text className="mt-0.5 text-sm text-muted-foreground">{description}</Text>
      ) : null}
      <View className="mt-3 gap-3">{children}</View>
    </View>
  );
}
