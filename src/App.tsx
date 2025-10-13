import { useState } from "react";
import ClosetInventory from "./Features/Carousel/Carousel2";
import MultiStepForm from "./Features/Form/Form";
import Header from "./Components/Header";
import ItemsOverview from "./Components/ItemsOverview";
import Closet from "./Features/Closet/Closet";
import { CategoryType, ViewType } from "./utils/types";
import { MY_CLOSET_DATA } from "./utils/constants";
import "./App.css";

function App() {
	const [view, setView] = useState<ViewType>("carousel");
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);

	return (
		<div>
			<Header />
			{/* Controls */}
			<div className="mt-4">
				<button onClick={() => setView("form")}>Add Item</button>
				<button className="ml-2" onClick={() => setView("carousel")}>
					View All Items
				</button>
			</div>
			{view === "form" && <MultiStepForm />}
			{view === "carousel" && <ClosetInventory />}
			{view === "carousel" && (
				<ItemsOverview clothingItems={MY_CLOSET_DATA} category={selectedCategory} onBack={() => setView("overview")} />
			)}
		</div>
	);
}

export default App;