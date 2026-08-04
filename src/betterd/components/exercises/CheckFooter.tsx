export function CheckFooter({
  checked,
  correct,
  correctAnswerLabel,
  canCheck,
  onCheck,
  onContinue,
  onVeto,
  checkLabel = "check",
}: {
  checked: boolean;
  correct: boolean;
  correctAnswerLabel?: string;
  canCheck: boolean;
  onCheck: () => void;
  onContinue: () => void;
  onVeto?: () => void;
  checkLabel?: string;
}) {
  if (!checked) {
    return (
      <button className="primary-btn ex-check-btn" disabled={!canCheck} onClick={onCheck}>
        {checkLabel}
      </button>
    );
  }
  return (
    <div className={`ex-feedback ${correct ? "correct" : "incorrect"}`}>
      <div className="ex-feedback-row">
        <div className="ex-feedback-text">
          {correct ? "correct!" : correctAnswerLabel ? `correct answer: ${correctAnswerLabel}` : "not quite"}
        </div>
        <button className="primary-btn ex-continue-btn" onClick={onContinue}>
          continue
        </button>
      </div>
      {!correct && onVeto && (
        <button className="text-btn veto-btn" onClick={onVeto}>
          no, i was right
        </button>
      )}
    </div>
  );
}
