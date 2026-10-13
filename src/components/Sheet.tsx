import { useId, type ReactNode } from 'react';
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
  /** Body without padding, for content that draws its own backgrounds. */
  flush?: boolean;
  children: ReactNode;
}

export function Sheet({ open, title, onClose, leftAction, rightAction, flush = false, children }: SheetProps) {
  const { ref, onCancel, onClick } = useModalDialog(open, onClose);
  const titleId = useId();
  return (
    <dialog ref={ref} className="sheet" aria-labelledby={titleId} onCancel={onCancel} onClick={onClick}>
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
            <h2 id={titleId} className="sheet__title">
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
          <div className={`sheet__body${flush ? ' sheet__body--flush' : ''}`}>{children}</div>
        </div>
      )}
    </dialog>
  );
}
