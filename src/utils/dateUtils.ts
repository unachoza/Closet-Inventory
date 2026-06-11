/** Human-readable absolute date, e.g. "Mar 15, 2024". */
export function toAbsoluteDate(iso?: string): string {
	if (!iso) return "";
	const d = new Date(iso);
	if (isNaN(d.getTime())) return "";
	return d.toLocaleDateString("default", { year: "numeric", month: "short", day: "numeric" });
}
