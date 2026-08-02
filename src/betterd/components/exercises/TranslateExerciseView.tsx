import { useState } from "react";
import type { LanguageCode, TranslateExercise } from "../../types";
import { fuzzyMatch } from "../../speech";
import { TargetText } from "../TargetText";
import { CheckFooter } from "./CheckFooter";

export function TranslateExerciseView({
  exercise,
  language,
  showTransliteration,
  onAnswered,
}: {
  exercise: TranslateExercise;
  language: LanguageCode;
  showTransliteration: boolean;
  onAnswered: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const toTarget = exercise.direction === "to-target";

  function check() {
    const answers = [exercise.answer, ...(exercise.altAnswers ?? [])];
    setCorrect(answers.some((a) => fuzzyMatch(a, value)));
    setChecked(true);
  }

  return (
    <div className="exercise">
      <p className="exercise-prompt">{exercise.prompt}</p>
      <div className="exercise-source">
        {toTarget ? (
          exercise.source
        ) : (
          <TargetText language={language} text={exercise.source} />
        )}
        {!toTarget && showTransliteration && exercise.transliteration && (
          <div className="exercise-translit">{exercise.transliteration}</div>
        )}
      </div>
      <input
        className="text-field exercise-input"
        dir={toTarget && language === "ar" ? "rtl" : undefined}
        placeholder={toTarget ? "type your answer" : "type in english"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={checked}
      />
      <CheckFooter
        checked={checked}
        correct={correct}
        correctAnswerLabel={exercise.answer}
        canCheck={value.trim().length > 0}
        onCheck={check}
        onContinue={() => onAnswered(correct)}
      />
    </div>
  );
}
