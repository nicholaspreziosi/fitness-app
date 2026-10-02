export type DatePickerProps = {
  value?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
  confirmLabel?: string;
  disabled?: boolean;
};

export type InlineDatePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
};
