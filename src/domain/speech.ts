// Japanese text-to-speech via the Web Speech API (replaces SpeechController in SpeakButton.swift).

let speakingText: string | null = null;
const listeners = new Set<() => void>();
let japaneseVoice: SpeechSynthesisVoice | null = null;
let voicesRequested = false;

function setSpeaking(text: string | null): void {
  speakingText = text;
  listeners.forEach((listener) => listener());
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function pickVoice(): void {
  const voices = window.speechSynthesis.getVoices();
  japaneseVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith('ja')) ?? null;
}

function ensureVoices(): void {
  if (voicesRequested) return;
  voicesRequested = true;
  pickVoice();
  // Voices may load asynchronously.
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice, { once: true });
}

export function speak(text: string, lang = 'ja-JP'): void {
  if (!isSpeechSupported()) return;
  const synth = window.speechSynthesis;
  ensureVoices();
  if (synth.speaking || speakingText !== null) {
    const wasSame = speakingText === text;
    synth.cancel();
    setSpeaking(null);
    if (wasSame) return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.8;
  if (japaneseVoice) utterance.voice = japaneseVoice;
  const done = () => {
    if (speakingText === text) setSpeaking(null);
  };
  utterance.onend = done;
  utterance.onerror = done;
  setSpeaking(text);
  synth.speak(utterance);
}

export function getSpeakingText(): string | null {
  return speakingText;
}

export function subscribeSpeaking(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
