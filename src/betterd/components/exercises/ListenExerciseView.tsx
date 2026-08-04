import { useState } from "react";
import type { LanguageCode, ListenExercise } from "../../types";
import { speak } from "../../speech";
import { SpeakerIcon } from "../../../nutrition/components/Icons";
import { CheckFooter } from "./CheckFooter";

export function ListenExerciseView({
  exercise,
  language,
  onAnswered,
}: {
  exercise: ListenExercise;
  language: LanguageCode;
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [vetoed, setVetoed] = useState(false);
  const correct = vetoed || selected === exercise.correctIndex;

  return (
    <div className="exercise">
      <p className="exercise-prompt">{exercise.prompt}</p>
      <button
        className="icon-btn tts-btn tts-btn-large"
        onClick={() => speak(exercise.audioText, language)}
        aria-label="play audio"
      >
        <SpeakerIcon /> play audio
      </button>
      <p className="exercise-question">{exercise.question}</p>
      <div className="option-list">
        {exercise.options.map((opt, i) => (
          <button
            key={i}
            className={`option-chip ${selected === i ? "selected" : ""} ${
              checked && i === exercise.correctIndex ? "correct" : ""
            } ${checked && selected === i && !correct ? "incorrect" : ""}`}
            onClick={() => !checked && setSelected(i)}
            disabled={checked}
          >
            {opt}
          </button>
        ))}
      </div>
      <CheckFooter
        checked={checked}
        correct={correct}
        correctAnswerLabel={exercise.options[exercise.correctIndex]}
        canCheck={selected !== null}
        onCheck={() => setChecked(true)}
        onContinue={() => onAnswered(correct)}
        onVeto={() => setVetoed(true)}
      />
      {!checked && (
        <button className="text-btn skip-btn" onClick={() => onAnswered(false)}>
          skip this one
        </button>
      )}
    </div>
  );
}
