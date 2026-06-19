import { Button, type ButtonProps } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';

type FlowButtonProps = ButtonProps & {
  label: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
};

export function FlowButton({
  label,
  icon: ButtonIcon,
  iconPosition = 'left',
  ...props
}: FlowButtonProps) {
  return (
    <Button {...props}>
      {ButtonIcon && iconPosition === 'left' ? (
        <Icon as={ButtonIcon} className="size-4" />
      ) : null}
      <Text>{label}</Text>
      {ButtonIcon && iconPosition === 'right' ? (
        <Icon as={ButtonIcon} className="size-4" />
      ) : null}
    </Button>
  );
}
