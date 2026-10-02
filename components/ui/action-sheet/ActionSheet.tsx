import type { ActionSheetProps } from '@/components/ui/action-sheet/types';
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as React from 'react';

export function ActionSheet({ open, onClose, actions }: ActionSheetProps) {
  const { showActionSheetWithOptions } = useActionSheet();
  const onCloseRef = React.useRef(onClose);
  const actionsRef = React.useRef(actions);
  onCloseRef.current = onClose;
  actionsRef.current = actions;

  React.useEffect(() => {
    if (!open) {
      return;
    }

    const currentActions = actionsRef.current;
    const options = [...currentActions.map((action) => action.label), 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    const destructiveIndexes = currentActions.flatMap((action, index) =>
      action.destructive ? [index] : []
    );

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex:
          destructiveIndexes.length === 0
            ? undefined
            : destructiveIndexes.length === 1
              ? destructiveIndexes[0]
              : destructiveIndexes,
      },
      (selectedIndex) => {
        if (selectedIndex == null || selectedIndex === cancelButtonIndex) {
          onCloseRef.current();
          return;
        }

        const action = actionsRef.current[selectedIndex];
        onCloseRef.current();
        action?.onPress();
      }
    );
  }, [open, showActionSheetWithOptions]);

  return null;
}
