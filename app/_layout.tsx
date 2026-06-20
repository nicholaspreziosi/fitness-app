import '@/global.css';
import 'react-native-gesture-handler';

import { queryClient } from '@/src/lib/query/client';
import { AuthProvider } from '@/src/ui/shared/providers/AuthProvider';
import { AuthRootNavigator } from '@/src/ui/shared/providers/AuthRootNavigator';
import { PortalHost } from '@rn-primitives/portal';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthRootNavigator />
            <PortalHost />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
