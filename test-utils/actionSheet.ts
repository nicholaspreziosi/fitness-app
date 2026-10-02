import { useActionSheet } from '@expo/react-native-action-sheet';
import { act } from '@testing-library/react-native';

type PresentedActionSheet = {
  options: string[];
  cancelButtonIndex: number;
  destructiveButtonIndex?: number | number[];
  select: (index?: number) => void;
  selectLabel: (label: string) => void;
  cancel: () => void;
};

export function presentedActionSheet(): PresentedActionSheet {
  const show = useActionSheet().showActionSheetWithOptions as jest.Mock;
  const call = show.mock.calls.at(-1) as
    | [
        {
          options: string[];
          cancelButtonIndex: number;
          destructiveButtonIndex?: number | number[];
        },
        (index?: number) => void,
      ]
    | undefined;

  if (!call) {
    throw new Error('Expected the native action sheet to be presented');
  }

  const [config, select] = call;

  return {
    options: config.options,
    cancelButtonIndex: config.cancelButtonIndex,
    destructiveButtonIndex: config.destructiveButtonIndex,
    select,
    selectLabel(label: string) {
      act(() => {
        select(config.options.indexOf(label));
      });
    },
    cancel() {
      act(() => {
        select(config.cancelButtonIndex);
      });
    },
  };
}
