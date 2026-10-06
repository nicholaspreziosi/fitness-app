import { webInputFocusClassName } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Platform, TextInput } from 'react-native';

function Textarea({
  className,
  multiline = true,
  numberOfLines = Platform.select({ web: 2, native: 8 }), // On web, numberOfLines also determines initial height. On native, it determines the maximum height.
  placeholderClassName,
  ...props
}: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        'flex min-h-16 w-full flex-row rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground',
        Platform.select({
          web: cn(
            webInputFocusClassName,
            'field-sizing-content resize-y placeholder:text-muted-foreground disabled:cursor-not-allowed'
          ),
        }),
        props.editable === false && 'opacity-50',
        className
      )}
      placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      {...props}
    />
  );
}

export { Textarea };
