import { useLayoutEffect, useRef, useState } from 'react';
import { useT } from '../state/SettingsContext';
import { Icon } from './Icon';
import { VocabText } from './VocabText';
import './ExpandableText.css';

interface ExpandableTextProps {
  text: string;
  threshold?: number;
  /** Language of the text, when it can differ from the UI language. */
  lang?: string;
}

/** Two-line clamped text with vocabulary links (ExpandableDescriptionView.swift). */
export function ExpandableText({ text, threshold = 100, lang }: ExpandableTextProps) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || expanded) return;
    const measure = () => setTruncated(element.scrollHeight > element.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text, expanded]);

  const expandable = text.length > threshold || truncated;
  const toggle = () => setExpanded((value) => !value);

  return (
    <div className="expandable-text">
      <div
        ref={ref}
        lang={lang}
        className={`expandable-text__body${expanded ? '' : ' expandable-text__body--clamped'}`}
        onClick={expandable ? toggle : undefined}
      >
        <VocabText text={text} />
      </div>
      {expandable && (
        <button
          type="button"
          className="expandable-text__toggle"
          aria-expanded={expanded}
          aria-label={expanded ? t('common.collapse') : t('common.expand')}
          onClick={toggle}
        >
          <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={14} />
        </button>
      )}
    </div>
  );
}
