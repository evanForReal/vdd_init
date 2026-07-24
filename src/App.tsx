import { useState } from "react";
import { Home } from "./Home";
import { WorkoutApp } from "./WorkoutApp";
import { NutritionApp } from "./nutrition/NutritionApp";

type Mode = "home" | "workout" | "nutrition";

export default function App() {
  const [mode, setMode] = useState<Mode>("home");

  if (mode === "workout") {
    return <WorkoutApp onBack={() => setMode("home")} />;
  }
  if (mode === "nutrition") {
    return <NutritionApp onBack={() => setMode("home")} />;
  }
  return (
    <Home
      onEnterWorkout={() => setMode("workout")}
      onEnterNutrition={() => setMode("nutrition")}
    />
  );
}
