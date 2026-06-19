import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import * as CheckboxPrimitive from '@rn-primitives/checkbox';
import { Check } from 'lucide-react-native';
import { Platform } from 'react-native';

const DEFAULT_HIT_SLOP = 20;

function Checkbox({
  className,
  checkedClassName,
  indicatorClassName,
  iconClassName,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  checkedClassName?: string;
  indicatorClassName?: string;
  iconClassName?: string;
}) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'size-[18px] shrink-0 items-center justify-center rounded-full border-2 border-border bg-background',
        Platform.select({
          web: 'cursor-pointer outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40',
        }),
        props.checked && cn('border-primary bg-primary', checkedClassName),
        props.disabled && 'opacity-40',
        className
      )}
      hitSlop={DEFAULT_HIT_SLOP}
      {...props}>
      <CheckboxPrimitive.Indicator
        className={cn('items-center justify-center', indicatorClassName)}>
        <Icon
          as={Check}
          size={11}
          strokeWidth={3}
          className={cn('text-primary-foreground', iconClassName)}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
