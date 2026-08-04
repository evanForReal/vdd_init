export type LanguageCode = "es" | "zh" | "ar";

export interface LanguageMeta {
  code: LanguageCode;
  name: string;
  nativeName: string;
  accent: string; // CSS color for this language's orb/badges
}

export type LessonSize = "small" | "medium" | "large"; // ~10 / 20 / 30 min
export type LessonKind = "core" | "review" | "final" | "placement";

// A vocab/grammar point an exercise drills. Tagged so review lessons and
// the final test can be assembled mechanically from what was actually
// taught, without any prose summarization.
export interface VocabTerm {
  target: string;
  transliteration?: string; // pinyin / romanization — used for zh, ar
  english: string;
  simplified?: string; // simplified-Chinese form of `target`, when `target` is traditional
}

interface ExerciseBase {
  id: string;
  prompt: string;
}

export interface TranslateExercise extends ExerciseBase {
  type: "translate";
  direction: "to-target" | "to-english";
  source: string;
  answer: string;
  altAnswers?: string[];
  transliteration?: string;
  simplified?: string; // simplified-Chinese form of `source` when it holds target-language text
  term?: VocabTerm;
}

export interface SpeakExercise extends ExerciseBase {
  type: "speak";
  target: string;
  transliteration?: string;
  simplified?: string;
  english: string;
  term?: VocabTerm;
}

export interface MatchExercise extends ExerciseBase {
  type: "match";
  pairs: { target: string; transliteration?: string; simplified?: string; english: string }[];
}

export interface ExplainExercise extends ExerciseBase {
  type: "explain";
  topic: string;
  targetLanguageHint?: string;
  modelAnswer: string;
  modelAnswerEnglish?: string;
}

export interface ListenExercise extends ExerciseBase {
  type: "listen";
  audioText: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ClozeExercise extends ExerciseBase {
  type: "cloze";
  sentence: string; // contains a single "___"
  transliteration?: string;
  simplified?: string; // simplified-Chinese form of `sentence`
  english: string;
  answer: string;
  options: string[];
  term?: VocabTerm;
}

export interface ReorderExercise extends ExerciseBase {
  type: "reorder";
  english: string;
  words: string[]; // correct order, target-language tokens
}

export interface DictationExercise extends ExerciseBase {
  type: "dictation";
  target: string;
  english: string;
}

export type Exercise =
  | TranslateExercise
  | SpeakExercise
  | MatchExercise
  | ExplainExercise
  | ListenExercise
  | ClozeExercise
  | ReorderExercise
  | DictationExercise;

export interface Lesson {
  id: string;
  moduleId: string;
  language: LanguageCode;
  title: string;
  size: LessonSize;
  kind: LessonKind;
  exercises: Exercise[];
}

export interface Quote {
  id: string;
  language: LanguageCode;
  native: string;
  transliteration?: string;
  simplified?: string; // simplified-Chinese form of `native`
  english: string;
  source: string;
  author?: string;
}

export interface Module {
  id: string;
  language: LanguageCode;
  order: number;
  title: string;
  description: string;
  estimate: string;
  placeholder: boolean;
  lessonIds: string[]; // authored core lessons, in order
}

export interface BetterDNote {
  id: string;
  moduleId: string;
  lessonId: string;
  language: LanguageCode;
  text: string;
  createdAt: number;
}

export interface LessonCompletion {
  lessonId: string;
  completedAt: number;
  correctCount: number;
  totalCount: number;
}

export interface LanguageProgress {
  language: LanguageCode;
  completions: LessonCompletion[];
}

export interface StreakState {
  current: number;
  longest: number;
  lastPracticeDate: string; // ISO date, "" if never practiced
}

export interface BetterDState {
  progress: Record<LanguageCode, LanguageProgress>;
  notes: BetterDNote[];
  streak: StreakState;
  showTransliteration: boolean;
}
