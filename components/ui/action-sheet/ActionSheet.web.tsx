import type { ActionSheetAction, ActionSheetProps } from '@/components/ui/action-sheet/types';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const SHEET_TIMING = {
  duration: 260,
  easing: Easing.bezier(0.22, 1, 0.36, 1),
};

const CARD_MAX_WIDTH = 350;
const CARD_MARGIN = 20;
const CARD_RADIUS = 38;
const CARD_PADDING = 16;
const ACTION_HEIGHT = 50;
const ACTION_GAP = 11;
const GLASS_BLUR = 'blur(28px) saturate(190%)';
const GLASS_CLASS = 'ios-action-sheet-glass';
const CARD_ID = 'ios-action-sheet';

const COLORS = {
  light: {
    glass: 'rgba(255, 255, 255, 0.64)',
    edge: 'rgba(255, 255, 255, 0.8)',
    action: 'rgba(120, 120, 128, 0.14)',
    actionPressed: 'rgba(120, 120, 128, 0.26)',
    destructive: '#FF3B30',
    scrim: 'rgba(0, 0, 0, 0.2)',
  },
  dark: {
    glass: 'rgba(40, 40, 42, 0.58)',
    edge: 'rgba(255, 255, 255, 0.16)',
    action: 'rgba(255, 255, 255, 0.1)',
    actionPressed: 'rgba(255, 255, 255, 0.2)',
    destructive: '#FF453A',
    scrim: 'rgba(0, 0, 0, 0.36)',
  },
};

/**
 * Liquid Glass: a translucent fill with a strong backdrop blur and a bright
 * hairline edge. Inline `important` styles win over whatever background the
 * modal tree gets from the page, and the ancestors inside the modal are made
 * transparent so the blur can see the content behind.
 */
function applyGlass() {
  if (typeof document === 'undefined') {
    return;
  }

  const card = document.getElementById(CARD_ID);
  if (!(card instanceof HTMLElement)) {
    return;
  }

  card.classList.add(GLASS_CLASS);
  card.style.setProperty('backdrop-filter', GLASS_BLUR, 'important');
  card.style.setProperty('-webkit-backdrop-filter', GLASS_BLUR, 'important');

  let parent = card.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    parent.style.setProperty('background', 'transparent', 'important');
    parent.style.setProperty('background-color', 'transparent', 'important');
    parent.style.setProperty('background-image', 'none', 'important');
    parent = parent.parentElement;
  }
}

/**
 * Web action sheet matching the iOS 26 action card: a Liquid Glass card with a
 * left-aligned title and description, then each action as a full-width glass
 * pill. Tapping outside the card cancels. Same `open` / `onClose` / `actions`
 * API as the native sheet.
 */
export function ActionSheet({ open, onClose, actions, title, message }: ActionSheetProps) {
  const { colorScheme } = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const palette = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  const { width: viewportWidth } = useWindowDimensions();
  const [rendered, setRendered] = React.useState(open);
  const progress = useSharedValue(open ? 1 : 0);
  const onCloseRef = React.useRef(onClose);

  React.useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  if (open && !rendered) {
    setRendered(true);
  }

  const requestClose = React.useCallback(() => {
    onCloseRef.current();
  }, []);

  const runAction = React.useCallback((action: ActionSheetAction) => {
    onCloseRef.current();
    action.onPress();
  }, []);

  React.useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, SHEET_TIMING, (finished) => {
      if (finished && !open) {
        runOnJS(setRendered)(false);
      }
    });
  }, [open, progress]);

  React.useEffect(() => {
    if (!open || typeof document === 'undefined') {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, requestClose]);

  React.useLayoutEffect(() => {
    if (!rendered) {
      return;
    }

    applyGlass();
    if (typeof requestAnimationFrame !== 'function') {
      return;
    }

    const frame = requestAnimationFrame(applyGlass);
    return () => cancelAnimationFrame(frame);
  }, [rendered, actions.length, title, message]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.92 + progress.value * 0.08 }],
  }));

  if (!rendered) {
    return null;
  }

  const width = Math.min(CARD_MAX_WIDTH, viewportWidth - CARD_MARGIN * 2);
  const hasHeader = Boolean(title || message);

  return (
    <Modal transparent visible animationType="none" onRequestClose={requestClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, scrimStyle]}>
          <Pressable
            accessibilityLabel="Cancel"
            accessibilityRole="button"
            testID="action-sheet-backdrop"
            style={[StyleSheet.absoluteFill, { backgroundColor: palette.scrim }]}
            onPress={requestClose}
          />
        </Animated.View>

        <Animated.View
          nativeID={CARD_ID}
          testID="action-sheet"
          style={[
            styles.card,
            { width, backgroundColor: palette.glass, borderColor: palette.edge },
            cardStyle,
          ]}>
          {hasHeader ? (
            <View style={styles.header}>
              {title ? (
                <Text style={[styles.title, { color: theme.foreground }]}>{title}</Text>
              ) : null}
              {message ? (
                <Text style={[styles.message, { color: theme.mutedForeground }]}>{message}</Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.actions}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                testID={action.testID}
                onPress={() => runAction(action)}
                style={({ pressed }) => [
                  styles.action,
                  { backgroundColor: pressed ? palette.actionPressed : palette.action },
                ]}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.actionLabel,
                    { color: action.destructive ? palette.destructive : theme.foreground },
                  ]}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    padding: CARD_PADDING,
    paddingTop: 22,
    gap: 18,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
  },
  message: {
    fontSize: 16,
    lineHeight: 21,
  },
  actions: {
    gap: ACTION_GAP,
  },
  action: {
    height: ACTION_HEIGHT,
    borderRadius: ACTION_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionLabel: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});
