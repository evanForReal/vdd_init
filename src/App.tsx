import { useState } from "react";
import { Home } from "./Home";
import { WorkoutApp } from "./WorkoutApp";
import { NutritionApp } from "./nutrition/NutritionApp";
import { TdApp } from "./td/TdApp";
import { BetterDApp } from "./betterd/BetterDApp";

type Mode = "home" | "workout" | "nutrition" | "td" | "betterd";

export default function App() {
  const [mode, setMode] = useState<Mode>("home");

  if (mode === "workout") {
    return <WorkoutApp onBack={() => setMode("home")} />;
  }
  if (mode === "nutrition") {
    return <NutritionApp onBack={() => setMode("home")} />;
  }
  if (mode === "td") {
    return <TdApp onBack={() => setMode("home")} />;
  }
  if (mode === "betterd") {
    return <BetterDApp onBack={() => setMode("home")} />;
  }
  return (
    <Home
      onEnterWorkout={() => setMode("workout")}
      onEnterNutrition={() => setMode("nutrition")}
      onEnterTd={() => setMode("td")}
      onEnterBetterD={() => setMode("betterd")}
    />
  );
}
