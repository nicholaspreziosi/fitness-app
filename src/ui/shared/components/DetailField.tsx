import { Text } from '@/components/ui/text';
import { View } from 'react-native';

type DetailFieldProps = {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
};

export function DetailField({ label, value, children }: DetailFieldProps) {
  if (!value && !children) {
    return null;
  }

  return (
    <View className="rounded-lg border border-border bg-card px-3 py-3">
      <Text className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Text>
      {children ?? <Text className="mt-1 text-sm text-foreground">{value}</Text>}
    </View>
  );
}
