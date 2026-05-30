import { WEAVE_TYPES } from "../../Content/Fabric&Fiber";
import "../../Features/FabricCare/TextileGuide.css";

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

	if (weaveId === "jacquard") {
		return (
			<svg viewBox="0 0 280 260" xmlns="http://www.w3.org/2000/svg" width="100%">
				<rect width="280" height="260" fill="#FAF7F2" />
				<text x="140" y="22" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="12" fill="#6B6659" font-weight="500">
					Jacquard — Individual warp control
				</text>
				{/* // <!-- Loom representation --> */}
				<g transform="translate(20,36)">
					{/* <!-- Simplified jacquard pattern grid - intricate motif --> */}
					<rect x="0" y="0" width="240" height="150" rx="6" fill="#EEF4EF" />
					{/* <!-- Stylized floral/geometric motif using colored cells --> */}
					{/* <!-- Background rows - plain weave base --> */}
					<g opacity=".3">
						<rect x="5" y="5" width="18" height="18" rx="2" fill="#1C1A17" />
						<rect x="27" y="5" width="18" height="18" rx="2" fill="#E8C85A" />
						<rect x="49" y="5" width="18" height="18" rx="2" fill="#1C1A17" />
					</g>
					{/* <!-- Motif center - diamond --> */}
					<rect x="90" y="30" width="60" height="18" rx="3" fill="#5A7A60" opacity=".8" />
					<rect x="72" y="50" width="96" height="18" rx="3" fill="#5A7A60" opacity=".8" />
					<rect x="58" y="70" width="124" height="18" rx="3" fill="#5A7A60" opacity=".9" />
					<rect x="72" y="90" width="96" height="18" rx="3" fill="#5A7A60" opacity=".8" />
					<rect x="90" y="110" width="60" height="18" rx="3" fill="#5A7A60" opacity=".8" />
					{/* <!-- Center highlight --> */}
					<rect x="108" y="62" width="24" height="26" rx="4" fill="#B8860B" opacity=".9" />
					{/* <!-- Corner accent --> */}
					<rect x="5" y="28" width="50" height="26" rx="3" fill="#C1622A" opacity=".5" />
					<rect x="185" y="28" width="50" height="26" rx="3" fill="#C1622A" opacity=".5" />
					<rect x="5" y="88" width="50" height="26" rx="3" fill="#C1622A" opacity=".5" />
					<rect x="185" y="88" width="50" height="26" rx="3" fill="#C1622A" opacity=".5" />
					{/* <!-- Label --> */}
					<text x="120" y="138" font-family="DM Sans, sans-serif" font-size="10" fill="#6B6659" text-anchor="middle">
						Each column controlled individually
					</text>
					{/* <!-- Loom illustration below --> */}
					<rect x="0" y="158" width="240" height="3" rx="1" fill="#1C1A17" opacity=".2" />
					<text x="0" y="178" font-family="DM Sans, sans-serif" font-size="11" fill="#5A7A60">
						▸ Invented by Joseph Marie Jacquard, 1804
					</text>
					<text x="0" y="194" font-family="DM Sans, sans-serif" font-size="11" fill="#6B6659">
						▸ Inspired Babbage's punch-card computing
					</text>
				</g>
			</svg>
		);
	}
	if (weaveId === "knit") {
		return (
			<svg viewBox="0 0 280 260" xmlns="http://www.w3.org/2000/svg" width="100%">
				<rect width="280" height="260" fill="#FAF7F2" />
				<text x="140" y="22" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="12" fill="#6B6659" font-weight="500">
					Knit — Interlocking loops
				</text>
				<g transform="translate(20,36)">
					{/* <!-- Jersey stitch representation using arcs --> */}
					{/* <!-- Row 1 loops --> */}
					<path d="M10,60 Q10,30 30,30 Q50,30 50,60" fill="none" stroke="#4A6B8A" stroke-width="3" stroke-linecap="round" />
					<path d="M50,60 Q50,30 70,30 Q90,30 90,60" fill="none" stroke="#4A6B8A" stroke-width="3" stroke-linecap="round" />
					<path d="M90,60 Q90,30 110,30 Q130,30 130,60" fill="none" stroke="#4A6B8A" stroke-width="3" stroke-linecap="round" />
					<path d="M130,60 Q130,30 150,30 Q170,30 170,60" fill="none" stroke="#4A6B8A" stroke-width="3" stroke-linecap="round" />
					<path d="M170,60 Q170,30 190,30 Q210,30 210,60" fill="none" stroke="#4A6B8A" stroke-width="3" stroke-linecap="round" />
					<path d="M210,60 Q210,30 230,30 Q250,30 250,60" fill="none" stroke="#4A6B8A" stroke-width="3" stroke-linecap="round" />
					{/* <!-- Row 2 loops (offset, interlocking) --> */}
					<path d="M30,100 Q30,70 50,70 Q70,70 70,100" fill="none" stroke="#C1622A" stroke-width="3" stroke-linecap="round" />
					<path d="M70,100 Q70,70 90,70 Q110,70 110,100" fill="none" stroke="#C1622A" stroke-width="3" stroke-linecap="round" />
					<path
						d="M110,100 Q110,70 130,70 Q150,70 150,100"
						fill="none"
						stroke="#C1622A"
						stroke-width="3"
						stroke-linecap="round"
					/>
					<path
						d="M150,100 Q150,70 170,70 Q190,70 190,100"
						fill="none"
						stroke="#C1622A"
						stroke-width="3"
						stroke-linecap="round"
					/>
					<path
						d="M190,100 Q190,70 210,70 Q230,70 230,100"
						fill="none"
						stroke="#C1622A"
						stroke-width="3"
						stroke-linecap="round"
					/>
					{/* <!-- Row 3 --> */}
					<path d="M10,140 Q10,110 30,110 Q50,110 50,140" fill="none" stroke="#4A6B8A" stroke-width="3" stroke-linecap="round" />
					<path d="M50,140 Q50,110 70,110 Q90,110 90,140" fill="none" stroke="#4A6B8A" stroke-width="3" stroke-linecap="round" />
					<path
						d="M90,140 Q90,110 110,110 Q130,110 130,140"
						fill="none"
						stroke="#4A6B8A"
						stroke-width="3"
						stroke-linecap="round"
					/>
					<path
						d="M130,140 Q130,110 150,110 Q170,110 170,140"
						fill="none"
						stroke="#4A6B8A"
						stroke-width="3"
						stroke-linecap="round"
					/>
					<path
						d="M170,140 Q170,110 190,110 Q210,110 210,140"
						fill="none"
						stroke="#4A6B8A"
						stroke-width="3"
						stroke-linecap="round"
					/>
					<path
						d="M210,140 Q210,110 230,110 Q250,110 250,140"
						fill="none"
						stroke="#4A6B8A"
						stroke-width="3"
						stroke-linecap="round"
					/>
					{/* <!-- Note --> */}
					<text x="0" y="168" font-family="DM Sans, sans-serif" font-size="10" fill="#6B6659">
						▸ Not technically woven — loops interlock
					</text>
					<text x="0" y="182" font-family="DM Sans, sans-serif" font-size="10" fill="#6B6659">
						▸ Weft knit: horizontal; Warp knit: vertical
					</text>
					<text x="0" y="196" font-family="DM Sans, sans-serif" font-size="10" fill="#5A7A60">
						▸ Naturally stretches in all directions
					</text>
				</g>
			</svg>
		);
	}
	if (weaveId === "dobby") {
		return (
			<svg viewBox="0 0 280 260" xmlns="http://www.w3.org/2000/svg" width="100%">
				<rect width="280" height="260" fill="#FAF7F2" />
				<text x="140" y="22" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="12" fill="#6B6659" font-weight="500">
					Dobby — Small geometric repeats
				</text>
				<g transform="translate(20,36)">
					{/* <!-- Diamond dobby pattern --> */}
					{/* <!-- Simplified geometric repeat --> */}
					<rect x="0" y="0" width="240" height="155" rx="4" fill="#FBF0E8" />
					{/* <!-- Pattern cells: diamond repeat --> */}
					{/* <!-- Row 0 --> */}
					<rect x="10" y="8" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<rect x="50" y="8" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					<rect x="90" y="8" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<rect x="130" y="8" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					<rect x="170" y="8" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<rect x="210" y="8" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					{/* <!-- Row 1 --> */}
					<rect x="10" y="44" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					<rect x="50" y="44" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<rect x="90" y="44" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					<rect x="130" y="44" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<rect x="170" y="44" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					<rect x="210" y="44" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					{/* <!-- Row 2 --> */}
					<rect x="10" y="80" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<rect x="50" y="80" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					<rect x="90" y="80" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<rect x="130" y="80" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					<rect x="170" y="80" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<rect x="210" y="80" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					{/* <!-- Row 3 --> */}
					<rect x="10" y="116" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					<rect x="50" y="116" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<rect x="90" y="116" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					<rect x="130" y="116" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<rect x="170" y="116" width="28" height="28" rx="3" fill="#C1622A" opacity=".7" />
					<rect x="210" y="116" width="28" height="28" rx="3" fill="#C1622A" opacity=".15" />
					<text x="120" y="150" font-family="DM Sans, sans-serif" font-size="10" fill="#6B6659" text-anchor="middle">
						Checkerboard / diamond repeat pattern
					</text>
					<text x="0" y="175" font-family="DM Sans, sans-serif" font-size="11" fill="#5A7A60">
						▸ Uses a dobby attachment on a standard loom
					</text>
					<text x="0" y="192" font-family="DM Sans, sans-serif" font-size="11" fill="#6B6659">
						▸ More complex than plain, simpler than Jacquard
					</text>
				</g>
			</svg>
		);
	}
	if (weaveId === "pile") {
		return (
			<svg viewBox="0 0 280 260" xmlns="http://www.w3.org/2000/svg" width="100%">
				<rect width="280" height="260" fill="#FAF7F2" />
				<text x="140" y="22" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="12" fill="#6B6659" font-weight="500">
					Pile Weave — Loops and cut loops
				</text>
				<g transform="translate(20,40)">
					{/* <!-- Ground fabric --> */}
					<rect x="0" y="120" width="240" height="28" rx="3" fill="#1C1A17" opacity=".2" />
					<text x="120" y="138" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="10" fill="#6B6659">
						Ground fabric (base weave)
					</text>
					{/* <!-- Loop pile (left half) --> */}
					<text
						x="30"
						y="15"
						text-anchor="middle"
						font-family="DM Sans, sans-serif"
						font-size="11"
						fill="#4A6B8A"
						font-weight="500"
					>
						Loop pile
					</text>
					<text x="30" y="27" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="9" fill="#6B6659">
						(Terry cloth)
					</text>
					{/* <!-- U-shape loops --> */}
					<path d="M10,120 Q10,90 22,90 Q34,90 34,120" fill="none" stroke="#4A6B8A" stroke-width="2.5" stroke-linecap="round" />
					<path d="M34,120 Q34,80 46,80 Q58,80 58,120" fill="none" stroke="#4A6B8A" stroke-width="2.5" stroke-linecap="round" />
					<path
						d="M10,120 Q10,60 22,60 Q34,60 34,120"
						fill="none"
						stroke="#4A6B8A"
						stroke-width="2"
						stroke-linecap="round"
						opacity=".5"
					/>
					{/* <!-- Cut pile (right half) --> */}
					<text
						x="170"
						y="15"
						text-anchor="middle"
						font-family="DM Sans, sans-serif"
						font-size="11"
						fill="#C1622A"
						font-weight="500"
					>
						Cut pile
					</text>
					<text x="170" y="27" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="9" fill="#6B6659">
						(Velvet)
					</text>
					{/* <!-- Individual cut tufts --> */}
					<line x1="135" y1="120" x2="135" y2="70" stroke="#C1622A" stroke-width="2" stroke-linecap="round" />
					<line x1="148" y1="120" x2="148" y2="55" stroke="#C1622A" stroke-width="2" stroke-linecap="round" />
					<line x1="161" y1="120" x2="161" y2="65" stroke="#C1622A" stroke-width="2" stroke-linecap="round" />
					<line x1="174" y1="120" x2="174" y2="50" stroke="#C1622A" stroke-width="2" stroke-linecap="round" />
					<line x1="187" y1="120" x2="187" y2="62" stroke="#C1622A" stroke-width="2" stroke-linecap="round" />
					<line x1="200" y1="120" x2="200" y2="55" stroke="#C1622A" stroke-width="2" stroke-linecap="round" />
					<line x1="213" y1="120" x2="213" y2="68" stroke="#C1622A" stroke-width="2" stroke-linecap="round" />
					{/* <!-- Divider --> */}
					<line x1="118" y1="35" x2="118" y2="120" stroke="#C4BFB5" stroke-width="1" stroke-dasharray="4 3" />
					{/* <!-- Notes --> */}
					<text x="0" y="170" font-family="DM Sans, sans-serif" font-size="10" fill="#4A6B8A">
						Loop pile: uncut → terry, toweling
					</text>
					<text x="0" y="185" font-family="DM Sans, sans-serif" font-size="10" fill="#C1622A">
						Cut pile: clipped → velvet, velour, corduroy
					</text>
				</g>
			</svg>
		);
	}
	if (weaveId === "leno") {
		return (
			<svg viewBox="0 0 280 260" xmlns="http://www.w3.org/2000/svg" width="100%">
				<rect width="280" height="260" fill="#FAF7F2" />
				<text x="140" y="22" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="12" fill="#6B6659" font-weight="500">
					Leno — Twisted warp open mesh
				</text>
				<g transform="translate(20,40)">
					{/* <!-- Open mesh structure --> */}
					{/* <!-- Horizontal weft threads --> */}
					<line x1="0" y1="30" x2="240" y2="30" stroke="#4A6B8A" stroke-width="2" stroke-linecap="round" />
					<line x1="0" y1="65" x2="240" y2="65" stroke="#4A6B8A" stroke-width="2" stroke-linecap="round" />
					<line x1="0" y1="100" x2="240" y2="100" stroke="#4A6B8A" stroke-width="2" stroke-linecap="round" />
					<line x1="0" y1="135" x2="240" y2="135" stroke="#4A6B8A" stroke-width="2" stroke-linecap="round" />
					{/* <!-- Twisted warp pairs (crossing) --> */}
					{/* <!-- Pair 1 --> */}
					<path
						d="M20,0 Q24,17 20,30 Q16,47 20,65 Q24,82 20,100 Q16,117 20,135 Q24,152 20,165"
						fill="none"
						stroke="#C1622A"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<path
						d="M30,0 Q26,17 30,30 Q34,47 30,65 Q26,82 30,100 Q34,117 30,135 Q26,152 30,165"
						fill="none"
						stroke="#C1622A"
						stroke-width="2"
						stroke-linecap="round"
					/>
					{/* <!-- Pair 2 --> */}
					<path
						d="M70,0 Q74,17 70,30 Q66,47 70,65 Q74,82 70,100 Q66,117 70,135 Q74,152 70,165"
						fill="none"
						stroke="#C1622A"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<path
						d="M80,0 Q76,17 80,30 Q84,47 80,65 Q76,82 80,100 Q84,117 80,135 Q76,152 80,165"
						fill="none"
						stroke="#C1622A"
						stroke-width="2"
						stroke-linecap="round"
					/>
					{/* <!-- Pair 3 --> */}
					<path
						d="M120,0 Q124,17 120,30 Q116,47 120,65 Q124,82 120,100 Q116,117 120,135 Q124,152 120,165"
						fill="none"
						stroke="#C1622A"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<path
						d="M130,0 Q126,17 130,30 Q134,47 130,65 Q126,82 130,100 Q134,117 130,135 Q126,152 130,165"
						fill="none"
						stroke="#C1622A"
						stroke-width="2"
						stroke-linecap="round"
					/>
					{/* <!-- Pair 4 --> */}
					<path
						d="M170,0 Q174,17 170,30 Q166,47 170,65 Q174,82 170,100 Q166,117 170,135 Q174,152 170,165"
						fill="none"
						stroke="#C1622A"
						stroke-width="2"
						stroke-linecap="round"
					/>
					<path
						d="M180,0 Q176,17 180,30 Q184,47 180,65 Q176,82 180,100 Q184,117 180,135 Q176,152 180,165"
						fill="none"
						stroke="#C1622A"
						stroke-width="2"
						stroke-linecap="round"
					/>
					{/* <!-- Open space indicator --> */}
					<rect
						x="35"
						y="35"
						width="30"
						height="25"
						rx="2"
						fill="none"
						stroke="#B8860B"
						stroke-width="1"
						stroke-dasharray="3 2"
					/>
					<text x="50" y="60" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="8" fill="#B8860B">
						open
					</text>
					{/* <!-- Legend --> */}
					<text x="0" y="185" font-family="DM Sans, sans-serif" font-size="11" fill="#4A6B8A">
						— Weft (horizontal)
					</text>
					<text x="0" y="200" font-family="DM Sans, sans-serif" font-size="11" fill="#C1622A">
						~ Twisted warp pairs
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
