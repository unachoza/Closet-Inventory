import "../../Features/FabricCare/TextileGuide.css";

const FiberFlowchart = () => {
	return (
		<div className="flowchart-wrap">
			<svg viewBox="0 0 860 520" xmlns="http://www.w3.org/2000/svg" width="100%">
				<defs>
					<marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
						<path
							d="M2 1L8 5L2 9"
							fill="none"
							stroke="context-stroke"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</marker>
				</defs>
				{/* Level 1: Sources */}
				<rect x="30" y="20" width="180" height="52" rx="8" fill="#EEF4EF" stroke="#5A7A60" strokeWidth="1" />
				<text x="120" y="42" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="600" fill="#3D5E42">
					🐑 Natural Animal
				</text>
				<text x="120" y="60" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="11" fill="#5A7A60">
					Wool, Silk, Cashmere…
				</text>
				<rect x="340" y="20" width="180" height="52" rx="8" fill="#EEF4EF" stroke="#5A7A60" strokeWidth="1" />
				<text x="430" y="42" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="600" fill="#3D5E42">
					🌿 Natural Plant
				</text>
				<text x="430" y="60" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="11" fill="#5A7A60">
					Cotton, Linen, Hemp…
				</text>
				<rect x="650" y="20" width="180" height="52" rx="8" fill="#F6EFF4" stroke="#8B5A7A" strokeWidth="1" />
				<text x="740" y="42" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="600" fill="#6B3D60">
					⚗️ Petroleum
				</text>
				<text x="740" y="60" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="11" fill="#8B5A7A">
					Polyester, Nylon…
				</text>
				{/* Level 2: Processing */}
				<rect x="30" y="130" width="180" height="52" rx="8" fill="#FBF0E8" stroke="#C1622A" strokeWidth="1" />
				<text x="120" y="150" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="600" fill="#9A4B20">
					Shear / Reel / Card
				</text>
				<text x="120" y="166" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#C1622A">
					Wash, sort, degum fibers
				</text>
				<rect x="340" y="130" width="180" height="52" rx="8" fill="#FBF0E8" stroke="#C1622A" strokeWidth="1" />
				<text x="430" y="150" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="600" fill="#9A4B20">
					Harvest & Ret
				</text>
				<text x="430" y="166" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#C1622A">
					Gin (cotton) or water-ret (linen)
				</text>
				<rect x="490" y="130" width="150" height="52" rx="8" fill="#EEF3F8" stroke="#4A6B8A" strokeWidth="1" />
				<text x="565" y="150" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="600" fill="#3A5570">
					Wood Pulp Dissolve
				</text>
				<text x="565" y="166" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#4A6B8A">
					Eucalyptus/Beech/Bamboo
				</text>
				<rect x="650" y="130" width="180" height="52" rx="8" fill="#F6EFF4" stroke="#8B5A7A" strokeWidth="1" />
				<text x="740" y="150" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="600" fill="#6B3D60">
					Polymerization
				</text>
				<text x="740" y="166" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#8B5A7A">
					Chemical synthesis of polymer
				</text>
				{/* Level 3: Spinning */}
				<rect x="185" y="250" width="200" height="52" rx="8" fill="#FDF4DC" stroke="#B8860B" strokeWidth="1" />
				<text x="285" y="270" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="600" fill="#8A6200">
					Spinning into Yarn
				</text>
				<text x="285" y="286" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#B8860B">
					Ring, rotor, or mule spinning
				</text>
				<rect x="475" y="250" width="200" height="52" rx="8" fill="#FDF4DC" stroke="#B8860B" strokeWidth="1" />
				<text x="575" y="270" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="12" fontWeight="600" fill="#8A6200">
					Melt / Solution Spinning
				</text>
				<text x="575" y="286" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#B8860B">
					Extruded through spinneret
				</text>
				{/* Level 4: Weaving */}
				<rect x="300" y="360" width="260" height="52" rx="8" fill="#EEF4EF" stroke="#5A7A60" strokeWidth="1" />
				<text x="430" y="380" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="600" fill="#3D5E42">
					Weaving / Knitting
				</text>
				<text x="430" y="396" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#5A7A60">
					Loom (woven) or needles/machine (knit)
				</text>
				{/* Level 5: Finishing */}
				<rect x="300" y="452" width="260" height="52" rx="8" fill="#1C1A17" stroke="#1C1A17" strokeWidth="1" />
				<text x="430" y="472" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="13" fontWeight="600" fill="#FAF7F2">
					Finishing & Garment
				</text>
				<text x="430" y="488" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#C4BFB5">
					Dyeing → cutting → sewing → press
				</text>
				{/* Arrows */}
				<line x1="120" y1="72" x2="120" y2="128" stroke="#5A7A60" strokeWidth="1.5" markerEnd="url(#arr)" />
				<line x1="430" y1="72" x2="430" y2="128" stroke="#5A7A60" strokeWidth="1.5" markerEnd="url(#arr)" />
				<line x1="740" y1="72" x2="740" y2="128" stroke="#8B5A7A" strokeWidth="1.5" markerEnd="url(#arr)" />
				<line x1="180" y1="156" x2="260" y2="250" stroke="#C1622A" strokeWidth="1.5" markerEnd="url(#arr)" />
				<line x1="380" y1="182" x2="340" y2="250" stroke="#C1622A" strokeWidth="1.5" markerEnd="url(#arr)" />
				<line x1="565" y1="182" x2="575" y2="250" stroke="#4A6B8A" strokeWidth="1.5" markerEnd="url(#arr)" />
				<line x1="700" y1="182" x2="650" y2="250" stroke="#8B5A7A" strokeWidth="1.5" markerEnd="url(#arr)" />
				<line x1="285" y1="302" x2="380" y2="358" stroke="#B8860B" strokeWidth="1.5" markerEnd="url(#arr)" />
				<line x1="575" y1="302" x2="480" y2="358" stroke="#B8860B" strokeWidth="1.5" markerEnd="url(#arr)" />
				<line x1="430" y1="412" x2="430" y2="450" stroke="#1C1A17" strokeWidth="1.5" markerEnd="url(#arr)" />
			</svg>
		</div>
	);
};
export default FiberFlowchart;