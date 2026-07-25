import { useState } from "react";
import { NutritionProvider } from "./context/NutritionContext";
import { DayPage } from "./pages/DayPage";
import { PlanPage } from "./pages/PlanPage";
import { TargetsPage } from "./pages/TargetsPage";
import { GalleryPage } from "./pages/GalleryPage";
import { NutritionBottomNav, type NutritionTab } from "./NutritionBottomNav";

export function NutritionApp({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<NutritionTab>("day");

  return (
    <NutritionProvider>
      <div className="app-shell">
        <button className="back-btn" onClick={onBack} aria-label="Back to home">
          ‹ Home
        </button>
        <main className="app-main">
          {tab === "day" && <DayPage />}
          {tab === "plan" && <PlanPage />}
          {tab === "targets" && <TargetsPage />}
          {tab === "gallery" && <GalleryPage />}
        </main>
        <NutritionBottomNav active={tab} onChange={setTab} />
      </div>
    </NutritionProvider>
  );
}
