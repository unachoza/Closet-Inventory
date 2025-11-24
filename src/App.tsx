import { useState } from "react";
import Carousel from "./Features/Carousel/Carousel";
import MultiStepForm from "./Features/Form/Form";
import Header from "./Components/Header";
import Closet from "./Features/Closet/Closet";
import { CategoryType, ViewType } from "./utils/types";
import { ToastProvider } from "./Components/Toast/Toast";
import "./App.css";

function App() {
	const [view, setView] = useState<ViewType>("carousel");
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);

	return (
		<div className="main">
			<ToastProvider>
				<Header />
				{/* Controls */}
				<div className="view-buttons">
					<button onClick={() => setView("form")}>Add Item</button>
					<button onClick={() => setView("carousel")}>View All Items</button>
					<button onClick={() => setView("travel")}>Pack A Bag</button>
				</div>
				{view === "form" && <MultiStepForm setView={setView} />}
				{view === "carousel" && <Carousel setCategory={setSelectedCategory} />}
				{view === "carousel" && <Closet selectedCategory={selectedCategory} />}
				<button className="back-button" onClick={() => setView("overview")}>
					Back to Carousel
				</button>
			</ToastProvider>
		</div>
	);
}

export default App;
