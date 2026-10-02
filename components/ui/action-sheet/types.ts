export type ActionSheetAction = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  testID?: string;
};

export type ActionSheetProps = {
  open: boolean;
  onClose: () => void;
  actions: ActionSheetAction[];
  title?: string;
  message?: string;
};
