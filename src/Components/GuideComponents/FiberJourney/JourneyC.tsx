import { useState, useCallback, useRef } from "react";
import { PHASES, Phase, PhaseStep } from "../../../Content/FiberJourney";
import { STEP_PREVIEWS, DARK_ACCENTS } from "./journeyData";
import { MoveDown, MoveDownLeft, MoveDownRight } from "lucide-react";
import "./JourneyC.css";

interface StepModalData {
	phase: Phase;
	step: PhaseStep;
	accent: string;
}

const JourneyC = () => {
	const [modalData, setModalData] = useState<StepModalData | null>(null);

	const phaseRefs = useRef<(HTMLDivElement | null)[]>([]);

	const scrollToPhase = useCallback((index: number) => {
		phaseRefs.current[index - 1]?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, []);

	const openModal = useCallback((phase: Phase, step: PhaseStep, accent: string) => {
		setModalData({ phase, step, accent });
		document.body.style.overflow = "hidden";
	}, []);

	const closeModal = useCallback(() => {
		setModalData(null);
		document.body.style.overflow = "";
	}, []);

	const handleBackdropClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === e.currentTarget) closeModal();
		},
		[closeModal],
	);

	return (
		<div className="journey-c">
			<header className="jc-header">
				<div>
					<div className="jc-option-label">Option C</div>
					<h1 className="jc-header__title">
						Fiber to <em>Garment</em>
					</h1>
				</div>
				<div className="jc-header__legend">
					<div className="jc-legend-heading">Phase color key</div>
					{PHASES.map((phase) => (
						<button
							key={phase.id}
							type="button"
							className="jc-legend-item"
							onClick={() => scrollToPhase(phase.number)}
							aria-label={`Scroll to phase ${phase.number + 1}: ${phase.name}`}
						>
							<span className="jc-legend-dot" style={{ background: DARK_ACCENTS[phase.id] }} />
							{phase.name}
						</button>
					))}
				</div>
			</header>

			<main className="jc-main">
				<div className="jc-container">
					{PHASES.map((phase, pi) => {
						<button
							key={phase.id}
							type="button"
							className="jc-legend-item"
							onClick={() => scrollToPhase(phase.number)}
							aria-label={`Scroll to phase ${phase.number + 1}: ${phase.name}`}
						>
							<span className="jc-legend-dot" style={{ background: DARK_ACCENTS[phase.id] }} />
							{phase.name}
						</button>;
						const accent = DARK_ACCENTS[phase.id] ?? phase.accentColor;
						const previews = STEP_PREVIEWS[phase.id] ?? [];

						return (
							<div>
								<div
									key={phase.id}
									ref={(el) => {
										phaseRefs.current[pi] = el;
									}}
									className={`jc-phase-col jc-phase-col-${pi}`}
								>
									{/* Phase header node */}
									<div
										className="jc-phase-header-node"
										style={{
											borderColor: `${accent}60`,
											background: `${accent}14`,
										}}
									>
										<div className="jc-phase-num" style={{ color: accent }}>
											{String(pi + 1).padStart(2, "0")} ·
										</div>
										<div className="jc-phase-icon">{phase.icon}</div>
										<div className="jc-phase-name" style={{ color: accent }}>
											{phase.name}
										</div>
									</div>
									{/* Step nodes */}
									{phase.steps.map((step, si) => (
										<div
											key={si}
											className={`jc-step-node ${si === phase.steps.length - 1 ? "jc-step-node--last" : ""}`}
											style={{
												borderLeftColor: `${accent}35`,
												borderRightColor: `${accent}35`,
												...(si === phase.steps.length - 1
													? { borderBottomColor: `${accent}60` }
													: {}),
											}}
											onClick={() => openModal(phase, step, accent)}
										>
											<div className="jc-step-node__title">
												<span className="jc-step-dot" style={{ background: accent }} />
												{step.title}
											</div>
											<div className="jc-step-node__preview">{previews[si] ?? ""}</div>
											<span className="jc-step-expand-hint">tap ↗</span>
										</div>
									))}
								</div>
								{/* Diagonal arrows — desktop zig-zag */}
								{pi % 2 === 0 ? (
									<MoveDownRight
										size={24}
										className={`jc-phase-arrow-${pi} jc-phase-arrow--diagonal`}
										style={{ color: accent }}
									/>
								) : (
									<MoveDownLeft
										size={24}
										className={`jc-phase-arrow-${pi} jc-phase-arrow--diagonal`}
										style={{ color: accent }}
									/>
								)}
								{/* Down arrow — mobile stack (hidden on desktop) */}
								{pi < PHASES.length - 1 && (
									<MoveDown size={24} className="jc-phase-arrow--down" style={{ color: accent }} />
								)}
							</div>
						);
					})}
				</div>
			</main>

			{/* Key bar */}
			<div className="jc-key-bar">
				{PHASES.map((phase, pi) => {
					const accent = DARK_ACCENTS[phase.id] ?? phase.accentColor;
					return (
						<div
							key={phase.id}
							className="jc-key-segment"
							role="button"
							tabIndex={0}
							onClick={() => scrollToPhase(pi + 1)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									scrollToPhase(pi);
								}
							}}
							aria-label={`Scroll to phase ${pi + 1}: ${phase.name}`}
						>
							<div className="jc-key-seg__num" style={{ color: accent }}>
								{String(pi + 1).padStart(2, "0")}
							</div>
							<div className="jc-key-seg__name">{phase.name}</div>
						</div>
					);
				})}
			</div>

			{/* Step detail modal */}
			{modalData && (
				<div className="jc-modal-backdrop" onClick={handleBackdropClick}>
					<div className="jc-modal">
						<div className="jc-modal__header">
							<div className="jc-modal__header-left">
								<div className="jc-modal__phase-label" style={{ color: modalData.accent }}>
									{modalData.phase.name}
								</div>
								<div className="jc-modal__step-title">{modalData.step.title}</div>
							</div>
							<button className="jc-modal__close" onClick={closeModal}>
								✕
							</button>
						</div>
						<div className="jc-modal__body">
							<p className="jc-modal__text">{modalData.step.body}</p>
							{modalData.step.sources && modalData.step.sources.length > 0 && (
								<div className="jc-modal__sources">
									{modalData.step.sources.map((src, j) => (
										<a
											key={j}
											className="jc-modal__source-link"
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
					</div>
				</div>
			)}
		</div>
	);
};

export default JourneyC;
