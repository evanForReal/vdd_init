export type NutritionTab = "day" | "plan" | "targets" | "gallery";

export function NutritionBottomNav({
  active,
  onChange,
}: {
  active: NutritionTab;
  onChange: (tab: NutritionTab) => void;
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
        className={`nav-btn ${active === "plan" ? "active" : ""}`}
        onClick={() => onChange("plan")}
      >
        Plan
      </button>
      <button
        className={`nav-btn ${active === "targets" ? "active" : ""}`}
        onClick={() => onChange("targets")}
      >
        Targets
      </button>
      <button
        className={`nav-btn ${active === "gallery" ? "active" : ""}`}
        onClick={() => onChange("gallery")}
      >
        Gallery
      </button>
    </nav>
  );
}
