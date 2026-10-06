import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const SHEET_TIMING = {
  duration: 280,
  easing: Easing.bezier(0.22, 1, 0.36, 1),
};

const DISMISS_DRAG_PX = 120;
const SHEET_CORNER_RADIUS = 38;
const SHEET_PANEL_ID = 'ios-bottom-sheet';

const SHEET_BLUR = 'blur(40px) saturate(180%)';

function applySheetGlass(isDark: boolean) {
  if (typeof document === 'undefined') {
    return;
  }

  const node =
    document.getElementById(SHEET_PANEL_ID) ??
    document.querySelector('[data-testid="bottom-sheet"]');
  if (!(node instanceof HTMLElement)) {
    return;
  }

  node.classList.add('ios-sheet-panel');
  node.classList.toggle('ios-sheet-panel-dark', isDark);
  node.style.setProperty('background', 'transparent', 'important');
  node.style.setProperty('background-color', 'transparent', 'important');
  node.style.setProperty('background-image', 'none', 'important');
  node.style.setProperty('backdrop-filter', SHEET_BLUR, 'important');
  node.style.setProperty('-webkit-backdrop-filter', SHEET_BLUR, 'important');

  let parent = node.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    parent.style.setProperty('background', 'transparent', 'important');
    parent.style.setProperty('background-color', 'transparent', 'important');
    parent.style.setProperty('background-image', 'none', 'important');
    parent = parent.parentElement;
  }
}

/**
 * Web bottom sheet. The panel slides up over the page. Feature screens keep
 * the same `visible` / `onClose` API as the native sheet.
 */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const { colorScheme } = useColorScheme();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [rendered, setRendered] = React.useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);
  const dragY = useSharedValue(0);
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  if (visible && !rendered) {
    setRendered(true);
  }

  const requestClose = React.useCallback(() => {
    onCloseRef.current();
  }, []);

  React.useEffect(() => {
    if (visible) {
      setRendered(true);
      dragY.value = 0;
    }

    progress.value = withTiming(visible ? 1 : 0, SHEET_TIMING, (finished) => {
      if (finished && !visible) {
        runOnJS(setRendered)(false);
      }
    });
  }, [dragY, progress, visible]);

  React.useLayoutEffect(() => {
    if (!rendered) {
      return;
    }

    const isDark = colorScheme === 'dark';
    applySheetGlass(isDark);
    if (typeof requestAnimationFrame !== 'function') {
      return;
    }

    let second = 0;
    const first = requestAnimationFrame(() => {
      applySheetGlass(isDark);
      second = requestAnimationFrame(() => applySheetGlass(isDark));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [colorScheme, rendered]);

  const pan = React.useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          dragY.value = Math.max(0, event.translationY);
        })
        .onEnd((event) => {
          if (dragY.value > DISMISS_DRAG_PX || event.velocityY > 800) {
            runOnJS(requestClose)();
            return;
          }

          dragY.value = withTiming(0, SHEET_TIMING);
        }),
    [dragY, requestClose]
  );

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    bottom: (progress.value - 1) * height - dragY.value,
  }));

  if (!rendered) {
    return null;
  }

  const maxBodyHeight = Math.max(240, height - insets.top - 48);

  return (
    <Modal
      transparent
      visible
      animationType="none"
      onRequestClose={requestClose}
      statusBarTranslucent>
      <View className="flex-1 justify-end">
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
          <Pressable
            accessibilityLabel="Close sheet"
            accessibilityRole="button"
            testID="bottom-sheet-backdrop"
            style={StyleSheet.absoluteFill}
            onPress={requestClose}
          />
        </Animated.View>
        <Animated.View
          nativeID={SHEET_PANEL_ID}
          testID="bottom-sheet"
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              backgroundColor: 'transparent',
              borderTopLeftRadius: SHEET_CORNER_RADIUS,
              borderTopRightRadius: SHEET_CORNER_RADIUS,
            },
            sheetStyle,
          ]}>
          <GestureDetector gesture={pan}>
            <View
              accessibilityLabel="Drag to close"
              accessibilityRole="button"
              className="items-center pb-2 pt-2"
              testID="bottom-sheet-grabber">
              <View
                style={{
                  width: 36,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: colorScheme === 'dark' ? '#5A5A5E' : '#C7C7CC',
                }}
              />
            </View>
          </GestureDetector>
          <ScrollView
            bounces={false}
            keyboardShouldPersistTaps="handled"
            style={{ maxHeight: maxBodyHeight, backgroundColor: 'transparent' }}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 16),
              backgroundColor: 'transparent',
            }}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
