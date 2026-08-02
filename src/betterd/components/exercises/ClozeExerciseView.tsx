import { useState } from "react";
import type { ClozeExercise, LanguageCode } from "../../types";
import { TargetText } from "../TargetText";
import { CheckFooter } from "./CheckFooter";

export function ClozeExerciseView({
  exercise,
  language,
  onAnswered,
}: {
  exercise: ClozeExercise;
  language: LanguageCode;
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = selected === exercise.answer;
  const [before, after] = exercise.sentence.split("___");

  return (
    <div className="exercise">
      <p className="exercise-prompt">{exercise.prompt}</p>
      <div className="cloze-sentence">
        <TargetText
          language={language}
          text={`${before}${selected ?? "___"}${after ?? ""}`}
          className="cloze-sentence-text"
        />
        {exercise.transliteration && <div className="exercise-translit">{exercise.transliteration}</div>}
        {exercise.english !== "___" && <div className="exercise-english-hint">{exercise.english}</div>}
      </div>
      <div className="option-list">
        {exercise.options.map((opt) => (
          <button
            key={opt}
            className={`option-chip ${selected === opt ? "selected" : ""} ${
              checked && opt === exercise.answer ? "correct" : ""
            } ${checked && selected === opt && !correct ? "incorrect" : ""}`}
            onClick={() => !checked && setSelected(opt)}
            disabled={checked}
          >
            <TargetText language={language} text={opt} />
          </button>
        ))}
      </div>
      <CheckFooter
        checked={checked}
        correct={correct}
        correctAnswerLabel={exercise.answer}
        canCheck={selected !== null}
        onCheck={() => setChecked(true)}
        onContinue={() => onAnswered(correct)}
      />
    </div>
  );
}
