import "../EntireCloset.css";

interface FilterMatchPillsProps {
	matchKeys: string[];
}

const FIELD_LABELS: Record<string, string> = {
	name: "name",
	brand: "brand",
	category: "category",
	color: "color",
	material: "material",
	occasion: "occasion",
	notes: "notes",
};

const FilterMatchPills = ({ matchKeys }: FilterMatchPillsProps) => {
	if (matchKeys.length === 0) return null;

	const unique = Array.from(new Set(matchKeys));

	return (
		<div className="filter-match-pills" aria-label="Search matched fields">
			{unique.map((key) => (
				<span key={key} className="filter-match-pill">
					{FIELD_LABELS[key] ?? key}
				</span>
			))}
		</div>
	);
};

export default FilterMatchPills;
