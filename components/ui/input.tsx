import { cn } from '@/lib/utils';
import { Platform, TextInput } from 'react-native';

function Input({ className, ...props }: React.ComponentProps<typeof TextInput> & React.RefAttributes<TextInput>) {
  return (
    <TextInput
      className={cn(
        'border-border bg-background text-foreground h-9 w-full min-w-0 flex-row items-center rounded-lg border px-3 py-1 text-sm leading-5',
        props.editable === false &&
          cn(
            'opacity-40',
            Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
          ),
        Platform.select({
          web: cn(
            'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-colors',
            'focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/30'
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
