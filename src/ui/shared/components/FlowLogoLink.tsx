import { FlowLogo } from '@/src/ui/shared/components/FlowLogo';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';

export function FlowLogoLink() {
  return (
    <Link href="/(tabs)/home" asChild>
      <Pressable
        accessibilityLabel="Go to Dashboard"
        accessibilityRole="link"
        className="py-2 pl-4 pr-2">
        <FlowLogo variant="header" />
      </Pressable>
    </Link>
  );
}
