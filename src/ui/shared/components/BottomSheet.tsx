import { useKeyboardInset } from '@/src/ui/shared/hooks/useKeyboardInset';
import * as React from 'react';
import { Keyboard, Modal, Pressable, View } from 'react-native';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const keyboardHeight = useKeyboardInset();
  const keyboardVisibleRef = React.useRef(false);

  React.useEffect(() => {
    keyboardVisibleRef.current = keyboardHeight > 0;
  }, [keyboardHeight]);

  const handleDismissAttempt = React.useCallback(() => {
    if (keyboardVisibleRef.current) {
      Keyboard.dismiss();
      return;
    }

    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismissAttempt}>
      <View className="flex-1">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
          className="absolute inset-0 bg-black/40"
          onPress={handleDismissAttempt}
        />
        <View className="flex-1 justify-end" pointerEvents="box-none">
          <Pressable onPress={(event) => event.stopPropagation()}>
            <View style={{ marginBottom: keyboardHeight }}>{children}</View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
