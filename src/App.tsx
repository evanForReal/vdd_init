import { useState } from "react";
import { Home } from "./Home";
import { WorkoutApp } from "./WorkoutApp";
import { NutritionApp } from "./nutrition/NutritionApp";
import { TdApp } from "./td/TdApp";
import { BetterDApp } from "./betterd/BetterDApp";
import { BlogApp } from "./blog/BlogApp";
import { BookmarksProvider } from "./context/BookmarksContext";

type Mode = "home" | "workout" | "nutrition" | "td" | "betterd" | "blog";

export default function App() {
  const [mode, setMode] = useState<Mode>("home");

  return (
    <BookmarksProvider>
      {mode === "workout" ? (
        <WorkoutApp onBack={() => setMode("home")} />
      ) : mode === "nutrition" ? (
        <NutritionApp onBack={() => setMode("home")} />
      ) : mode === "td" ? (
        <TdApp onBack={() => setMode("home")} />
      ) : mode === "betterd" ? (
        <BetterDApp onBack={() => setMode("home")} />
      ) : mode === "blog" ? (
        <BlogApp onBack={() => setMode("home")} />
      ) : (
        <Home
          onEnterWorkout={() => setMode("workout")}
          onEnterNutrition={() => setMode("nutrition")}
          onEnterTd={() => setMode("td")}
          onEnterBetterD={() => setMode("betterd")}
          onEnterBlog={() => setMode("blog")}
        />
      )}
    </BookmarksProvider>
  );
}
