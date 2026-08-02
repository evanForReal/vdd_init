import type { LanguageCode } from "./types";

const BCP47: Record<LanguageCode, string> = { es: "es-ES", zh: "zh-CN", ar: "ar-SA" };

export function bcp47(language: LanguageCode): string {
  return BCP47[language];
}

export function speak(text: string, language: LanguageCode): void {
  if (!("speechSynthesis" in window)) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = BCP47[language];
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | undefined {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function speechRecognitionSupported(): boolean {
  return !!getRecognitionCtor();
}

// Returns a stop function. onResult/onError/onEnd fire at most once each per call.
export function recognizeSpeech(
  language: LanguageCode,
  onResult: (transcript: string) => void,
  onError: () => void,
  onEnd?: () => void
): () => void {
  const Ctor = getRecognitionCtor();
  if (!Ctor) {
    onError();
    return () => {};
  }
  const recognition = new Ctor();
  recognition.lang = BCP47[language];
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript ?? "";
    onResult(transcript);
  };
  recognition.onerror = () => onError();
  recognition.onend = () => onEnd?.();
  try {
    recognition.start();
  } catch {
    // Some browsers throw synchronously (e.g. permission already denied)
    // instead of firing onerror — treat that the same way so the caller
    // never gets stuck waiting on a recognizer that never started.
    onError();
    return () => {};
  }
  return () => {
    try {
      recognition.stop();
    } catch {
      // already stopped/never started — nothing to do
    }
  };
}

// Latin combining accents (U+0300-U+036F) + Arabic tashkeel diacritics
// (U+0610-U+061A, U+064B-U+065F, U+0670, U+06D6-U+06ED), stripped so
// typed/spoken answers that omit them still compare as a match.
const DIACRITIC_PATTERN =
  /[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g;

export function normalizeForCompare(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITIC_PATTERN, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function fuzzyMatch(a: string, b: string): boolean {
  return normalizeForCompare(a) === normalizeForCompare(b);
}
