import { useEffect, useRef, useState } from "react";
import type { LanguageCode, SpeakExercise } from "../../types";
import { fuzzyMatch, recognizeSpeech, speak, speechRecognitionSupported } from "../../speech";
import { TargetText } from "../TargetText";
import { SpeakerIcon, MicIcon } from "../../../nutrition/components/Icons";

type Phase = "prompt" | "listening" | "auto-result" | "self-rate-done";

export function SpeakExerciseView({
  exercise,
  language,
  showTransliteration,
  onAnswered,
}: {
  exercise: SpeakExercise;
  language: LanguageCode;
  showTransliteration: boolean;
  onAnswered: (correct: boolean) => void;
}) {
  const [phase, setPhase] = useState<Phase>("prompt");
  const [transcript, setTranscript] = useState("");
  const [correct, setCorrect] = useState(false);
  const [showSelfRate, setShowSelfRate] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const supported = speechRecognitionSupported();

  useEffect(() => () => stopRef.current?.(), []);

  function startRecording() {
    setPhase("listening");
    stopRef.current = recognizeSpeech(
      language,
      (text) => {
        setTranscript(text);
        setCorrect(fuzzyMatch(text, exercise.target));
        setPhase("auto-result");
      },
      () => setPhase("prompt")
    );
  }

  function stopListening() {
    stopRef.current?.();
    stopRef.current = null;
    setPhase("prompt");
  }

  return (
    <div className="exercise">
      <p className="exercise-prompt">{exercise.prompt}</p>
      <div className="exercise-source">
        <TargetText language={language} text={exercise.target} className="speak-target" />
        {showTransliteration && exercise.transliteration && (
          <div className="exercise-translit">
            {exercise.transliteration}
            {exercise.simplified && ` (简: ${exercise.simplified})`}
          </div>
        )}
        <div className="exercise-english-hint">{exercise.english}</div>
      </div>

      <button className="icon-btn tts-btn" onClick={() => speak(exercise.target, language)} aria-label="hear it">
        <SpeakerIcon /> hear it
      </button>

      {phase === "prompt" && (
        <div className="ex-selfrate">
          {supported && (
            <button className="primary-btn ex-check-btn" onClick={startRecording}>
              <MicIcon /> record my attempt
            </button>
          )}
          {!supported && <p className="hint">say it out loud, then mark how it went.</p>}
          {supported && !showSelfRate ? (
            <button className="text-btn" onClick={() => setShowSelfRate(true)}>
              skip recording — rate myself instead
            </button>
          ) : (
            <div className="ex-selfrate-row">
              <button
                className="secondary-btn"
                onClick={() => {
                  setCorrect(false);
                  setPhase("self-rate-done");
                }}
              >
                needs work
              </button>
              <button
                className="primary-btn"
                onClick={() => {
                  setCorrect(true);
                  setPhase("self-rate-done");
                }}
              >
                nailed it
              </button>
            </div>
          )}
        </div>
      )}
      {phase === "listening" && (
        <div className="ex-selfrate">
          <p className="hint listening-hint">listening…</p>
          <button className="secondary-btn" onClick={stopListening}>
            stop listening
          </button>
        </div>
      )}
      {phase === "auto-result" && (
        <div className={`ex-feedback ${correct ? "correct" : "incorrect"}`}>
          <div className="ex-feedback-text">
            heard: “{transcript}” — {correct ? "correct!" : "not quite a match"}
          </div>
          <button className="primary-btn ex-continue-btn" onClick={() => onAnswered(correct)}>
            continue
          </button>
        </div>
      )}
      {phase === "self-rate-done" && (
        <div className={`ex-feedback ${correct ? "correct" : "incorrect"}`}>
          <div className="ex-feedback-text">{correct ? "nice work!" : "keep practicing this one"}</div>
          <button className="primary-btn ex-continue-btn" onClick={() => onAnswered(correct)}>
            continue
          </button>
        </div>
      )}
    </div>
  );
}
