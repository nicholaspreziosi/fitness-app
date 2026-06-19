import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FlowButton } from '@/src/ui/shared/components/FlowButton';
import { Text } from '@/components/ui/text';
import type { LucideIcon } from 'lucide-react-native';
import { LogOut, Trash2 } from 'lucide-react-native';

type ConfirmDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  triggerIcon?: LucideIcon;
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
};

export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  triggerIcon,
  hideTrigger = false,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const icon = triggerIcon ?? (destructive ? Trash2 : LogOut);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {!hideTrigger ? (
        <AlertDialogTrigger asChild>
          <FlowButton
            icon={icon}
            label={triggerLabel}
            variant={destructive ? 'destructive' : 'outline'}
          />
        </AlertDialogTrigger>
      ) : null}
      <AlertDialogContent className="rounded-xl border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>{cancelLabel}</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            className={destructive ? 'bg-destructive active:bg-destructive/90' : undefined}
            onPress={onConfirm}>
            <Text className={destructive ? 'text-white' : undefined}>{confirmLabel}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
