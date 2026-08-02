import type { LanguageCode, Module } from "../types";

// Shared across all three languages so the tree structure stays parallel —
// only module 1 is authored for the pilot; 2-6 are placeholders (order !== 1)
// until content is written for them in a later pass.
const TOPICS: Array<{ title: string; description: string }> = [
  {
    title: "foundations: everyday life",
    description:
      "greetings, self-introductions, family, daily routines, food, and the basics that carry every conversation after this one.",
  },
  {
    title: "hobbies & self-expression",
    description:
      "vocabulary and conversation for hobbies, interests, and talking about what lights you up.",
  },
  {
    title: "traveling & getting around",
    description:
      "getting around a new city or country — directions, transport, lodging, and everyday logistics.",
  },
  {
    title: "relationships & social dynamics",
    description: "the language of relationships — family, friendship, conflict, and connection.",
  },
  {
    title: "science, nature & ideas",
    description: "structured thinking — the scientific method, nature, and the vocabulary of ideas.",
  },
  {
    title: "business & professional fluency",
    description:
      "the vocabulary and register of business and professional life — meetings, negotiation, and formal correspondence.",
  },
];

export function buildModules(language: LanguageCode, module1LessonIds: string[]): Module[] {
  return TOPICS.map((topic, i) => {
    const order = i + 1;
    return {
      id: `${language}-m${order}`,
      language,
      order,
      title: topic.title,
      description: topic.description,
      estimate: "~1 month of daily practice",
      placeholder: order !== 1,
      lessonIds: order === 1 ? module1LessonIds : [],
    };
  });
}
