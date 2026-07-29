import { useState } from "react";
import { MenuIcon, TargetIcon, SparkleIcon, TimerIcon } from "../../nutrition/components/Icons";

export function TdMenu({
  onWeekGoals,
  onSmallJoys,
  onSprint,
}: {
  onWeekGoals: () => void;
  onSmallJoys: () => void;
  onSprint: () => void;
}) {
  const [open, setOpen] = useState(false);

  function pick(fn: () => void) {
    setOpen(false);
    fn();
  }

  return (
    <div className="td-menu">
      <button
        className="icon-btn td-menu-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
      >
        <MenuIcon />
      </button>
      {open && (
        <>
          <div className="td-menu-scrim" onClick={() => setOpen(false)} />
          <div className="td-menu-panel">
            <button className="td-menu-item" onClick={() => pick(onWeekGoals)}>
              <TargetIcon className="td-menu-icon" />
              <span>week goals</span>
            </button>
            <button className="td-menu-item" onClick={() => pick(onSmallJoys)}>
              <SparkleIcon className="td-menu-icon" />
              <span>small joys</span>
            </button>
            <button className="td-menu-item" onClick={() => pick(onSprint)}>
              <TimerIcon className="td-menu-icon" />
              <span>sprint</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
