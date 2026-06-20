import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { useColorScheme } from 'nativewind';
import { Pressable, StyleSheet, View } from 'react-native';

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
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  return (
    <View
      testID={testID}
      className={cn('flex-row rounded-lg p-1', className)}
      style={{ backgroundColor: theme.muted }}>
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            testID={testID ? `${testID}-${option.value}` : undefined}
            style={[
              styles.segment,
              {
                backgroundColor: selected ? theme.card : 'transparent',
                opacity: selected ? 1 : 0.55,
              },
            ]}
            onPress={() => onChange(option.value)}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: selected ? theme.foreground : theme.mutedForeground,
              }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
