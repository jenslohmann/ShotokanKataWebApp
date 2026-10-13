import { useSyncExternalStore, type MouseEvent } from 'react';
import { getSpeakingText, isSpeechSupported, speak, subscribeSpeaking } from '../domain/speech';
import { useT } from '../state/SettingsContext';
import { Icon } from './Icon';
import './SpeakButton.css';

export function SpeakButton({ text, size = 18 }: { text: string; size?: number }) {
  const t = useT();
  const speakingText = useSyncExternalStore(subscribeSpeaking, getSpeakingText, getSpeakingText);
  if (!isSpeechSupported() || !text) return null;
  const active = speakingText === text;

  const onClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    speak(text);
  };

  return (
    <button
      type="button"
      className={`speak-button${active ? ' speak-button--active' : ''}`}
      aria-label={t('vocabulary.speak')}
      aria-pressed={active}
      onClick={onClick}
    >
      <Icon name={active ? 'speakerOn' : 'speaker'} size={size} />
    </button>
  );
}
