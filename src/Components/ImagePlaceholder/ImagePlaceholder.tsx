interface ImagePlaceholderProps {
	color?: string;
	size?: number | string;
}

export function ImagePlaceholder({ color = "rgba(255,255,255,0.3)", size }: ImagePlaceholderProps) {
	const dimension = typeof size === "number" ? `${size}px` : size;

	return (
		<div className="product-card-image product-card-placeholder" style={dimension ? { width: dimension, height: dimension } : undefined}>
			<svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="No image available" width="100%" height="100%">
				<rect width="60" height="60" rx="6" fill="rgba(255,255,255,0.08)" />
				<path
					d="M20 40V22a2 2 0 012-2h16a2 2 0 012 2v18M18 40h24M24 20v-2a6 6 0 0112 0v2"
					stroke={color}
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>
	);
}
