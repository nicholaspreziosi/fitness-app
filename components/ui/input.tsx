import { cn } from '@/lib/utils';
import * as React from 'react';
import { Platform, Pressable, TextInput, type TextInputProps } from 'react-native';

/** Web focus treatment for text fields. Comboboxes reuse this so focus matches. */
export const webInputFocusClassName =
  'outline-none transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-ring/30';

export function Input({
  className,
  style,
  textAlignVertical = 'center',
  ...props
}: TextInputProps) {
  const inputRef = React.useRef<TextInput>(null);

  return (
    <Pressable
      accessible={false}
      className={cn(
        'h-12 w-full min-w-0 justify-center rounded-lg border border-border bg-background px-3',
        props.editable === false &&
          cn(
            'opacity-40',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
          ),
        Platform.select({
          web: webInputFocusClassName,
        }),
        className
      )}
      onPress={() => inputRef.current?.focus()}>
      <TextInput
        ref={inputRef}
        underlineColorAndroid="transparent"
        {...props}
        textAlignVertical={textAlignVertical}
        className={cn(
          'w-full p-0 text-foreground',
          Platform.select({
            web: 'outline-none selection:bg-brand selection:text-brand-foreground placeholder:text-muted-foreground',
            native: 'placeholder:text-muted-foreground/60',
          })
        )}
        style={[{ fontSize: 14, paddingVertical: 0 }, style]}
      />
    </Pressable>
  );
}
