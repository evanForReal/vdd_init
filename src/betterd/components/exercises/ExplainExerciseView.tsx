import { useState } from "react";
import type { ExplainExercise, LanguageCode } from "../../types";
import { TargetText } from "../TargetText";

export function ExplainExerciseView({
  exercise,
  language,
  onAnswered,
}: {
  exercise: ExplainExercise;
  language: LanguageCode;
  onAnswered: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [rated, setRated] = useState(false);

  return (
    <div className="exercise">
      <p className="exercise-prompt">{exercise.prompt}</p>
      <p className="exercise-topic">{exercise.topic}</p>
      {exercise.targetLanguageHint && (
        <div className="exercise-hint">
          <TargetText language={language} text={exercise.targetLanguageHint} />
        </div>
      )}
      <textarea
        className="text-field textarea-field exercise-input"
        dir={language === "ar" ? "rtl" : undefined}
        placeholder="write your answer here, in the target language"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={revealed}
        rows={4}
      />
      {!revealed && (
        <button
          className="primary-btn ex-check-btn"
          disabled={value.trim().length === 0}
          onClick={() => setRevealed(true)}
        >
          compare to a model answer
        </button>
      )}
      {revealed && !rated && (
        <div className="ex-model-answer">
          <div className="field-label">a model answer</div>
          <TargetText language={language} text={exercise.modelAnswer} className="model-answer-text" />
          {exercise.modelAnswerEnglish && (
            <div className="exercise-english-hint">{exercise.modelAnswerEnglish}</div>
          )}
          <div className="ex-selfrate-row">
            <button
              className="secondary-btn"
              onClick={() => {
                setRated(true);
                onAnswered(false);
              }}
            >
              needs work
            </button>
            <button
              className="primary-btn"
              onClick={() => {
                setRated(true);
                onAnswered(true);
              }}
            >
              got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
