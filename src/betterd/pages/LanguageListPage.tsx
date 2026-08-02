import { useState } from "react";
import { useBetterD } from "../context/BetterDContext";
import { LANGUAGES, modulesForLanguage } from "../content";
import type { LanguageCode } from "../types";
import { StreakBadge } from "../components/StreakBadge";
import { ArtworkPanel } from "../../components/ArtworkPanel";

export function LanguageListPage({
  onSelectLanguage,
}: {
  onSelectLanguage: (language: LanguageCode) => void;
}) {
  const { moduleStatus, streak } = useBetterD();
  const [artSeed] = useState(() => `betterd-home-${Math.random().toString(36).slice(2)}`);

  return (
    <div className="page">
      <header className="today-header td-header">
        <div>
          <div className="today-date">betterD</div>
          <div className="meso-name">pick a language</div>
        </div>
        <StreakBadge streak={streak} />
      </header>

      <div className="lang-card-list">
        {LANGUAGES.map((lang) => {
          const modules = modulesForLanguage(lang.code);
          const completedCount = modules.filter((m) => moduleStatus(m) === "completed").length;
          return (
            <button
              key={lang.code}
              className="lang-card"
              style={{ "--lang-accent": lang.accent } as React.CSSProperties}
              onClick={() => onSelectLanguage(lang.code)}
            >
              <div className="lang-card-main">
                <div className="lang-card-name">{lang.name}</div>
                <div className="lang-card-native">{lang.nativeName}</div>
              </div>
              <div className="lang-card-progress">
                {completedCount}/{modules.length} modules
              </div>
            </button>
          );
        })}
      </div>

      <ArtworkPanel seed={artSeed} />
    </div>
  );
}
