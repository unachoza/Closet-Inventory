import { useState } from "react";
import { PHASES, Phase } from "../../../Content/FiberJourney";
import PhaseIllustration from "./PhaseIllustrations";
import PhaseModal from "./PhaseModal";
import "./JourneyA.css";

const JourneyA = () => {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);

  return (
    <div className="journey-a">
      <header className="ja-header">
        <div className="ja-header__inner">
          <div>
            <div className="ja-option-label">Option A</div>
            <h1 className="ja-header__title">
              Fiber to<br />
              <em>Garment</em>
            </h1>
          </div>
          <div className="ja-header__badge">
            <span>Tap any phase to explore</span>
          </div>
        </div>
      </header>

      <main className="ja-canvas">
        <div className="ja-canvas__hint">
          <p>tap · click · explore</p>
        </div>

        <div className="ja-phase-track">
          {PHASES.map((phase, i) => (
            <div key={phase.id} className="ja-phase-track__group">
              <div
                className="ja-phase-node"
                role="button"
                tabIndex={0}
                aria-label={`Phase ${phase.number}: ${phase.name}`}
                onClick={() => setSelectedPhase(phase)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedPhase(phase);
                }}
              >
                <div
                  className="ja-node-illustration"
                  style={{ borderColor: `${phase.accentColor}40` }}
                >
                  <div
                    className="ja-node-number"
                    style={{ background: phase.accentColor }}
                  >
                    {phase.number}
                  </div>
                  <PhaseIllustration phaseId={phase.id} accent={phase.accentColor} />
                </div>
                <span className="ja-node-label">{phase.shortLabel}</span>
              </div>

              {i < PHASES.length - 1 && (
                <div className="ja-connector">
                  <svg width="48" height="20" viewBox="0 0 48 20">
                    <defs>
                      <marker
                        id={`ja-arrow-${i}`}
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <path
                          d="M2 2L8 5L2 8"
                          fill="none"
                          stroke="#C4BFB5"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </marker>
                    </defs>
                    <line
                      x1="4"
                      y1="10"
                      x2="40"
                      y2="10"
                      stroke="#C4BFB5"
                      strokeWidth="1.5"
                      markerEnd={`url(#ja-arrow-${i})`}
                      strokeDasharray="4 3"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <PhaseModal
        phase={selectedPhase}
        onClose={() => setSelectedPhase(null)}
        variant="light"
      />
    </div>
  );
};

export default JourneyA;
