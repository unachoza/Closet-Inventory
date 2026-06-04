import { useState, useEffect, useRef, useCallback } from "react";
import "./TextileGuide.css";
import { FIBERS, WEAVE_TYPES, CARE_GROUPS, SOURCES, Fiber } from "../../Content/Fabric&Fiber";
import { FiberCard } from "../../Components/GuideComponents/FiberCard";
import WeaveDiagram from "../../Components/GuideComponents/WeaveDiagram";
import FiberFlowchart from "../../Components/GuideComponents/FiberFlowchart";
import React from "react";
import DetailModal from "../../Components/GuideComponents/Modal";

const TextileGuildInteractive = () => {
	const [selectedFiber, setSelectedFiber] = useState<Fiber | null>(null);
	const [activeWeave, setActiveWeave] = useState<string>("plain");
	const [activeNavId, setActiveNavId] = useState<string>("natural");

	// Section headings for IntersectionObserver nav highlight
	const sectionIds = ["natural", "semi", "synthetic", "weaves", "compare", "flowchart", "care", "sources"];
	const observeRef = useRef<IntersectionObserver | null>(null);

	useEffect(() => {
		observeRef.current = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) setActiveNavId(entry.target.id);
				});
			},
			{ threshold: 0.25 },
		);

		sectionIds.forEach((id) => {
			const elem = document.getElementById(id);
			if (elem) observeRef.current?.observe(elem);
		});

		return () => {
			observeRef.current?.disconnect();
		};
	}, []);

	const scrollToSection = useCallback((id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
	}, []);

	const animalFibers = FIBERS.filter((f) => f.category === "animal");
	const plantFibers = FIBERS.filter((f) => f.category === "plant");
	const semiFibers = FIBERS.filter((f) => f.category === "semi");
	const synthFibers = FIBERS.filter((f) => f.category === "synth");

	const activeWeaveData = WEAVE_TYPES.find((w) => w.id === activeWeave);

	return (
		<div>
			{/* ── HERO ── */}
			<section className="hero">
				<div className="hero-inner">
					<p className="hero-eyebrow">A Textile Expert's Reference</p>
					<h1>
						The Complete
						<br />
						<em>Textile Compendium</em>
					</h1>
					{/* <p className='hero-description'>Explore the world of textiles with our comprehensive guide to fibers, weaves, care, and more. Whether you're a fashion designer, a sustainability advocate, or just curious about what goes into your clothes, we've got you covered.</p> */}
					<p className="hero-sub">
						An encyclopedic guide to fibers, fabrics, weaves, and garment care — from the raw fleece of a Cashmere goat to the
						engineered precision of modern synthetics.
					</p>
					<div className="hero-stats">
						<div>
							<span className="hero-stat-num">30+</span>
							<span className="hero-stat-label">Fibers covered</span>
						</div>
						<div>
							<span className="hero-stat-num">3</span>
							<span className="hero-stat-label">Fiber categories</span>
						</div>
						<div>
							<span className="hero-stat-num">8</span>
							<span className="hero-stat-label">Weave structures</span>
						</div>
						<div>
							<span className="hero-stat-num">∞</span>
							<span className="hero-stat-label">Care instructions</span>
						</div>
					</div>
				</div>
			</section>

			{/* ── STICKY NAV ── */}
			<nav className="toc-nav">
				<div className="toc-inner">
					{[
						{ id: "natural", label: "Natural Fibers", dot: "#5A7A60" },
						{ id: "semi", label: "Semi-Synthetic", dot: "#4A6B8A" },
						{ id: "synthetic", label: "Synthetic", dot: "#8B5A7A" },
						{ id: "weaves", label: "Weave Structures", dot: undefined },
						{ id: "compare", label: "Comparison", dot: undefined },
						{ id: "flowchart", label: "Fiber Journey", dot: undefined },
						{ id: "care", label: "Care Guide", dot: undefined },
						{ id: "sources", label: "Sources", dot: undefined },
					].map(({ id, label, dot }) => (
						<button key={id} className={`toc-link${activeNavId === id ? " active" : ""}`} onClick={() => scrollToSection(id)}>
							{dot && <span className="toc-dot" style={{ background: dot }} />}
							{label}
						</button>
					))}
				</div>
			</nav>

			{/* ══════════ NATURAL FIBERS ══════════ */}
			<section id="natural">
				<div className="container">
					<div className="section-header">
						<p className="section-eyebrow">Category One</p>
						<h2 className="section-title">Natural Fibers</h2>
						<p className="section-desc">
							Derived directly from plants and animals, natural fibers have clothed humanity for millennia. They are
							biodegradable, breathable, and often develop character with age.
						</p>
					</div>

					{/* Animal sub-section */}
					<div className="cat-banner cat-banner-natural">
						<h2>🐑 Animal Fibers</h2>
						<p>
							Protein-based fibers spun from animal coats, cocoons, and hair. They are thermally regulating, naturally
							moisture-wicking, and extraordinarily durable when cared for correctly.
						</p>
						<div className="cat-banner-meta">
							<span>📍 Protein-based (keratin or fibroin)</span>
							<span>♻️ Biodegradable</span>
							<span>🌡️ Temperature-regulating</span>
						</div>
					</div>

					<div className="fiber-grid">
						{animalFibers.map((f) => {
							return <FiberCard key={f.id} fiber={f} onClick={() => setSelectedFiber(f)} />;
						})}
					</div>

					{/* Plant sub-section */}
					<div className="cat-banner cat-banner-natural" style={{ marginTop: 48 }}>
						<h2>🌿 Plant Fibers</h2>
						<p>
							Cellulose-based fibers derived from seeds, stems, leaves, and bast. These fibers are cool, breathable, and
							often improve with repeated washing and wear.
						</p>
						<div className="cat-banner-meta">
							<span>📍 Cellulose-based</span>
							<span>♻️ Fully biodegradable</span>
							<span>❄️ Naturally cool</span>
						</div>
					</div>

					<div className="fiber-grid">
						{plantFibers.map((f) => (
							<FiberCard key={f.id} fiber={f} onClick={() => setSelectedFiber(f)} />
						))}
					</div>
				</div>
			</section>

			{/* ══════════ SEMI-SYNTHETIC ══════════ */}
			<section id="semi">
				<div className="container">
					<div className="section-header">
						<p className="section-eyebrow">Category Two</p>
						<h2 className="section-title">Semi-Synthetic Fibers</h2>
						<p className="section-desc">
							Regenerated cellulose fibers: natural plant pulp is dissolved and re-extruded as fiber. They bridge natural
							comfort and synthetic consistency.
						</p>
					</div>
					<div className="cat-banner cat-banner-semi">
						<h2>🌲 Regenerated Cellulose</h2>
						<p>
							Starting with wood pulp from trees like eucalyptus, beech, and bamboo, these fibers are chemically processed
							into smooth, fluid textiles. Sustainability varies dramatically by production method.
						</p>
						<div className="cat-banner-meta">
							<span>📍 Plant-derived, chemically processed</span>
							<span>♻️ Often biodegradable</span>
							<span>💧 Excellent drape</span>
						</div>
					</div>
					<div className="fiber-grid">
						{semiFibers.map((f) => (
							<FiberCard key={f.id} fiber={f} onClick={() => setSelectedFiber(f)} />
						))}
					</div>
				</div>
			</section>

			{/* ══════════ SYNTHETIC ══════════ */}
			<section id="synthetic">
				<div className="container">
					<div className="section-header">
						<p className="section-eyebrow">Category Three</p>
						<h2 className="section-title">Synthetic Fibers</h2>
						<p className="section-desc">
							Engineered from petrochemicals, synthetics dominate global fiber production at ~65%. They excel in
							performance, consistency, and specific applications — but carry environmental trade-offs.
						</p>
					</div>
					<div className="cat-banner cat-banner-synth">
						<h2>⚗️ Petroleum-Derived Fibers</h2>
						<p>
							Manufactured through chemical polymerization and melt-spinning, these fibers offer unprecedented performance
							characteristics. Polyester alone represents 57–65% of all textile fiber produced globally.
						</p>
						<div className="cat-banner-meta">
							<span>📍 Petroleum-based polymers</span>
							<span>⚡ High performance</span>
							<span>⚠️ Microplastic concern</span>
						</div>
					</div>
					<div className="fiber-grid">
						{synthFibers.map((f) => (
							<FiberCard key={f.id} fiber={f} onClick={() => setSelectedFiber(f)} />
						))}
					</div>
				</div>
			</section>

			{/* ══════════ WEAVE STRUCTURES ══════════ */}
			<section id="weaves">
				<div className="container">
					<div className="section-header">
						<p className="section-eyebrow">Structure & Construction</p>
						<h2 className="section-title">Textile Weave Structures</h2>
						<p className="section-desc">
							The way threads interlace determines a fabric's drape, strength, texture, and use. Three fundamental
							structures — plain, twill, and satin — form the foundation of all woven textiles.
						</p>
					</div>

					<div className="weave-tabs toc-nav">
						{WEAVE_TYPES.map((w) => (
							<button
								key={w.id}
								className={`weave-tab${activeWeave === w.id ? " active" : ""}`}
								onClick={() => setActiveWeave(w.id)}
							>
								{w.name}
							</button>
						))}
					</div>

					{activeWeaveData && (
						<div className="weave-content">
							<div className="weave-diagram">
								<WeaveDiagram weaveId={activeWeave} />
							</div>
							<div className="weave-info">
								<h3>{activeWeaveData.name}</h3>
								<p className="weave-desc">{activeWeaveData.description}</p>
								<div className="weave-chips">
									{activeWeaveData.chips.map((c) => (
										<span key={c} className="weave-chip">
											{c}
										</span>
									))}
								</div>
								<div className="weave-fabrics">
									<h5>Fabrics produced</h5>
									<ul>
										{activeWeaveData.fabrics.map((f) => (
											<li key={f}>{f}</li>
										))}
									</ul>
								</div>
								<div style={{ marginTop: 16, padding: 14, background: "var(--sage-pale)", borderRadius: 10 }}>
									<p style={{ fontSize: 13, color: "var(--sage)", margin: 0 }}>
										<strong>Note: </strong>
										{activeWeaveData.compatibleFibers}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</section>

			{/* ══════════ COMPARISON TABLE ══════════ */}
			<section id="compare">
				<div className="container">
					<div className="section-header">
						<p className="section-eyebrow">At a Glance</p>
						<h2 className="section-title">Fiber Comparison</h2>
						<p className="section-desc">
							Key properties side by side. Click any fiber card above for detailed care instructions.
						</p>
					</div>
					<div className="compare-table-wrap">
						<table>
							<thead>
								<tr>
									<th>Fiber</th>
									<th>Category</th>
									<th>Source</th>
									<th>Breathability</th>
									<th>Durability</th>
									<th>Eco-Rating</th>
									<th>Cost</th>
								</tr>
							</thead>
							<tbody>
								{[
									["Merino Wool", "Natural/Animal", "Merino sheep", "High", "High", "Good", "$$–$$$"],
									["Cashmere", "Natural/Animal", "Cashmere goat", "Medium", "Low", "Fair", "$$$$"],
									["Mohair", "Natural/Animal", "Angora goat", "High", "High", "Fair", "$$$"],
									["Silk", "Natural/Animal", "Silkworm", "High", "Medium", "Low", "$$$$"],
									["Alpaca", "Natural/Animal", "Alpaca", "High", "High", "Good", "$$$"],
									["Cotton", "Natural/Plant", "Cotton plant", "High", "High", "Fair", "$"],
									["Linen", "Natural/Plant", "Flax plant", "Very High", "Very High", "Good", "$$"],
									["Hemp", "Natural/Plant", "Hemp plant", "High", "Very High", "Excellent", "$$"],
									["Viscose/Rayon", "Semi-Synthetic", "Wood pulp", "High", "Low", "Poor", "$"],
									["Modal", "Semi-Synthetic", "Beech trees", "High", "Medium", "Fair", "$$"],
									["TENCEL™/Lyocell", "Semi-Synthetic", "Eucalyptus", "High", "Medium", "Excellent", "$$"],
									["Polyester", "Synthetic", "Petroleum", "Low", "Very High", "Poor", "$"],
									["Nylon", "Synthetic", "Petroleum", "Low", "Very High", "Poor", "$–$$"],
									["Spandex/Lycra", "Synthetic", "Petroleum", "Very Low", "Medium", "Poor", "$$"],
									["Acrylic", "Synthetic", "Petroleum", "Low", "Medium", "Poor", "$"],
								].map(([fiber, cat, src, breath, dur, eco, cost]) => (
									<tr key={fiber}>
										<td>{fiber}</td>
										<td>{cat}</td>
										<td>{src}</td>
										<td>
											<span
												className={`pill ${breath?.includes("High") ? "pill-high" : breath === "Medium" ? "pill-med" : "pill-low"}`}
											>
												{breath}
											</span>
										</td>
										<td>
											<span
												className={`pill ${dur?.includes("High") ? "pill-high" : dur === "Medium" ? "pill-med" : "pill-low"}`}
											>
												{dur}
											</span>
										</td>
										<td>
											<span
												className={`pill ${eco === "Excellent" || eco === "Good" ? "pill-high" : eco === "Fair" ? "pill-med" : "pill-low"}`}
											>
												{eco}
											</span>
										</td>
										<td>{cost}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* ══════════ FLOWCHART ══════════ */}
			<section id="flowchart">
				<div className="container">
					<div className="section-header">
						<p className="section-eyebrow">How Fabric is Made</p>
						<h2 className="section-title">The Fiber-to-Garment Journey</h2>
						<p className="section-desc">
							From raw source to finished garment — how each category of fiber travels to become textile.
						</p>
					</div>
					<FiberFlowchart />
				</div>
			</section>

			{/* ══════════ CARE GUIDE ══════════ */}
			<section id="care">
				<div className="container">
					<div className="section-header">
						<p className="section-eyebrow">Fabric Care</p>
						<h2 className="section-title">How to Care for Every Fiber</h2>
						<p className="section-desc">
							Proper care extends garment life significantly. The most fundamental rule: always check the care label and
							follow the most delicate fiber in any blend.
						</p>
					</div>
					{CARE_GROUPS.map((group, gi) => (
						// TODO FIX THIS REPEATING FRAGMENT KEY WARNING
						<React.Fragment key={group.title}>
							{gi > 0 && <div className="divider" />}
							<div className="care-section-header">
								<h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 6 }}>
									{group.title}
								</h3>
								<p style={{ color: "var(--ink-60)", fontSize: 14, marginBottom: 16 }}>{group.subtitle}</p>
								<div className="care-grid">
									{group.items.map((item) => (
										<div
											key={item.label}
											className="care-card"
											style={item.backgroundImageUrl ? {
												backgroundImage: `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), url(${item.backgroundImageUrl})`,
												backgroundSize: "cover",
												backgroundPosition: "center",
											} : undefined}
										>
											<div className="care-icon">{item.icon}</div>
											<div className="care-label">{item.label}</div>
											<div className="care-value">{item.value}</div>
										</div>
									))}
								</div>
							</div>
						</React.Fragment>
					))}
				</div>
			</section>

			{/* ══════════ SOURCES ══════════ */}
			<section id="sources">
				<div className="container">
					<div className="section-header">
						<p className="section-eyebrow">Research & References</p>
						<h2 className="section-title">Sources</h2>
						<p className="section-desc">
							This guide draws from textile industry sources, fiber producers, and academic references.
						</p>
					</div>
					<div className="sources-grid">
						{SOURCES.map((s) => (
							<a key={s.num} className="source-card" href={s.url} target="_blank" rel="noopener noreferrer">
								<div className="source-num">{s.num}</div>
								<div className="source-title">{s.title}</div>
								<div className="source-url">{s.domain}</div>
							</a>
						))}
					</div>
				</div>
			</section>

			{/* ══════════ FOOTER ══════════ */}
			<footer className="site-footer">
				<div className="footer-inner">
					<div className="footer-title">The Complete Textile Compendium</div>
					<p className="footer-sub">
						A reference guide to fibers, fabrics, and textile construction — compiled from industry sources and textile
						science literature. For educational purposes.
					</p>
					<p style={{ marginTop: 24, fontSize: 12, color: "rgba(250,247,242,0.3)" }}>
						Natural · Semi-Synthetic · Synthetic · Weave Structures · Care Guide
					</p>
				</div>
			</footer>
			{/* ══════════ DETAIL MODAL ══════════ */}
			<DetailModal fiber={selectedFiber} onClose={() => setSelectedFiber(null)} />
		</div>
	);
};

export default TextileGuildInteractive;
