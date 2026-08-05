import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  BetterDNote,
  BetterDState,
  LanguageCode,
  Lesson,
  Module,
} from "../types";
import { loadBetterDState, saveBetterDState } from "../storage";
import { MODULES, LESSONS, QUOTES } from "../content";
import {
  effectiveStreak,
  generateFinalTest,
  generateLanguagePlacementTest,
  generateModulePlacementTest,
  generateReviewLesson,
  pickQuote,
} from "../utils";
import { addDays, todayISO } from "../../utils/date";

export type ModuleStatus = "placeholder" | "locked" | "available" | "in-progress" | "completed";
export type LessonStatus = "locked" | "available" | "completed";
export interface LessonNode {
  lesson: Lesson;
  status: LessonStatus;
}

function findModuleById(moduleId: string): Module | undefined {
  const lang = moduleId.split("-")[0] as LanguageCode;
  return MODULES[lang]?.find((m) => m.id === moduleId);
}

function coreLessonsOf(module: Module): Lesson[] {
  return module.lessonIds.map((id) => LESSONS[id]).filter((l): l is Lesson => !!l);
}

function activeCoreLessonsForLanguage(language: LanguageCode): Lesson[] {
  return MODULES[language].filter((m) => !m.placeholder).flatMap((m) => coreLessonsOf(m));
}

function resolveLesson(lessonId: string): Lesson | undefined {
  if (LESSONS[lessonId]) return LESSONS[lessonId];
  const langPlacementMatch = lessonId.match(/^([a-z]{2})-placement-all$/);
  if (langPlacementMatch) {
    const language = langPlacementMatch[1] as LanguageCode;
    return generateLanguagePlacementTest(language, activeCoreLessonsForLanguage(language));
  }
  const finalMatch = lessonId.match(/^(.+)-final$/);
  if (finalMatch) {
    const module = findModuleById(finalMatch[1]);
    if (!module) return undefined;
    return generateFinalTest(module, coreLessonsOf(module));
  }
  const reviewMatch = lessonId.match(/^(.+)-review-([12])$/);
  if (reviewMatch) {
    const module = findModuleById(reviewMatch[1]);
    if (!module) return undefined;
    return generateReviewLesson(module, coreLessonsOf(module), Number(reviewMatch[2]) as 1 | 2);
  }
  const placementMatch = lessonId.match(/^(.+)-placement$/);
  if (placementMatch) {
    const module = findModuleById(placementMatch[1]);
    if (!module) return undefined;
    return generateModulePlacementTest(module, coreLessonsOf(module));
  }
  return undefined;
}

function lessonSequenceIds(module: Module): string[] {
  return [...module.lessonIds, `${module.id}-review-1`, `${module.id}-review-2`, `${module.id}-final`];
}

interface BetterDContextValue {
  moduleStatus: (module: Module) => ModuleStatus;
  lessonsForModule: (module: Module) => LessonNode[];
  getLesson: (lessonId: string) => Lesson | undefined;
  completeLesson: (
    language: LanguageCode,
    lessonId: string,
    correctCount: number,
    totalCount: number
  ) => void;
  completePlacementTest: (
    targetModuleIds: string[],
    language: LanguageCode,
    correctCount: number,
    totalCount: number
  ) => boolean;
  isLessonCompleted: (language: LanguageCode, lessonId: string) => boolean;
  addNote: (moduleId: string, lessonId: string, language: LanguageCode, text: string) => void;
  notesForModule: (moduleId: string) => BetterDNote[];
  quoteForLesson: (lessonId: string, language: LanguageCode) => ReturnType<typeof pickQuote> | undefined;
  streak: BetterDState["streak"];
  showTransliteration: boolean;
  toggleTransliteration: () => void;
}

const BetterDContext = createContext<BetterDContextValue | null>(null);

export function BetterDProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BetterDState>(() => loadBetterDState());

  useEffect(() => {
    saveBetterDState(state);
  }, [state]);

  function isLessonCompleted(language: LanguageCode, lessonId: string): boolean {
    return state.progress[language].completions.some((c) => c.lessonId === lessonId);
  }

  function moduleStatus(module: Module): ModuleStatus {
    if (module.placeholder) return "placeholder";
    const modules = MODULES[module.language];
    const prev = modules.find((m) => m.order === module.order - 1);
    if (prev && !prev.placeholder) {
      const prevComplete = lessonSequenceIds(prev).every((id) =>
        isLessonCompleted(module.language, id)
      );
      if (!prevComplete) return "locked";
    } else if (prev && prev.placeholder) {
      return "locked";
    }
    const ids = lessonSequenceIds(module);
    const doneCount = ids.filter((id) => isLessonCompleted(module.language, id)).length;
    if (doneCount === 0) return "available";
    if (doneCount === ids.length) return "completed";
    return "in-progress";
  }

  function lessonsForModule(module: Module): LessonNode[] {
    const ids = lessonSequenceIds(module);
    const nodes: LessonNode[] = [];
    let prevCompleted = true;
    for (const id of ids) {
      const lesson = resolveLesson(id);
      if (!lesson) continue;
      const completed = isLessonCompleted(module.language, id);
      const status: LessonStatus = completed ? "completed" : prevCompleted ? "available" : "locked";
      nodes.push({ lesson, status });
      prevCompleted = completed;
    }
    return nodes;
  }

  function completeLesson(
    language: LanguageCode,
    lessonId: string,
    correctCount: number,
    totalCount: number
  ) {
    setState((s) => {
      const already = s.progress[language].completions.some((c) => c.lessonId === lessonId);
      const completions = already
        ? s.progress[language].completions.map((c) =>
            c.lessonId === lessonId
              ? { ...c, correctCount, totalCount, completedAt: Date.now() }
              : c
          )
        : [
            ...s.progress[language].completions,
            { lessonId, completedAt: Date.now(), correctCount, totalCount },
          ];

      let streak = s.streak;
      if (!already) {
        const today = todayISO();
        if (s.streak.lastPracticeDate !== today) {
          const isConsecutive = s.streak.lastPracticeDate === addDays(today, -1);
          const current = isConsecutive ? s.streak.current + 1 : 1;
          streak = { current, longest: Math.max(s.streak.longest, current), lastPracticeDate: today };
        }
      }

      return {
        ...s,
        progress: { ...s.progress, [language]: { language, completions } },
        streak,
      };
    });
  }

  function completePlacementTest(
    targetModuleIds: string[],
    language: LanguageCode,
    correctCount: number,
    totalCount: number
  ): boolean {
    const passed = totalCount > 0 && correctCount / totalCount >= 0.8;
    setState((s) => {
      let completions = s.progress[language].completions;
      if (passed) {
        const now = Date.now();
        const idsToMark = targetModuleIds.flatMap((moduleId) => {
          const module = findModuleById(moduleId);
          return module ? lessonSequenceIds(module) : [];
        });
        for (const id of idsToMark) {
          if (!completions.some((c) => c.lessonId === id)) {
            completions = [...completions, { lessonId: id, completedAt: now, correctCount: 1, totalCount: 1 }];
          }
        }
      }

      let streak = s.streak;
      const today = todayISO();
      if (s.streak.lastPracticeDate !== today) {
        const isConsecutive = s.streak.lastPracticeDate === addDays(today, -1);
        const current = isConsecutive ? s.streak.current + 1 : 1;
        streak = { current, longest: Math.max(s.streak.longest, current), lastPracticeDate: today };
      }

      return {
        ...s,
        progress: { ...s.progress, [language]: { language, completions } },
        streak,
      };
    });
    return passed;
  }

  function toggleTransliteration() {
    setState((s) => ({ ...s, showTransliteration: !s.showTransliteration }));
  }

  function addNote(moduleId: string, lessonId: string, language: LanguageCode, text: string) {
    if (!text.trim()) return;
    setState((s) => ({
      ...s,
      notes: [
        ...s.notes,
        {
          id: `${lessonId}-${Date.now()}`,
          moduleId,
          lessonId,
          language,
          text: text.trim(),
          createdAt: Date.now(),
        },
      ],
    }));
  }

  function notesForModule(moduleId: string): BetterDNote[] {
    return state.notes
      .filter((n) => n.moduleId === moduleId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  function quoteForLesson(lessonId: string, language: LanguageCode) {
    const quotes = QUOTES[language];
    if (!quotes.length) return undefined;
    return pickQuote(quotes, lessonId);
  }

  return (
    <BetterDContext.Provider
      value={{
        moduleStatus,
        lessonsForModule,
        getLesson: resolveLesson,
        completeLesson,
        completePlacementTest,
        isLessonCompleted,
        addNote,
        notesForModule,
        quoteForLesson,
        streak: effectiveStreak(state.streak),
        showTransliteration: state.showTransliteration,
        toggleTransliteration,
      }}
    >
      {children}
    </BetterDContext.Provider>
  );
}

export function useBetterD(): BetterDContextValue {
  const ctx = useContext(BetterDContext);
  if (!ctx) throw new Error("useBetterD must be used within BetterDProvider");
  return ctx;
}
