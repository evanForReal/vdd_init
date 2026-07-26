export type TdTab = "day" | "scope" | "focus";

export function TdBottomNav({
  active,
  onChange,
}: {
  active: TdTab;
  onChange: (tab: TdTab) => void;
}) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-btn ${active === "day" ? "active" : ""}`}
        onClick={() => onChange("day")}
      >
        Day
      </button>
      <button
        className={`nav-btn ${active === "scope" ? "active" : ""}`}
        onClick={() => onChange("scope")}
      >
        Scope
      </button>
      <button
        className={`nav-btn ${active === "focus" ? "active" : ""}`}
        onClick={() => onChange("focus")}
      >
        Focus
      </button>
    </nav>
  );
}
