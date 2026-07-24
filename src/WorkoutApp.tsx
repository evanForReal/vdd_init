import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { TodayPage } from "./pages/TodayPage";
import { ProgramPage } from "./pages/ProgramPage";
import { BottomNav, type Tab } from "./components/BottomNav";

export function WorkoutApp({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <AppProvider>
      <div className="app-shell">
        <button className="back-btn" onClick={onBack} aria-label="Back to home">
          ‹ Home
        </button>
        <main className="app-main">
          {tab === "today" ? <TodayPage /> : <ProgramPage />}
        </main>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </AppProvider>
  );
}
