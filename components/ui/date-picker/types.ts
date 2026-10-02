export type DatePickerProps = {
  value?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
  confirmLabel?: string;
  disabled?: boolean;
};
