import { useMemo, useState } from "react";
import type { LanguageCode, ReorderExercise } from "../../types";
import { CheckFooter } from "./CheckFooter";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function ReorderExerciseView({
  exercise,
  language,
  onAnswered,
}: {
  exercise: ReorderExercise;
  language: LanguageCode;
  onAnswered: (correct: boolean) => void;
}) {
  const bank = useMemo(
    () => shuffle(exercise.words.map((w, i) => ({ word: w, key: `${w}-${i}` }))),
    [exercise]
  );
  const [placed, setPlaced] = useState<typeof bank>([]);
  const [checked, setChecked] = useState(false);
  const remaining = bank.filter((b) => !placed.some((p) => p.key === b.key));
  const correct = placed.map((p) => p.word).join(" ") === exercise.words.join(" ");

  return (
    <div className="exercise">
      <p className="exercise-prompt">{exercise.prompt}</p>
      <p className="exercise-english-hint">{exercise.english}</p>
      <div className={`reorder-built ${language === "ar" ? "rtl" : ""}`} dir={language === "ar" ? "rtl" : undefined}>
        {placed.length === 0 && <span className="reorder-placeholder">tap words below</span>}
        {placed.map((p) => (
          <button
            key={p.key}
            className="reorder-chip placed"
            onClick={() => !checked && setPlaced((cur) => cur.filter((c) => c.key !== p.key))}
            disabled={checked}
          >
            {p.word}
          </button>
        ))}
      </div>
      <div className={`reorder-bank ${language === "ar" ? "rtl" : ""}`} dir={language === "ar" ? "rtl" : undefined}>
        {remaining.map((r) => (
          <button
            key={r.key}
            className="reorder-chip"
            onClick={() => !checked && setPlaced((cur) => [...cur, r])}
            disabled={checked}
          >
            {r.word}
          </button>
        ))}
      </div>
      <CheckFooter
        checked={checked}
        correct={correct}
        correctAnswerLabel={exercise.words.join(" ")}
        canCheck={placed.length === bank.length}
        onCheck={() => setChecked(true)}
        onContinue={() => onAnswered(correct)}
      />
    </div>
  );
}
