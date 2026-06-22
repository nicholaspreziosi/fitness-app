import { TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable } from 'react-native';

const buttonVariants = cva(
  cn(
    'group shrink-0 flex-row items-center justify-center gap-1.5 rounded-lg border border-transparent',
    Platform.select({
      web: 'whitespace-nowrap outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none [&_svg:not([class*="size-"])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
    })
  ),
  {
    variants: {
      variant: {
        default: cn(
          'bg-primary active:bg-primary/90',
          Platform.select({ web: 'hover:bg-primary/90' })
        ),
        destructive: cn(
          'bg-destructive active:bg-destructive/90',
          Platform.select({ web: 'hover:bg-destructive/90' })
        ),
        outline: cn(
          'border-border bg-background active:bg-muted/80',
          Platform.select({ web: 'hover:bg-muted/60' })
        ),
        secondary: cn(
          'bg-muted active:bg-muted/80',
          Platform.select({ web: 'hover:bg-muted/80' })
        ),
        ghost: cn(
          'active:bg-muted/80',
          Platform.select({ web: 'hover:bg-muted/60' })
        ),
        link: '',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-10 gap-1 rounded-md px-3.5 text-sm',
        lg: 'h-12 px-5',
        icon: 'size-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva('text-sm font-medium', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      destructive: 'text-white',
      outline: 'text-foreground',
      secondary: 'text-foreground',
      ghost: 'text-foreground',
      link: cn(
        'text-brand',
        Platform.select({ web: 'underline-offset-4 hover:underline' })
      ),
    },
    size: {
      default: '',
      sm: 'text-xs',
      lg: '',
      icon: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(props.disabled && 'opacity-40', buttonVariants({ variant, size }), className)}
        role="button"
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
