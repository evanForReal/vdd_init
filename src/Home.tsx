import { ArtworkPanel } from "./components/ArtworkPanel";
import { todayISO } from "./utils/date";

export function Home({
  onEnterWorkout,
  onEnterNutrition,
  onEnterTd,
  onEnterBetterD,
}: {
  onEnterWorkout: () => void;
  onEnterNutrition: () => void;
  onEnterTd: () => void;
  onEnterBetterD: () => void;
}) {
  return (
    <div className="home-shell">
      <div className="home-art-backdrop">
        <ArtworkPanel seed={`home-${todayISO()}`} variant="hero" minHeight="100%" />
      </div>
      <div className="home-scrim" />
      <div className="home-content">
        <h1 className="home-title">the right tracking app</h1>
        <div className="orb-grid">
          <div className="orb-col">
            <button className="orb orb-m" onClick={onEnterWorkout}>
              <span className="orb-label">m</span>
            </button>
            <button className="orb orb-n" onClick={onEnterNutrition}>
              <span className="orb-label">n</span>
            </button>
          </div>
          <div className="orb-col orb-col-offset">
            <button className="orb orb-td" onClick={onEnterTd}>
              <span className="orb-label">td</span>
            </button>
            <button className="orb orb-bd" onClick={onEnterBetterD}>
              <span className="orb-label">d</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
