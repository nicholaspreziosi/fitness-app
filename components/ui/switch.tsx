import { cn } from '@/lib/utils';
import * as SwitchPrimitives from '@rn-primitives/switch';
import { Platform } from 'react-native';

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitives.Root>) {
  return (
    <SwitchPrimitives.Root
      className={cn(
        'h-6 w-11 shrink-0 flex-row items-center rounded-full border border-transparent px-0.5',
        Platform.select({
          web: 'cursor-pointer outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40',
        }),
        props.checked ? 'bg-brand' : 'bg-muted',
        props.disabled && 'opacity-40',
        className
      )}
      {...props}>
      <SwitchPrimitives.Thumb
        className={cn(
          'size-5 rounded-full border border-border/40 bg-background',
          Platform.select({ web: 'transition-transform' }),
          props.checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
