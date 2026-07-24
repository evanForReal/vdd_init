import { ArtworkPanel } from "./components/ArtworkPanel";
import { todayISO } from "./utils/date";

export function Home({
  onEnterWorkout,
  onEnterNutrition,
}: {
  onEnterWorkout: () => void;
  onEnterNutrition: () => void;
}) {
  return (
    <div className="home-shell">
      <div className="home-art-backdrop">
        <ArtworkPanel seed={`home-${todayISO()}`} variant="hero" minHeight="100%" />
      </div>
      <div className="home-scrim" />
      <div className="home-content">
        <h1 className="home-title">Lift Log</h1>
        <div className="orb-row">
          <button className="orb orb-workout" onClick={onEnterWorkout}>
            <span className="orb-label">Workout</span>
          </button>
          <button className="orb orb-nutrition" onClick={onEnterNutrition}>
            <span className="orb-label">Nutrition</span>
          </button>
        </div>
      </div>
    </div>
  );
}
