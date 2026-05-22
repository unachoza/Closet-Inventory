import { useState } from "react";
import Carousel from "./Features/Carousel/Carousel";
import MultiStepForm from "./Features/Form/Form";
import Header from "./Components/Header";
import Closet from "./Features/Closet/Closet";
import { CategoryType, ViewType, ClothingItem } from "./utils/types";
import { ToastProvider } from "./Components/Toast/Toast";
import "./App.css";
import { E } from "vitest/dist/chunks/reporters.d.CqBhtcTq.js";
import EditItemView from "./Features/Form/EditItemView/EditItemView";

function App() {
	const [view, setView] = useState<ViewType>("carousel");
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
	const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

	return (
		<div className="main">
			<ToastProvider>
				<Header />
				{/* Controls */}
				<div className="button-container">
					<button onClick={() => setView("form")}>Add Item</button>
					<button onClick={() => setView("overview")}>View All Items</button>
				</div>
				{view === "form" && <MultiStepForm setView={setView} />}
				       {view === "carousel" && (
					       <div data-testid="carousel">
						       <Carousel setCategory={setSelectedCategory} />
					       </div>
				       )}
				       {view === "carousel" && (
					       <div data-testid="closet-container">
						       <Closet selectedCategory={selectedCategory} onEditItem={(item: ClothingItem) => { setSelectedItem(item); setView("edit"); }} />
					       </div>
				       )}
				       {view === "edit" && selectedItem && <EditItemView item={selectedItem} />}
				<button className="back-button" onClick={() => setView("carousel")}>
					Back to Carousel
				</button>
			</ToastProvider>
		</div>
	);
}

export default App;
