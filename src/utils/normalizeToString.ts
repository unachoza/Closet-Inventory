// Utility function to normalize a value to a string
export function normalizeToString(value: unknown): string {
	if (typeof value === "string") {
		return value;
	}
	if (typeof value === "number") {
		return value.toString();
	}
	if (typeof value === "boolean") {
		return value ? "True" : "False";
	}
	if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
		return value.join(" ");
	}
	return "";
}
