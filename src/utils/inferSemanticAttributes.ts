export function inferSemanticAttributes(text: string, item: any) {
	const lower = text.toLowerCase();
	console.log({item})
	const result: any = {};

	// blazer → care override
	if (/\bblazer\b/i.test(lower)) {
		result.care = "dry clean only";
	}

	// contour → bodycon style + going-out occasion
	if (/\bcontour\b/i.test(lower)) {
		result.style = "bodycon";
		result.occasion = "going-out";
	}

	return result;
}
