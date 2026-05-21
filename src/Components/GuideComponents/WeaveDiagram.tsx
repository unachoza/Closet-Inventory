import { WEAVE_TYPES } from "../../utils/Content/Fabric&Fiber";

/** Weave diagram SVGs — inline for performance */
function WeaveDiagram({ weaveId }: { weaveId: string }) {
	// Plain weave checkerboard
	if (weaveId === "plain") {
		const rows = [0, 32, 64, 96, 128];
		const cols = [0, 32, 64, 96, 128, 160, 192, 224];
		return (
			<svg viewBox="0 0 280 240" xmlns="http://www.w3.org/2000/svg" width="100%">
				<rect width="280" height="240" fill="#FAF7F2" />
				<text x="140" y="22" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="11" fill="#6B6659" fontWeight="500">
					Plain — over 1 / under 1
				</text>
				<g transform="translate(20,32)">
					{rows.map((ry, ri) =>
						cols.map((cx, ci) => (
							<rect
								key={`${ri}-${ci}`}
								x={cx}
								y={ry}
								width="28"
								height="28"
								rx="3"
								fill={(ri + ci) % 2 === 0 ? "#1C1A17" : "#E8C85A"}
								opacity={(ri + ci) % 2 === 0 ? 0.85 : 0.7}
							/>
						)),
					)}
					<rect x="0" y="178" width="12" height="12" rx="2" fill="#1C1A17" opacity=".85" />
					<text x="18" y="188" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#6B6659">
						Warp (vertical)
					</text>
					<rect x="128" y="178" width="12" height="12" rx="2" fill="#E8C85A" opacity=".8" />
					<text x="146" y="188" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#6B6659">
						Weft (horizontal)
					</text>
				</g>
			</svg>
		);
	}

	// Twill — diagonal offset
	if (weaveId === "twill") {
		// 2/2 twill pattern
		const pattern = [
			[1, 1, 0, 0, 1, 1, 0, 0],
			[0, 1, 1, 0, 0, 1, 1, 0],
			[0, 0, 1, 1, 0, 0, 1, 1],
			[1, 0, 0, 1, 1, 0, 0, 1],
		];
		return (
			<svg viewBox="0 0 280 230" xmlns="http://www.w3.org/2000/svg" width="100%">
				<rect width="280" height="230" fill="#FAF7F2" />
				<text x="140" y="22" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="11" fill="#6B6659" fontWeight="500">
					Twill — diagonal rib pattern
				</text>
				<g transform="translate(20,32)">
					{pattern.map((row, ri) =>
						row.map((cell, ci) => (
							<rect
								key={`${ri}-${ci}`}
								x={ci * 32}
								y={ri * 32}
								width="28"
								height="28"
								rx="3"
								fill={cell === 1 ? "#1C1A17" : "#E8C85A"}
								opacity={cell === 1 ? 0.85 : 0.7}
							/>
						)),
					)}
					<line x1="0" y1="130" x2="256" y2="0" stroke="#B8860B" strokeWidth="1.5" strokeDasharray="6 4" opacity=".5" />
					<rect x="0" y="150" width="12" height="12" rx="2" fill="#1C1A17" opacity=".85" />
					<text x="18" y="160" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#6B6659">
						Warp up
					</text>
					<rect x="90" y="150" width="12" height="12" rx="2" fill="#E8C85A" opacity=".8" />
					<text x="108" y="160" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#6B6659">
						Weft up
					</text>
					<line x1="0" y1="175" x2="36" y2="175" stroke="#B8860B" strokeWidth="1.5" strokeDasharray="4 3" />
					<text x="44" y="179" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#B8860B">
						Diagonal rib
					</text>
				</g>
			</svg>
		);
	}

	// Satin — sparse interlacing
	if (weaveId === "satin") {
		// 5-shaft satin binding points
		const binding = [
			[0, 0],
			[1, 3],
			[2, 1],
			[3, 4],
			[4, 2],
		]; // [row, col]
		return (
			<svg viewBox="0 0 280 230" xmlns="http://www.w3.org/2000/svg" width="100%">
				<rect width="280" height="230" fill="#FAF7F2" />
				<text x="140" y="22" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="11" fill="#6B6659" fontWeight="500">
					Satin — long warp floats
				</text>
				<g transform="translate(20,32)">
					{[0, 1, 2, 3, 4].map((ri) =>
						[0, 1, 2, 3, 4, 5, 6, 7].map((ci) => {
							const isBinding = binding.some(([br, bc]) => br === ri && bc === ci % 5);
							return (
								<rect
									key={`${ri}-${ci}`}
									x={ci * 30}
									y={ri * 28}
									width="26"
									height="24"
									rx="3"
									fill={isBinding ? "#1C1A17" : "#8B5A7A"}
									opacity={isBinding ? 0.85 : 0.55}
								/>
							);
						}),
					)}
					<rect x="30" y="4" width="88" height="18" rx="3" fill="none" stroke="#B8860B" strokeWidth="1.5" strokeDasharray="4 2" />
					<text x="75" y="33" fontFamily="DM Sans, sans-serif" fontSize="9" fill="#B8860B" textAnchor="middle">
						long float
					</text>
					<rect x="0" y="162" width="12" height="12" rx="2" fill="#1C1A17" opacity=".85" />
					<text x="18" y="172" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#6B6659">
						Binding point
					</text>
					<rect x="120" y="162" width="12" height="12" rx="2" fill="#8B5A7A" opacity=".6" />
					<text x="138" y="172" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#6B6659">
						Float
					</text>
				</g>
			</svg>
		);
	}

	// Generic placeholder for other weave types
	const colors: Record<string, string> = {
		jacquard: "#5A7A60",
		knit: "#4A6B8A",
		dobby: "#C1622A",
		pile: "#8B5A7A",
		leno: "#4A6B8A",
	};
	const fill = colors[weaveId] || "#B8860B";

	return (
		<svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" width="100%">
			<rect width="280" height="200" fill="#FAF7F2" />
			<rect x="40" y="40" width="200" height="120" rx="12" fill={fill} opacity=".12" stroke={fill} strokeWidth="1" />
			<text x="140" y="108" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="14" fill={fill} fontWeight="600">
				{WEAVE_TYPES.find((w) => w.id === weaveId)?.name ?? weaveId}
			</text>
		</svg>
	);
}

export default WeaveDiagram;
