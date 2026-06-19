import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Pressable, View } from 'react-native';

export type SegmentedControlOption<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  testID,
  className,
}: SegmentedControlProps<T>) {
  return (
    <View
      testID={testID}
      className={cn('flex-row rounded-lg border border-border bg-muted/50 p-1', className)}>
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            testID={testID ? `${testID}-${option.value}` : undefined}
            className="flex-1 items-center rounded-md border border-border bg-card px-3 py-2"
            style={{ opacity: selected ? 1 : 0.55 }}
            onPress={() => onChange(option.value)}>
            <Text
              className={cn(
                'text-sm font-medium',
                selected ? 'text-foreground' : 'text-muted-foreground'
              )}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
