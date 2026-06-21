import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type FlowLogoVariant = 'header' | 'auth-mobile' | 'auth-desktop';

type FlowLogoProps = {
  variant?: FlowLogoVariant;
  className?: string;
};

const LOGO_TEXT_CLASS: Record<FlowLogoVariant, string> = {
  header: 'text-3xl font-semibold tracking-[-0.04em] text-foreground',
  'auth-mobile': 'text-3xl font-semibold tracking-[-0.04em] text-foreground',
  'auth-desktop': 'text-4xl font-semibold tracking-[-0.04em] text-auth-brand-foreground md:text-5xl',
};

const LOGO_ACCENT_CLASS: Record<FlowLogoVariant, string> = {
  header: 'mt-2 h-0.5 w-10',
  'auth-mobile': 'mt-2 h-0.5 w-8',
  'auth-desktop': 'mt-3 h-0.5 w-9',
};

export function FlowLogo({ variant = 'header', className }: FlowLogoProps) {
  return (
    <View className={cn(variant === 'header' ? 'items-start' : 'items-center', className)}>
      <Text className={LOGO_TEXT_CLASS[variant]}>Flow</Text>
      <View className={cn('rounded-full bg-primary', LOGO_ACCENT_CLASS[variant])} />
    </View>
  );
}
