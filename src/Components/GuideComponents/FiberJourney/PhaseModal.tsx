import { useEffect, useCallback } from "react";
import { Phase } from "../../../Content/FiberJourney";
import "./PhaseModal.css";

interface PhaseModalProps {
  phase: Phase | null;
  onClose: () => void;
  variant?: "light" | "dark";
}

const PhaseModal = ({ phase, onClose, variant = "light" }: PhaseModalProps) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!phase) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [phase, handleKeyDown]);

  if (!phase) return null;

  return (
    <div
      className={`fj-modal-backdrop fj-modal-backdrop--${variant}`}
      onClick={handleBackdropClick}
    >
      <div className={`fj-modal fj-modal--${variant}`}>
        <div className="fj-modal__header">
          <div className="fj-modal__header-left">
            <div
              className="fj-modal__phase-icon"
              style={{ background: phase.accentLight }}
            >
              {phase.icon}
            </div>
            <div>
              <div
                className="fj-modal__phase-num"
                style={{ color: phase.accentColor }}
              >
                Phase {phase.number}
              </div>
              <h2 className="fj-modal__title">{phase.name}</h2>
            </div>
          </div>
          <button
            className="fj-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="fj-modal__summary">{phase.summary}</p>

        <div className="fj-modal__steps">
          {phase.steps.map((step, i) => (
            <div key={i} className="fj-modal__step-card">
              <div className="fj-modal__step-title">
                <span
                  className="fj-modal__step-dot"
                  style={{ background: phase.accentColor }}
                />
                {step.title}
              </div>
              <p className="fj-modal__step-body">{step.body}</p>
              {step.sources && step.sources.length > 0 && (
                <div className="fj-modal__step-sources">
                  {step.sources.map((src, j) => (
                    <a
                      key={j}
                      className="fj-modal__source-link"
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {src.label} ↗
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhaseModal;
