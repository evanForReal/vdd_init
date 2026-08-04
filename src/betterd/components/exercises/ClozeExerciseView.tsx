import { useState } from "react";
import type { ClozeExercise, LanguageCode } from "../../types";
import { TargetText } from "../TargetText";
import { CheckFooter } from "./CheckFooter";

export function ClozeExerciseView({
  exercise,
  language,
  showTransliteration,
  onAnswered,
}: {
  exercise: ClozeExercise;
  language: LanguageCode;
  showTransliteration: boolean;
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [vetoed, setVetoed] = useState(false);
  const correct = vetoed || selected === exercise.answer;
  const hasBlank = exercise.sentence.includes("___");
  const [before, after] = exercise.sentence.split("___");

  return (
    <div className="exercise">
      <p className="exercise-prompt">{exercise.prompt}</p>
      <div className="cloze-sentence">
        {hasBlank ? (
          <TargetText
            language={language}
            text={`${before}${selected ?? "___"}${after ?? ""}`}
            className="cloze-sentence-text"
          />
        ) : (
          <div className="cloze-recall-row">
            <TargetText language={language} text={before} className="cloze-sentence-text" />
            <span className="cloze-arrow">→</span>
            <span className={`cloze-blank ${selected ? "filled" : ""}`}>{selected ?? "_____"}</span>
          </div>
        )}
        {showTransliteration && exercise.transliteration && (
          <div className="exercise-translit">
            {exercise.transliteration}
            {exercise.simplified && ` (简: ${exercise.simplified})`}
          </div>
        )}
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
        onVeto={() => setVetoed(true)}
      />
    </div>
  );
}
