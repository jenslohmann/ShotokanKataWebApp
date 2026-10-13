import { useModalDialog } from './useModalDialog';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel(): void;
  onConfirm(): void;
}

export function ConfirmDialog({ open, title, message, cancelLabel, confirmLabel, onCancel, onConfirm }: ConfirmDialogProps) {
  const dialog = useModalDialog(open, onCancel);
  return (
    <dialog
      ref={dialog.ref}
      className="confirm-dialog"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      onCancel={dialog.onCancel}
      onClick={dialog.onClick}
    >
      {open && (
        <div className="confirm-dialog__panel">
          <h2 id="confirm-dialog-title" className="confirm-dialog__title">
            {title}
          </h2>
          <p id="confirm-dialog-message" className="confirm-dialog__message">
            {message}
          </p>
          <div className="confirm-dialog__buttons">
            <button type="button" className="confirm-dialog__button" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className="confirm-dialog__button confirm-dialog__button--destructive" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
