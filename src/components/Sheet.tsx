import type { ReactNode } from 'react';
import { useModalDialog } from './useModalDialog';
import './Sheet.css';

interface SheetAction {
  label: string;
  onClick(): void;
}

interface SheetProps {
  open: boolean;
  title: string;
  onClose(): void;
  leftAction?: SheetAction;
  rightAction?: SheetAction;
  children: ReactNode;
}

export function Sheet({ open, title, onClose, leftAction, rightAction, children }: SheetProps) {
  const { ref, onCancel, onClick } = useModalDialog(open, onClose);
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="sheet-title" onCancel={onCancel} onClick={onClick}>
      {open && (
        <div className="sheet__panel">
          <header className="sheet__header">
            <div className="sheet__action sheet__action--left">
              {leftAction && (
                <button type="button" className="sheet__button" onClick={leftAction.onClick}>
                  {leftAction.label}
                </button>
              )}
            </div>
            <h2 id="sheet-title" className="sheet__title">
              {title}
            </h2>
            <div className="sheet__action sheet__action--right">
              {rightAction && (
                <button type="button" className="sheet__button sheet__button--primary" onClick={rightAction.onClick}>
                  {rightAction.label}
                </button>
              )}
            </div>
          </header>
          <div className="sheet__body">{children}</div>
        </div>
      )}
    </dialog>
  );
}
