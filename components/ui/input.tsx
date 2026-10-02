import { cn } from '@/lib/utils';
import { Platform, TextInput } from 'react-native';

function Input({
  className,
  ...props
}: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        'h-12 w-full min-w-0 flex-row items-center rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-5 text-foreground',
        props.editable === false &&
          cn(
            'opacity-40',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
          ),
        Platform.select({
          web: cn(
            'outline-none transition-colors selection:bg-brand selection:text-brand-foreground placeholder:text-muted-foreground',
            'focus-visible:border-brand/50 focus-visible:ring-2 focus-visible:ring-ring/30'
          ),
          native: 'placeholder:text-muted-foreground/60',
        }),
        className
      )}
      {...props}
    />
  );
}

export { Input };
