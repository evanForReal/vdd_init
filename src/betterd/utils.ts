import type { Exercise, Lesson, Module, Quote, VocabTerm } from "./types";

export function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Deterministic seeded shuffle so a given seed always reorders the same way
// within a run, but different seeds (different modules, review vs. final)
// land on different orders.
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickQuote(quotes: Quote[], seed: string): Quote {
  return quotes[hashString(seed) % quotes.length];
}

function termOf(ex: Exercise): VocabTerm | undefined {
  switch (ex.type) {
    case "translate":
    case "speak":
    case "cloze":
      return ex.term;
    default:
      return undefined;
  }
}

// Every vocab/grammar point tagged across a set of authored lessons, in
// first-seen order and de-duplicated by target-language form. This is the
// "mechanical compilation" input for review lessons and the final test —
// no prose summarization, just what was actually tagged as taught.
export function collectTerms(lessons: Lesson[]): VocabTerm[] {
  const seen = new Set<string>();
  const terms: VocabTerm[] = [];
  for (const lesson of lessons) {
    for (const ex of lesson.exercises) {
      const term = termOf(ex);
      if (term && !seen.has(term.target)) {
        seen.add(term.target);
        terms.push(term);
      }
    }
  }
  return terms;
}

function buildDrillExercises(terms: VocabTerm[], count: number, seed: string): Exercise[] {
  const shuffled = seededShuffle(terms, hashString(seed));
  const picked = shuffled.slice(0, Math.min(count, shuffled.length));
  const exercises: Exercise[] = [];
  picked.forEach((term, i) => {
    const kind = i % 3;
    if (kind === 0) {
      exercises.push({
        id: `${seed}-t${i}`,
        type: "translate",
        prompt: "translate to english",
        direction: "to-english",
        source: term.target,
        answer: term.english,
        transliteration: term.transliteration,
        term,
      });
    } else if (kind === 1) {
      const distractors = seededShuffle(
        terms.filter((t) => t.target !== term.target),
        hashString(seed + term.target)
      )
        .slice(0, 3)
        .map((t) => t.english);
      const options = seededShuffle(
        [term.english, ...distractors],
        hashString(seed + "opts" + term.target)
      );
      exercises.push({
        id: `${seed}-c${i}`,
        type: "cloze",
        prompt: "what does this mean?",
        sentence: term.target,
        transliteration: term.transliteration,
        english: "___",
        answer: term.english,
        options,
        term,
      });
    } else {
      exercises.push({
        id: `${seed}-s${i}`,
        type: "speak",
        prompt: "say this aloud",
        target: term.target,
        transliteration: term.transliteration,
        english: term.english,
        term,
      });
    }
  });
  return exercises;
}

// Two review lessons split the module's term bank roughly in half so each
// stays a reasonable "medium" length, unlocked once every core lesson in
// the module is complete.
export function generateReviewLesson(module: Module, coreLessons: Lesson[], index: 1 | 2): Lesson {
  const terms = collectTerms(coreLessons);
  const half = Math.ceil(terms.length / 2);
  const slice = index === 1 ? terms.slice(0, half) : terms.slice(half);
  const seed = `${module.id}-review-${index}`;
  return {
    id: `${module.id}-review-${index}`,
    moduleId: module.id,
    language: module.language,
    title: `review ${index}`,
    size: "medium",
    kind: "review",
    exercises: buildDrillExercises(slice.length ? slice : terms, 12, seed),
  };
}

export function generateFinalTest(module: Module, coreLessons: Lesson[]): Lesson {
  const terms = collectTerms(coreLessons);
  const seed = `${module.id}-final`;
  return {
    id: `${module.id}-final`,
    moduleId: module.id,
    language: module.language,
    title: "final test",
    size: "large",
    kind: "final",
    exercises: buildDrillExercises(terms, Math.min(20, Math.max(10, terms.length)), seed),
  };
}
