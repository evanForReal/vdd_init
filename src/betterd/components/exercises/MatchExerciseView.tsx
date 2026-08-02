import { useMemo, useState } from "react";
import type { LanguageCode, MatchExercise } from "../../types";
import { TargetText } from "../TargetText";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function MatchExerciseView({
  exercise,
  language,
  onAnswered,
}: {
  exercise: MatchExercise;
  language: LanguageCode;
  onAnswered: (correct: boolean) => void;
}) {
  const leftItems = useMemo(
    () =>
      shuffle(
        exercise.pairs.map((p, i) => ({
          key: `t${i}`,
          text: p.target,
          transliteration: p.transliteration,
          pairIndex: i,
        }))
      ),
    [exercise]
  );
  const rightItems = useMemo(
    () => shuffle(exercise.pairs.map((p, i) => ({ key: `e${i}`, text: p.english, pairIndex: i }))),
    [exercise]
  );
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [selectedLeftKey, setSelectedLeftKey] = useState<string | null>(null);
  const [flashWrong, setFlashWrong] = useState<{ leftKey: string; rightKey: string } | null>(null);

  function pickLeft(key: string, pairIndex: number) {
    if (matched.has(pairIndex) || flashWrong) return;
    setSelectedLeftKey(key);
  }

  function pickRight(key: string, pairIndex: number) {
    if (matched.has(pairIndex) || selectedLeftKey === null || flashWrong) return;
    const leftItem = leftItems.find((l) => l.key === selectedLeftKey)!;
    if (leftItem.pairIndex === pairIndex) {
      const next = new Set(matched);
      next.add(pairIndex);
      setMatched(next);
      setSelectedLeftKey(null);
    } else {
      setFlashWrong({ leftKey: selectedLeftKey, rightKey: key });
      setTimeout(() => {
        setFlashWrong(null);
        setSelectedLeftKey(null);
      }, 500);
    }
  }

  const done = matched.size === exercise.pairs.length;

  return (
    <div className="exercise">
      <p className="exercise-prompt">{exercise.prompt}</p>
      <div className="match-grid">
        <div className="match-col">
          {leftItems.map((item) => (
            <button
              key={item.key}
              className={`match-chip ${matched.has(item.pairIndex) ? "matched" : ""} ${
                selectedLeftKey === item.key ? "selected" : ""
              } ${flashWrong?.leftKey === item.key ? "wrong" : ""}`}
              onClick={() => pickLeft(item.key, item.pairIndex)}
              disabled={matched.has(item.pairIndex)}
            >
              <TargetText language={language} text={item.text} />
              {item.transliteration && <span className="match-translit">{item.transliteration}</span>}
            </button>
          ))}
        </div>
        <div className="match-col">
          {rightItems.map((item) => (
            <button
              key={item.key}
              className={`match-chip ${matched.has(item.pairIndex) ? "matched" : ""} ${
                flashWrong?.rightKey === item.key ? "wrong" : ""
              }`}
              onClick={() => pickRight(item.key, item.pairIndex)}
              disabled={matched.has(item.pairIndex)}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
      {done && (
        <div className="ex-feedback correct">
          <div className="ex-feedback-text">all matched!</div>
          <button className="primary-btn ex-continue-btn" onClick={() => onAnswered(true)}>
            continue
          </button>
        </div>
      )}
    </div>
  );
}
