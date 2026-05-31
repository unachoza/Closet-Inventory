import { useState, useCallback } from "react";
import { PHASES } from "../../../Content/FiberJourney";
import { MINI_FLOWS, MiniFlowItem } from "./journeyData";
import "./JourneyB.css";

const JourneyB = () => {
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({});

  const togglePhase = useCallback((phaseId: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  }, []);

  return (
    <div className="journey-b">
      <header className="jb-header">
        <div className="jb-header__inner">
          <div className="jb-option-label">Option B</div>
          <h1 className="jb-header__title">
            Fiber to <em>Garment</em>
          </h1>
          <p className="jb-header__subtitle">
            Five phases from raw material to finished clothing. Click any phase to
            expand the process steps.
          </p>
        </div>
      </header>

      <main className="jb-main">
        {PHASES.map((phase, pi) => {
          const isOpen = expandedPhases[phase.id] ?? false;
          const miniFlow = MINI_FLOWS[phase.id] ?? [];

          return (
            <div key={phase.id} className="jb-phase-row">
              {/* Vertical spine */}
              <div className="jb-spine">
                <div
                  className="jb-spine__number"
                  style={{ background: phase.accentColor }}
                >
                  {phase.number}
                </div>
                {pi < PHASES.length - 1 && <div className="jb-spine__line" />}
              </div>

              {/* Phase card */}
              <div className="jb-phase-card">
                <div
                  className="jb-phase-card__header"
                  onClick={() => togglePhase(phase.id)}
                >
                  <div
                    className="jb-phase-card__icon"
                    style={{ background: phase.accentLight }}
                  >
                    <span>{phase.icon}</span>
                  </div>
                  <div className="jb-phase-card__text">
                    <div className="jb-phase-card__title">{phase.name}</div>
                    <div className="jb-phase-card__summary">{phase.summary}</div>
                  </div>
                  <button
                    className={`jb-expand-btn ${isOpen ? "jb-expand-btn--open" : ""}`}
                    aria-label={`Expand ${phase.name}`}
                  >
                    ▾
                  </button>
                </div>

                {/* Mini flow row */}
                {miniFlow.length > 0 && (
                  <MiniFlowRow items={miniFlow} accentLight={phase.accentLight} />
                )}

                {/* Expandable sub-steps */}
                {isOpen && (
                  <div className="jb-sub-steps">
                    {phase.steps.map((step, si) => (
                      <div key={si} className="jb-step-tile">
                        <div className="jb-step-tile__num">
                          Step {String(si + 1).padStart(2, "0")}
                        </div>
                        <div
                          className="jb-step-tile__title"
                          style={{ color: phase.accentColor }}
                        >
                          {step.title}
                        </div>
                        <p className="jb-step-tile__body">{step.body}</p>
                        {step.sources && step.sources.length > 0 && (
                          <div className="jb-step-sources">
                            {step.sources.map((src, j) => (
                              <a
                                key={j}
                                className="jb-step-source"
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
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

/* Mini flow emoji row */
interface MiniFlowRowProps {
  items: MiniFlowItem[];
  accentLight: string;
}

const MiniFlowRow = ({ items, accentLight }: MiniFlowRowProps) => (
  <div className="jb-flow-mini">
    {items.map((item, i) => (
      <div key={i} className="jb-flow-mini__group">
        <div className="jb-flow-mini__item">
          <div
            className="jb-flow-mini__circle"
            style={{ background: accentLight }}
          >
            {item.emoji}
          </div>
          <span className="jb-flow-mini__label">
            {item.label.split("\n").map((line, li) => (
              <span key={li}>
                {line}
                {li === 0 && <br />}
              </span>
            ))}
          </span>
        </div>
        {i < items.length - 1 && <div className="jb-flow-mini__arrow" />}
      </div>
    ))}
  </div>
);

export default JourneyB;
