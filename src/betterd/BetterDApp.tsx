import { useState } from "react";
import { BetterDProvider } from "./context/BetterDContext";
import { LanguageListPage } from "./pages/LanguageListPage";
import { SkillTreePage } from "./pages/SkillTreePage";
import { ModulePage } from "./pages/ModulePage";
import { LessonRunnerPage } from "./pages/LessonRunnerPage";
import { NotebookPage } from "./pages/NotebookPage";
import type { LanguageCode } from "./types";

type View =
  | { kind: "languages" }
  | { kind: "tree"; language: LanguageCode }
  | { kind: "module"; language: LanguageCode; moduleId: string }
  | { kind: "lesson"; language: LanguageCode; moduleId: string; lessonId: string }
  | { kind: "notebook"; language: LanguageCode; moduleId: string };

export function BetterDApp({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<View>({ kind: "languages" });

  return (
    <BetterDProvider>
      <div className="app-shell">
        {view.kind !== "lesson" && (
          <button className="back-btn" onClick={onBack} aria-label="Back to home">
            ‹ Home
          </button>
        )}
        <main className="app-main">
          {view.kind === "languages" && (
            <LanguageListPage onSelectLanguage={(language) => setView({ kind: "tree", language })} />
          )}
          {view.kind === "tree" && (
            <SkillTreePage
              language={view.language}
              onBack={() => setView({ kind: "languages" })}
              onOpenModule={(moduleId) => setView({ kind: "module", language: view.language, moduleId })}
            />
          )}
          {view.kind === "module" && (
            <ModulePage
              language={view.language}
              moduleId={view.moduleId}
              onBack={() => setView({ kind: "tree", language: view.language })}
              onOpenLesson={(lessonId) =>
                setView({ kind: "lesson", language: view.language, moduleId: view.moduleId, lessonId })
              }
              onOpenNotebook={() =>
                setView({ kind: "notebook", language: view.language, moduleId: view.moduleId })
              }
            />
          )}
          {view.kind === "lesson" && (
            <LessonRunnerPage
              language={view.language}
              moduleId={view.moduleId}
              lessonId={view.lessonId}
              onExit={() => setView({ kind: "module", language: view.language, moduleId: view.moduleId })}
            />
          )}
          {view.kind === "notebook" && (
            <NotebookPage
              language={view.language}
              moduleId={view.moduleId}
              onBack={() => setView({ kind: "module", language: view.language, moduleId: view.moduleId })}
            />
          )}
        </main>
      </div>
    </BetterDProvider>
  );
}
