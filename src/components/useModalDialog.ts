// Opens/closes a native <dialog> as a modal in sync with `open`.
import { useEffect, useRef, type MouseEvent, type SyntheticEvent } from 'react';

export function useModalDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
  }, [open]);

  // Escape fires `cancel`; keep React state as the source of truth.
  const onCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onClose();
  };

  // A click whose target is the dialog element itself is a click on the backdrop.
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return { ref, onCancel, onClick };
}
