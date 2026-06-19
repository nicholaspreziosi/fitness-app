import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';
import * as React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

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

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        testID={testID}
        className={cn(
          'min-h-9 flex-row items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2',
          open && 'border-primary/40'
        )}
        onPress={() => setOpen(true)}>
        {selectedOption ? (
          <View className="flex-1 flex-row items-center gap-1">
            <Text className="flex-1 text-sm text-foreground">{selectedOption.label}</Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={(event) => {
                event.stopPropagation?.();
                onChange(undefined);
              }}>
              <Icon as={X} className="size-3.5 text-muted-foreground" />
            </Pressable>
          </View>
        ) : (
          <Text className="flex-1 text-sm text-muted-foreground">{placeholder}</Text>
        )}
        <Icon as={ChevronDown} className="size-4 text-muted-foreground" />
      </Pressable>

      <Modal animationType="fade" transparent visible={open} onRequestClose={close}>
        <Pressable className="flex-1 bg-black/40 px-4 pt-28" onPress={close}>
          <Pressable
            className="overflow-hidden rounded-xl border border-border bg-card"
            onPress={(event) => event.stopPropagation?.()}>
            <View className="border-b border-border px-3 py-2">
              <View className="flex-row items-center gap-2 rounded-lg border border-border bg-background px-3">
                <Icon as={Search} className="size-4 text-muted-foreground" />
                <Input
                  autoFocus
                  className="h-9 flex-1 border-0 bg-transparent px-0 shadow-none"
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
                        selected && 'bg-primary/5'
                      )}
                      onPress={() => {
                        onChange(option.value);
                        close();
                      }}>
                      <Text
                        className={cn(
                          'text-sm text-foreground',
                          selected && 'font-medium text-primary'
                        )}>
                        {option.label}
                      </Text>
                      {selected ? (
                        <Icon as={Check} className="size-4 text-primary" strokeWidth={2.5} />
                      ) : (
                        <View className="size-4" />
                      )}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
