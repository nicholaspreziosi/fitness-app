import { Icon } from '@/components/ui/icon';
import { Input, webInputFocusClassName } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/src/ui/shared/components/BottomSheet';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import * as React from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';

export type ComboboxOption = {
  label: string;
  value: string;
};

type ComboboxSelectProps = {
  label?: string;
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  testID?: string;
  className?: string;
};

export function ComboboxSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  testID,
  className,
}: ComboboxSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');

  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <View className={cn('gap-2', className)}>
      {label ? <Label>{label}</Label> : null}

      <View
        className={cn(
          'min-h-11 flex-row items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5',
          Platform.select({ web: webInputFocusClassName })
        )}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={selectedOption?.label ?? placeholder}
          accessibilityState={{ expanded: open }}
          testID={testID}
          className="min-h-7 flex-1 flex-row items-center"
          onPress={() => setOpen(true)}>
          <Text
            className={cn(
              'flex-1 text-sm',
              selectedOption ? 'text-foreground' : 'text-muted-foreground'
            )}>
            {selectedOption?.label ?? placeholder}
          </Text>
        </Pressable>
        {selectedOption ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Clear ${selectedOption.label}`}
            hitSlop={8}
            onPress={() => onChange(undefined)}>
            <Icon as={X} className="size-3.5 text-muted-foreground" />
          </Pressable>
        ) : null}
        <Pressable hitSlop={8} onPress={() => setOpen(true)}>
          <Icon as={ChevronDown} className="size-4 text-muted-foreground" />
        </Pressable>
      </View>

      <BottomSheet visible={open} onClose={close}>
        <View>
          <View className="border-b border-border px-3 py-2">
            <View
              className={cn(
                'flex-row items-center gap-2 rounded-lg border border-border bg-background px-3',
                Platform.select({ web: webInputFocusClassName })
              )}>
              <Icon as={Search} className="size-4 text-muted-foreground" />
              <Input
                autoFocus
                className="h-11 flex-1 border-0 bg-transparent px-0 shadow-none focus-within:border-0 focus-within:ring-0"
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
                const selected = value === option.value;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    className={cn(
                      'flex-row items-center justify-between border-b border-border/60 px-4 py-3 active:bg-muted/70',
                      selected && 'bg-brand/5'
                    )}
                    onPress={() => {
                      onChange(option.value);
                      close();
                    }}>
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
        </View>
      </BottomSheet>
    </View>
  );
}
