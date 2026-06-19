import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, TextInput, View } from 'react-native';

type PasswordInputProps = React.ComponentProps<typeof TextInput> &
  React.RefAttributes<TextInput>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <View className="relative">
      <Input
        {...props}
        className={cn('pr-10', className)}
        secureTextEntry={!visible}
      />
      <Pressable
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        accessibilityRole="button"
        className="absolute bottom-0 right-0 top-0 w-10 items-center justify-center"
        hitSlop={8}
        onPress={() => setVisible((current) => !current)}>
        <Icon
          as={visible ? EyeOff : Eye}
          className="size-4 text-muted-foreground"
          strokeWidth={2}
        />
      </Pressable>
    </View>
  );
}
