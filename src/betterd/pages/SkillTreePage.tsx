import { useState } from "react";
import { useBetterD } from "../context/BetterDContext";
import { modulesForLanguage, languageMeta } from "../content";
import type { LanguageCode } from "../types";
import { StreakBadge } from "../components/StreakBadge";
import { LockIcon, CheckIcon } from "../../nutrition/components/Icons";
import { ArtworkPanel } from "../../components/ArtworkPanel";

export function SkillTreePage({
  language,
  onBack,
  onOpenModule,
}: {
  language: LanguageCode;
  onBack: () => void;
  onOpenModule: (moduleId: string) => void;
}) {
  const { moduleStatus, streak } = useBetterD();
  const meta = languageMeta(language);
  const modules = modulesForLanguage(language);
  const [artSeed] = useState(() => `betterd-tree-${language}-${Math.random().toString(36).slice(2)}`);

  return (
    <div className="page">
      <header className="today-header td-header">
        <div>
          <button className="text-btn" onClick={onBack}>
            ‹ betterD
          </button>
          <div className="today-date">
            {meta.name} <span className="lang-native">{meta.nativeName}</span>
          </div>
          <div className="meso-name">skill tree</div>
        </div>
        <StreakBadge streak={streak} />
      </header>

      <div className="skill-tree">
        {modules.map((module, i) => {
          const status = moduleStatus(module);
          return (
            <button
              key={module.id}
              className={`module-node ${status} ${i % 2 === 1 ? "offset" : ""}`}
              style={{ "--module-accent": meta.accent } as React.CSSProperties}
              onClick={() => (status === "placeholder" ? undefined : onOpenModule(module.id))}
              disabled={status === "locked"}
            >
              <span className="module-node-dot">
                {status === "completed" ? (
                  <CheckIcon />
                ) : status === "locked" || status === "placeholder" ? (
                  <LockIcon />
                ) : (
                  <span className="module-node-order">{module.order}</span>
                )}
              </span>
              <span className="module-node-label">
                <span className="module-node-title">{module.title}</span>
                <span className="module-node-meta">
                  {status === "placeholder" ? "coming soon" : module.estimate}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <ArtworkPanel seed={artSeed} />
    </div>
  );
}
