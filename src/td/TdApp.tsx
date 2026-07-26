import { useState } from "react";
import { TodoProvider } from "./context/TodoContext";
import { DayPage } from "./pages/DayPage";
import { ScopePage } from "./pages/ScopePage";
import { FocusPage } from "./pages/FocusPage";
import { TdBottomNav, type TdTab } from "./TdBottomNav";

export function TdApp({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<TdTab>("day");

  return (
    <TodoProvider>
      <div className="app-shell">
        <button className="back-btn" onClick={onBack} aria-label="Back to home">
          ‹ Home
        </button>
        <main className="app-main">
          {tab === "day" && <DayPage />}
          {tab === "scope" && <ScopePage />}
          {tab === "focus" && <FocusPage />}
        </main>
        <TdBottomNav active={tab} onChange={setTab} />
      </div>
    </TodoProvider>
  );
}
