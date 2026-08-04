import { useState } from "react";
import type { DictationExercise, LanguageCode } from "../../types";
import { fuzzyMatch, speak } from "../../speech";
import { SpeakerIcon } from "../../../nutrition/components/Icons";
import { CheckFooter } from "./CheckFooter";

export function DictationExerciseView({
  exercise,
  language,
  onAnswered,
}: {
  exercise: DictationExercise;
  language: LanguageCode;
  onAnswered: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  function check() {
    setCorrect(fuzzyMatch(value, exercise.target));
    setChecked(true);
  }

  return (
    <div className="exercise">
      <p className="exercise-prompt">{exercise.prompt}</p>
      <button
        className="icon-btn tts-btn tts-btn-large"
        onClick={() => speak(exercise.target, language)}
        aria-label="play audio"
      >
        <SpeakerIcon /> play audio
      </button>
      <input
        className="text-field exercise-input"
        dir={language === "ar" ? "rtl" : undefined}
        placeholder="type what you hear"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={checked}
      />
      <CheckFooter
        checked={checked}
        correct={correct}
        correctAnswerLabel={exercise.target}
        canCheck={value.trim().length > 0}
        onCheck={check}
        onContinue={() => onAnswered(correct)}
        onVeto={() => setCorrect(true)}
      />
    </div>
  );
}
