import type { LanguageCode, LanguageMeta, Lesson, Module, Quote } from "../types";
import { esLessons, esModules, esQuotes } from "./es";
import { zhLessons, zhModules, zhQuotes } from "./zh";
import { arLessons, arModules, arQuotes } from "./ar";

export const LANGUAGES: LanguageMeta[] = [
  { code: "es", name: "Spanish", nativeName: "Español", accent: "rgba(206, 140, 90, 1)" },
  { code: "zh", name: "Chinese", nativeName: "中文", accent: "rgba(196, 90, 82, 1)" },
  { code: "ar", name: "Arabic", nativeName: "العربية", accent: "rgba(84, 150, 140, 1)" },
];

export const MODULES: Record<LanguageCode, Module[]> = {
  es: esModules,
  zh: zhModules,
  ar: arModules,
};

const ALL_LESSONS: Lesson[] = [...esLessons, ...zhLessons, ...arLessons];

export const LESSONS: Record<string, Lesson> = Object.fromEntries(
  ALL_LESSONS.map((l) => [l.id, l])
);

export const QUOTES: Record<LanguageCode, Quote[]> = {
  es: esQuotes,
  zh: zhQuotes,
  ar: arQuotes,
};

export function languageMeta(code: LanguageCode): LanguageMeta {
  return LANGUAGES.find((l) => l.code === code)!;
}

export function modulesForLanguage(code: LanguageCode): Module[] {
  return MODULES[code];
}

export function coreLessonsForModule(module: Module): Lesson[] {
  return module.lessonIds.map((id) => LESSONS[id]).filter((l): l is Lesson => !!l);
}
