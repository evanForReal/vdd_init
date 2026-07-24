import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { TodayPage } from "./pages/TodayPage";
import { ProgramPage } from "./pages/ProgramPage";
import { BottomNav, type Tab } from "./components/BottomNav";

export default function App() {
  const [tab, setTab] = useState<Tab>("today");

  return (
    <AppProvider>
      <div className="app-shell">
        <main className="app-main">
          {tab === "today" ? <TodayPage /> : <ProgramPage />}
        </main>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </AppProvider>
  );
}
