import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Slot } from '@rn-primitives/slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, View } from 'react-native';

const badgeVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5',
    Platform.select({
      web: 'w-fit whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3',
    })
  ),
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary',
        secondary: 'border-transparent bg-muted',
        destructive: 'border-transparent bg-destructive',
        outline: 'border-border bg-transparent',
        success: 'border-transparent bg-success',
        warning: 'border-transparent bg-warning',
        muted: 'border-border bg-muted/60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const badgeTextVariants = cva('text-[11px] font-medium leading-4', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-muted-foreground',
      destructive: 'text-white',
      outline: 'text-muted-foreground',
      success: 'text-white',
      warning: 'text-white',
      muted: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type BadgeProps = React.ComponentProps<typeof View> &
  React.RefAttributes<View> & {
    asChild?: boolean;
  } & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, asChild, ...props }: BadgeProps) {
  const Component = asChild ? Slot : View;
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <Component className={cn(badgeVariants({ variant }), className)} {...props} />
    </TextClassContext.Provider>
  );
}

export { Badge, badgeTextVariants, badgeVariants };
export type { BadgeProps };
