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
	//@ts-ignore
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);

	return (
		<div className="main">
			<ToastProvider>
				<Header />
				{/* Controls */}
				<div className="mt-4">
					<button onClick={() => setView("form")}>Add Item</button>
					<button className="ml-2" onClick={() => setView("carousel")}>
						View All Items
					</button>
				</div>
				{view === "form" && <MultiStepForm setView={setView} />}
				{view === "carousel" && (
					<div data-testid="carousel">
						<Carousel setCategory={setSelectedCategory} />
					</div>
				)}
				{view === "carousel" && (
					<div data-testid="closet-container">
						<Closet selectedCategory={selectedCategory} />
					</div>
				)}
				<button className="back-button" onClick={() => setView("overview")}>
					Back to Carousel
				</button>
			</ToastProvider>
		</div>
	);
}

export default App;
