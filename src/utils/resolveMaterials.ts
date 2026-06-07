export function resolveMaterial(productMaterial: any, emailMaterial: any) {
	return productMaterial && productMaterial.length > 0
		? productMaterial
		: emailMaterial;
}