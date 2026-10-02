import { THEME } from '@/lib/theme';
import { BottomSheet as ExpoBottomSheet, RNHostView } from '@expo/ui';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { useWindowDimensions, View } from 'react-native';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

/**
 * Flow bottom sheet. Wraps Expo UI's system sheet so feature screens keep the
 * `visible` / `onClose` API and never import `@expo/ui` directly.
 *
 * The sheet presents its content in its own view controller, so React Native
 * touches only reach it through `RNHostView`, which attaches a touch handler.
 * `matchContents` lets the sheet size itself to the hosted content; the
 * explicit width keeps the content full-bleed instead of shrinking to fit.
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const { colorScheme } = useColorScheme();
  const { width } = useWindowDimensions();
  const theme = THEME[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <ExpoBottomSheet
      isPresented={visible}
      onDismiss={onClose}
      contentPadding={0}
      containerColor={theme.card}>
      <RNHostView matchContents>
        <View style={{ width }}>{children}</View>
      </RNHostView>
    </ExpoBottomSheet>
  );
}
