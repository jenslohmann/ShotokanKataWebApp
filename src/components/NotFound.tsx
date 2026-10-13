import { useT } from '../state/SettingsContext';
import './NotFound.css';

export function NotFound({ href, linkLabel }: { href: string; linkLabel: string }) {
  const t = useT();
  return (
    <p className="not-found">
      {t('common.notFound')} — <a href={href}>{linkLabel}</a>
    </p>
  );
}
