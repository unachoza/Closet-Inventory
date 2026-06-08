import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Card from "../../../Components/ClothesCard/Card/Card";
import Fuse from "fuse.js";
import { useLocalStorageCloset } from "../../../hooks/useLocalCloset";

const SearchBar = () => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const { closet } = useLocalStorageCloset();

	// Memoized Filtering & Sorting
	const filteredAndSortedItems = useMemo(() => {
		let result = closet;

		// 1. Fuzzy Search
		if (searchQuery.trim()) {
			const fuse = new Fuse(result, {
				keys: ["name", "brand", "category", "color", "notes", "material"],
				threshold: 0.3,
			});
			result = fuse.search(searchQuery).map((res) => res.item);
		}

		// 2. Filters
		//     result = result.filter(item => {
		//       // For each filter group, if it has selections, the item MUST match at least one
		//       for (const [group, selections] of Object.entries(selectedFilters)) {
		//         if (selections.length > 0) {
		//           const itemValue = item[group as keyof typeof item] as string;
		//           if (!selections.includes(itemValue)) {
		//             return false;
		//           }
		//         }
		//       }
		//       return true;
		//     });

		// 3. Sorting
		const sortedResult = [...result];
		//     sortedResult.sort((a, b) => {
		//       switch (sortOption) {
		//         case 'price-asc': return a.price - b.price;
		//         case 'price-desc': return b.price - a.price;
		//         case 'age-asc': return a.age - b.age;
		//         case 'age-desc': return b.age - a.age;
		//         case 'date-asc': return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
		//         case 'date-desc':
		//         default:
		//           return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
		//       }
		//     });

		return sortedResult;
	}, [searchQuery]);

	return (
		<div>
			<div className="search-container">
				<Search size={18} className="search-icon" />
				<input
					type="text"
					placeholder="Search items, brands, colors..."
					className="search-input"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
			</div>
			<span className="results-count">
				Showing <strong>{filteredAndSortedItems.length}</strong> items out of {closet.length} closet items
			</span>
			<div className="items-grid">
				{filteredAndSortedItems.map((item) => (
					// activeFilters={selectedFilters} sortOption={sortOption}
					<Card key={item.id} item={item} />
				))}
				{filteredAndSortedItems.length === 0 && (
					<div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px 0", color: "var(--text-secondary)" }}>
						No items match your criteria. Try adjusting your filters or search.
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchBar;
