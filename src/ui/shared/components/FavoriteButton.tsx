import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { HeartIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

type FavoriteButtonProps = {
  favorite: boolean;
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  className?: string;
  iconClassName?: string;
};

export function FavoriteButton({
  favorite,
  onPress,
  testID,
  accessibilityLabel,
  className,
  iconClassName,
}: FavoriteButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (favorite ? 'Remove from favorites' : 'Add to favorites')
      }
      className={cn('items-center justify-center p-1', className)}
      hitSlop={4}
      testID={testID}
      onPress={(event) => {
        event?.stopPropagation?.();
        onPress();
      }}>
      <Icon
        as={HeartIcon}
        className={cn(
          'size-6',
          favorite ? 'text-destructive' : 'text-muted-foreground',
          iconClassName
        )}
        fill={favorite ? 'currentColor' : 'none'}
        size={24}
      />
    </Pressable>
  );
}
