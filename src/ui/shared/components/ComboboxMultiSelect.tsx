import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/src/ui/shared/components/BottomSheet';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

export type ComboboxOption = {
  label: string;
  value: string;
};

type ComboboxMultiSelectProps = {
  label?: string;
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  testID?: string;
};

export function ComboboxMultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select options',
  searchPlaceholder = 'Search...',
  className,
  testID,
}: ComboboxMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const selectedOptions = options.filter((option) => value.includes(option.value));
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const toggleValue = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }

    onChange([...value, optionValue]);
  };

  const removeValue = (optionValue: string) => {
    onChange(value.filter((item) => item !== optionValue));
  };

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View className={cn('gap-2', className)}>
      {label ? <Label>{label}</Label> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={placeholder}
        accessibilityState={{ expanded: open }}
        testID={testID}
        className={cn(
          'min-h-11 flex-row flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2',
          open && 'border-brand/40'
        )}
        onPress={() => setOpen(true)}>
        {selectedOptions.length === 0 ? (
          <Text className="flex-1 py-1 text-sm text-muted-foreground">{placeholder}</Text>
        ) : (
          selectedOptions.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              className="flex-row items-center gap-1 rounded-md border border-border bg-muted/70 px-2 py-0.5 active:bg-muted"
              onPress={(event) => {
                event?.stopPropagation?.();
                removeValue(option.value);
              }}>
              <Text className="text-xs font-medium text-foreground">{option.label}</Text>
              <Icon as={X} className="size-3 text-muted-foreground" />
            </Pressable>
          ))
        )}
        <View className="ml-auto pl-1">
          <Icon as={ChevronDown} className="size-4 text-muted-foreground" />
        </View>
      </Pressable>

      <BottomSheet visible={open} onClose={close}>
        <View>
          <View className="border-b border-border px-3 py-2">
            <View className="flex-row items-center gap-2 rounded-lg border border-border bg-background px-3">
              <Icon as={Search} className="size-4 text-muted-foreground" />
              <Input
                autoFocus
                className="h-11 flex-1 border-0 bg-transparent px-0 shadow-none"
                placeholder={searchPlaceholder}
                value={query}
                onChangeText={setQuery}
              />
            </View>
          </View>

          <ScrollView className="max-h-64" keyboardShouldPersistTaps="handled">
            {filteredOptions.length === 0 ? (
              <View className="px-4 py-6">
                <Text className="text-center text-sm text-muted-foreground">No results found.</Text>
              </View>
            ) : (
              filteredOptions.map((option) => {
                const selected = value.includes(option.value);

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="checkbox"
                    accessibilityLabel={option.label}
                    accessibilityState={{ checked: selected }}
                    className={cn(
                      'flex-row items-center justify-between border-b border-border/60 px-4 py-3 active:bg-muted/70',
                      selected && 'bg-brand/5'
                    )}
                    onPress={() => toggleValue(option.value)}>
                    <Text
                      className={cn(
                        'text-sm text-foreground',
                        selected && 'font-medium text-brand-ink'
                      )}>
                      {option.label}
                    </Text>
                    {selected ? (
                      <Icon as={Check} className="size-4 text-brand-ink" strokeWidth={2.5} />
                    ) : (
                      <View className="size-4" />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View className="flex-row items-center justify-between border-t border-border px-4 py-3">
            <Text className="text-xs text-muted-foreground">{value.length} selected</Text>
            <Pressable
              accessibilityRole="button"
              className="rounded-lg bg-primary px-4 py-2.5 active:bg-primary/90"
              onPress={close}>
              <Text className="text-xs font-medium text-primary-foreground">Done</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

// Backwards-compatible alias
export type MultiSelectOption = ComboboxOption;
export { ComboboxMultiSelect as MultiSelect };
