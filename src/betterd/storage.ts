import type { BetterDState, LanguageCode, LanguageProgress } from "./types";

const STORAGE_KEY = "lift-log-betterd-v1";

const LANGUAGES: LanguageCode[] = ["es", "zh", "ar"];

function emptyProgress(language: LanguageCode): LanguageProgress {
  return { language, completions: [] };
}

const DEFAULT_STATE: BetterDState = {
  progress: {
    es: emptyProgress("es"),
    zh: emptyProgress("zh"),
    ar: emptyProgress("ar"),
  },
  notes: [],
  streak: { current: 0, longest: 0, lastPracticeDate: "" },
  showTransliteration: true,
};

export function loadBetterDState(): BetterDState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<BetterDState>;
    const progress = {} as Record<LanguageCode, LanguageProgress>;
    for (const lang of LANGUAGES) {
      const p = parsed.progress?.[lang];
      progress[lang] = {
        language: lang,
        completions: Array.isArray(p?.completions) ? p!.completions : [],
      };
    }
    return {
      progress,
      notes: parsed.notes ?? [],
      streak: {
        current: parsed.streak?.current ?? 0,
        longest: parsed.streak?.longest ?? 0,
        lastPracticeDate: parsed.streak?.lastPracticeDate ?? "",
      },
      showTransliteration: parsed.showTransliteration ?? true,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveBetterDState(state: BetterDState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
