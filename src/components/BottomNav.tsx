export type Tab = "today" | "program";

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className="bottom-nav">
      <button
        className={`nav-btn ${active === "today" ? "active" : ""}`}
        onClick={() => onChange("today")}
      >
        Today
      </button>
      <button
        className={`nav-btn ${active === "program" ? "active" : ""}`}
        onClick={() => onChange("program")}
      >
        Program
      </button>
    </nav>
  );
}
