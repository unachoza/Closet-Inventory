import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ClothingDetail } from "./cardData";

const CARD_GRADIENT = "linear-gradient(180deg, #78acbf 0%, #678385 100%)";

const smallTag: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	padding: "3px 8px",
	fontSize: 10,
	fontWeight: 500,
	color: "white",
	background: "rgba(255,255,255,0.15)",
	border: "1px solid rgba(255,255,255,0.42)",
	borderRadius: 5,
	whiteSpace: "nowrap",
};

const pill: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	padding: "4px 10px",
	fontSize: 11,
	fontWeight: 500,
	color: "white",
	background: "rgba(255,255,255,0.16)",
	border: "1px solid rgba(255,255,255,0.45)",
	borderRadius: 5,
	whiteSpace: "nowrap",
};

function SectionTitle({ label }: { label: string }) {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
			<span
				style={{
					fontSize: 10,
					fontWeight: 700,
					color: "rgba(255,255,255,0.55)",
					letterSpacing: "0.12em",
					textTransform: "uppercase",
					flexShrink: 0,
				}}
			>
				{label}
			</span>
			<div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.2)" }} />
		</div>
	);
}

interface CardDProps {
	item: ClothingDetail;
	onEdit?: () => void;
	onRemove?: () => void;
}

export const CardDetails = ({ item, onEdit, onRemove }: CardDProps) => {
	const [expanded, setExpanded] = useState(false);
	const [confirming, setConfirming] = useState(false);

	return (
		<div
			style={{
				background: CARD_GRADIENT,
				borderRadius: 16,
				padding: 24,
				width: 300,
				display: "flex",
				flexDirection: "column",
				gap: 16,
				boxSizing: "border-box",
				fontFamily: "Inter, sans-serif",
				border: "2px solid #2d3035",
			}}
		>
			{/* Top row: category badge */}
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
				<div style={{ flex: 1 }}>
					<p style={{ fontSize: 22, fontWeight: 700, color: "white", lineHeight: 1.15, margin: "0 0 4px 0" }}>{item.name}</p>
					<p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: 0 }}>{item.brand}</p>
				</div>
				<span style={{ ...smallTag, marginLeft: 8, marginTop: 2 }}>{item.category}</span>
			</div>

			{/* Thin divider */}
			<div style={{ height: 1, background: "rgba(255,255,255,0.2)" }} />

			{/* Color + size row */}
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<div
						style={{
							width: 11,
							height: 11,
							borderRadius: "50%",
							background: "#b2b2bc",
							border: "1.5px solid rgba(255,255,255,0.65)",
							flexShrink: 0,
						}}
					/>
					<span style={{ fontSize: 13, color: "white", fontWeight: 500 }}>{item.color}</span>
				</div>
				<span style={pill}>
					{item.size} · {item.sizeSystem}
				</span>
			</div>

			{/* Composition — editorial style with % labels above bar */}
			<div>
				<SectionTitle label="Composition" />
				<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
					{item.material.map((m) => (
						<span
							key={m.name}
							style={{
								fontSize: 11,
								fontWeight: 600,
								color: m.color === "#4ab6f5" ? "#4ab6f5" : "rgba(255,255,255,0.6)",
							}}
						>
							{m.pct}%
						</span>
					))}
				</div>
				<div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 10 }}>
					{item.material.map((m) => (
						<div key={m.name} style={{ flex: m.pct, background: m.color }} />
					))}
				</div>
				<div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
					{item.material.map((m) => (
						<span key={m.name} style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
							{m.name}
						</span>
					))}
				</div>
			</div>

			{/* Care — compact inline tags */}
			<div>
				<SectionTitle label="Care" />
				<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
					{item.care.map((c) => (
						<span key={c.label} style={smallTag}>
							{c.emoji} {c.label}
						</span>
					))}
				</div>
			</div>

			{/* Expanded — editorial prose style */}
			<AnimatePresence>
				{expanded && (
					<motion.div
						key="expanded"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.28, ease: "easeInOut" }}
						style={{ overflow: "hidden" }}
					>
						<div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
							<div>
								<SectionTitle label="Identity" />
								<p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 2, margin: 0 }}>
									{item.season} · {item.year} · {item.price}
									<br />
									{item.retailer} · {item.condition} · {item.howAcquired}
								</p>
							</div>

							<div>
								<SectionTitle label="Sizing" />
								<p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 2, margin: 0 }}>
									{item.size} ({item.sizeSystem}) · {item.fitType}
								</p>
							</div>

							<div>
								<SectionTitle label="Style" />
								<p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 2, margin: 0 }}>
									{item.neckline} · {item.sleeve}
									<br />
									{item.silhouette} · {item.closure} · {item.texture}
								</p>
							</div>

							<div>
								<SectionTitle label="Occasion" />
								<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
									{item.occasion.map((o) => (
										<span key={o} style={pill}>
											{o}
										</span>
									))}
								</div>
							</div>

							{item.notes && (
								<div>
									<SectionTitle label="Notes" />
									<p
										style={{
											fontSize: 11,
											color: "rgba(255,255,255,0.8)",
											lineHeight: 1.65,
											margin: 0,
											fontStyle: "italic",
										}}
									>
										"{item.notes}"
									</p>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{!expanded && <div style={{ flex: 1 }} />}

			{confirming ? (
				<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<p style={{ margin: 0, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
						Remove this item?
					</p>
					<div style={{ display: "flex", gap: 8 }}>
						<button
							onClick={() => setConfirming(false)}
							style={{
								flex: 1,
								padding: "9px 12px",
								borderRadius: 8,
								border: "1px solid rgba(255,255,255,0.4)",
								background: "transparent",
								color: "rgba(255,255,255,0.75)",
								fontSize: 12,
								fontWeight: 500,
								cursor: "pointer",
								fontFamily: "Inter, sans-serif",
							}}
						>
							Cancel
						</button>
						<button
							onClick={() => {
								setConfirming(false);
								onRemove?.();
							}}
							style={{
								flex: 1,
								padding: "9px 12px",
								borderRadius: 8,
								border: "1.5px solid rgba(255,80,80,0.7)",
								background: "rgba(255,60,60,0.2)",
								color: "rgba(255,160,160,1)",
								fontSize: 12,
								fontWeight: 700,
								cursor: "pointer",
								fontFamily: "Inter, sans-serif",
							}}
						>
							Yes, remove
						</button>
					</div>
				</div>
			) : (
				<div style={{ display: "flex", gap: 8 }}>
					<button
						onClick={() => setConfirming(true)}
						style={{
							flex: 1,
							padding: "9px 12px",
							borderRadius: 8,
							border: "1.5px solid rgba(255,110,110,0.55)",
							background: "rgba(255,80,80,0.1)",
							color: "rgba(255,170,170,1)",
							fontSize: 12,
							fontWeight: 600,
							cursor: "pointer",
							fontFamily: "Inter, sans-serif",
						}}
					>
						Remove
					</button>
					<button
						onClick={onEdit}
						style={{
							flex: 1,
							padding: "9px 12px",
							borderRadius: 8,
							border: "1.5px solid rgba(255,255,255,0.65)",
							background: "rgba(255,255,255,0.12)",
							color: "white",
							fontSize: 12,
							fontWeight: 600,
							cursor: "pointer",
							fontFamily: "Inter, sans-serif",
						}}
					>
						Edit
					</button>
				</div>
			)}

			<button
				onClick={() => setExpanded(!expanded)}
				style={{
					width: "100%",
					padding: "12px 16px",
					borderRadius: 8,
					border: "1.5px solid rgba(255,255,255,0.9)",
					background: "transparent",
					color: "white",
					fontSize: 14,
					fontWeight: 600,
					cursor: "pointer",
					fontFamily: "Inter, sans-serif",
				}}
			>
				{expanded ? "Show less" : "See all details"}
			</button>
		</div>
	);
};
