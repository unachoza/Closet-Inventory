import { useState } from "react";
import Carousel from "./Features/Carousel/Carousel2";
import MultiStepForm from "./Features/Form/Form";
import Header from "./Components/Header";
import Closet from "./Features/Closet/Closet";
import { CategoryType, ViewType } from "./utils/types";
import "./App.css";

function App() {
	const [view, setView] = useState<ViewType>("carousel");
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
	console.log({ selectedCategory });
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
			{view === "carousel" && <Carousel setCategory={setSelectedCategory} />}
			{view === "carousel" && <Closet selectedCategory={selectedCategory} />}
			<button className="back-button" onClick={() => setView("overview")}>
				Back to Carousel
			</button>
		</div>
	);
}

export default App;
