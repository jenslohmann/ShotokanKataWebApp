import type { ReactNode } from 'react';
import { Icon } from './Icon';
import './NavBar.css';

interface NavBarProps {
  title: string;
  large?: boolean;
  back?: { label: string; onClick(): void };
  right?: ReactNode;
}

export function NavBar({ title, large = false, back, right }: NavBarProps) {
  return (
    <header className={`nav-bar${large ? ' nav-bar--large' : ''}`}>
      <div className="nav-bar__row">
        <div className="nav-bar__side nav-bar__side--left">
          {back && (
            <button type="button" className="nav-bar__back" onClick={back.onClick}>
              <Icon name="chevronLeft" size={24} />
              <span>{back.label}</span>
            </button>
          )}
        </div>
        {large ? <span className="nav-bar__title" aria-hidden="true" /> : <h1 className="nav-bar__title">{title}</h1>}
        <div className="nav-bar__side nav-bar__side--right">{right}</div>
      </div>
      {large && <h1 className="nav-bar__large-title">{title}</h1>}
    </header>
  );
}
