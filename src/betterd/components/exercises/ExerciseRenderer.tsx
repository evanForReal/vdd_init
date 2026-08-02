import type { Exercise, LanguageCode } from "../../types";
import { TranslateExerciseView } from "./TranslateExerciseView";
import { SpeakExerciseView } from "./SpeakExerciseView";
import { MatchExerciseView } from "./MatchExerciseView";
import { ExplainExerciseView } from "./ExplainExerciseView";
import { ListenExerciseView } from "./ListenExerciseView";
import { ClozeExerciseView } from "./ClozeExerciseView";
import { ReorderExerciseView } from "./ReorderExerciseView";
import { DictationExerciseView } from "./DictationExerciseView";

export function ExerciseRenderer({
  exercise,
  language,
  showTransliteration,
  onAnswered,
}: {
  exercise: Exercise;
  language: LanguageCode;
  showTransliteration: boolean;
  onAnswered: (correct: boolean) => void;
}) {
  switch (exercise.type) {
    case "translate":
      return (
        <TranslateExerciseView
          exercise={exercise}
          language={language}
          showTransliteration={showTransliteration}
          onAnswered={onAnswered}
        />
      );
    case "speak":
      return (
        <SpeakExerciseView
          exercise={exercise}
          language={language}
          showTransliteration={showTransliteration}
          onAnswered={onAnswered}
        />
      );
    case "match":
      return (
        <MatchExerciseView
          exercise={exercise}
          language={language}
          showTransliteration={showTransliteration}
          onAnswered={onAnswered}
        />
      );
    case "explain":
      return <ExplainExerciseView exercise={exercise} language={language} onAnswered={onAnswered} />;
    case "listen":
      return <ListenExerciseView exercise={exercise} language={language} onAnswered={onAnswered} />;
    case "cloze":
      return (
        <ClozeExerciseView
          exercise={exercise}
          language={language}
          showTransliteration={showTransliteration}
          onAnswered={onAnswered}
        />
      );
    case "reorder":
      return <ReorderExerciseView exercise={exercise} language={language} onAnswered={onAnswered} />;
    case "dictation":
      return <DictationExerciseView exercise={exercise} language={language} onAnswered={onAnswered} />;
    default:
      return null;
  }
}
