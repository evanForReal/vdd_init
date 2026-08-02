import { useState } from "react";
import { useBetterD } from "../context/BetterDContext";
import type { LanguageCode } from "../types";
import { ExerciseRenderer } from "../components/exercises/ExerciseRenderer";
import { NoteFoldout } from "../components/NoteFoldout";
import { QuoteCard } from "../components/QuoteCard";
import { CheckIcon } from "../../nutrition/components/Icons";

export function LessonRunnerPage({
  language,
  moduleId,
  lessonId,
  onExit,
}: {
  language: LanguageCode;
  moduleId: string;
  lessonId: string;
  onExit: () => void;
}) {
  const { getLesson, completeLesson, addNote, quoteForLesson } = useBetterD();
  const lesson = getLesson(lessonId);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [noteBuffer, setNoteBuffer] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  if (!lesson) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>lesson not found</p>
        </div>
      </div>
    );
  }

  const exercise = lesson.exercises[index];
  const progress = done ? 100 : (index / lesson.exercises.length) * 100;

  function handleAnswered(correct: boolean) {
    const newCorrectCount = correctCount + (correct ? 1 : 0);
    setCorrectCount(newCorrectCount);
    if (index + 1 < lesson!.exercises.length) {
      setIndex((i) => i + 1);
      return;
    }
    if (noteBuffer.length > 0) {
      addNote(moduleId, lessonId, language, noteBuffer.join("\n\n"));
    }
    completeLesson(language, lessonId, newCorrectCount, lesson!.exercises.length);
    setDone(true);
  }

  const quote = done ? quoteForLesson(lessonId, language) : undefined;

  return (
    <div className="page lesson-runner">
      <div className="lesson-header">
        <button className="icon-btn" onClick={onExit} aria-label="exit lesson">
          ✕
        </button>
        <div className="lesson-progress-track">
          <div className="lesson-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        {!done && (
          <NoteFoldout
            entryCount={noteBuffer.length}
            onAppend={(text) => setNoteBuffer((b) => [...b, text])}
          />
        )}
      </div>

      {!done && exercise && (
        <ExerciseRenderer key={exercise.id} exercise={exercise} language={language} onAnswered={handleAnswered} />
      )}

      {done && (
        <div className="lesson-complete">
          <div className="lesson-score">
            <CheckIcon className="lesson-score-icon" />
            {correctCount}/{lesson.exercises.length} correct
          </div>
          {quote && <QuoteCard quote={quote} language={language} />}
          <button className="primary-btn" onClick={onExit}>
            done
          </button>
        </div>
      )}
    </div>
  );
}
