import { useBetterD } from "../context/BetterDContext";
import { modulesForLanguage, languageMeta } from "../content";
import type { LanguageCode, LessonSize } from "../types";
import { StreakBadge } from "../components/StreakBadge";
import { LockIcon, CheckIcon, BookIcon, GaugeIcon } from "../../nutrition/components/Icons";
import { ArtworkPanel } from "../../components/ArtworkPanel";
import { useState } from "react";

const SIZE_LABEL: Record<LessonSize, string> = { small: "10 min", medium: "20 min", large: "30 min" };

export function ModulePage({
  language,
  moduleId,
  onBack,
  onOpenLesson,
  onOpenNotebook,
  onTestIn,
}: {
  language: LanguageCode;
  moduleId: string;
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenNotebook: () => void;
  onTestIn: () => void;
}) {
  const { lessonsForModule, moduleStatus, streak } = useBetterD();
  const module = modulesForLanguage(language).find((m) => m.id === moduleId);
  const meta = languageMeta(language);
  const [artSeed] = useState(() => `betterd-module-${Math.random().toString(36).slice(2)}`);

  if (!module) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>module not found</p>
        </div>
      </div>
    );
  }

  const nodes = lessonsForModule(module);
  const status = moduleStatus(module);

  return (
    <div className="page">
      <header className="today-header td-header">
        <div>
          <button className="text-btn" onClick={onBack}>
            ‹ {meta.name}
          </button>
          <div className="today-date">{module.title}</div>
          <div className="meso-name">{module.description}</div>
        </div>
        <StreakBadge streak={streak} />
      </header>

      <div className="module-action-row">
        <button className="text-btn notebook-link-btn" onClick={onOpenNotebook}>
          <BookIcon /> view notebook
        </button>
        {status !== "completed" && (
          <button className="text-btn test-in-btn" onClick={onTestIn}>
            <GaugeIcon /> test in
          </button>
        )}
      </div>

      <div className="lesson-path">
        {nodes.map(({ lesson, status }, i) => (
          <button
            key={lesson.id}
            className={`lesson-node lesson-node-${lesson.kind} ${status} ${i % 2 === 1 ? "offset" : ""}`}
            onClick={() => status !== "locked" && onOpenLesson(lesson.id)}
            disabled={status === "locked"}
          >
            <span className="lesson-node-dot">
              {status === "completed" ? (
                <CheckIcon />
              ) : status === "locked" ? (
                <LockIcon />
              ) : (
                <span className="lesson-node-kind-mark">
                  {lesson.kind === "final" ? "★" : lesson.kind === "review" ? "↻" : "●"}
                </span>
              )}
            </span>
            <span className="lesson-node-label">
              <span className="lesson-node-title">{lesson.title}</span>
              <span className="lesson-node-meta">{SIZE_LABEL[lesson.size]}</span>
            </span>
          </button>
        ))}
      </div>

      <ArtworkPanel seed={artSeed} />
    </div>
  );
}
