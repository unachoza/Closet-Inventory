import { useState } from "react";
import Carousel from "./Features/Carousel/Carousel";
import MultiStepForm from "./Features/Form/Form";
import Header from "./Components/Header";
import Closet from "./Features/Closet/Closet";
import { CategoryType, ViewType } from "./utils/types";
import { ToastProvider } from "./Components/Toast/Toast";
import FabricCare from "./Features/FabricCare/FabricCare";
import TextileGuildInteractive from "./Features/FabricCare/TextileGuildInteractive";
import "./App.css";

function App() {
	const [view, setView] = useState<ViewType>("carousel");
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);

	return (
		// <TextileGuildInteractive/>
		<div className="main">
			<ToastProvider>
				<Header />
				{/* Controls */}
				<div className="button-container">
					<button onClick={() => setView("form")}>Add Item</button>
					<button onClick={() => setView("overview")}>View All Items</button>
					<button onClick={() => setView("more")}>More Features</button>
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
				{view === "more" && (
					<div className="more-features">
						<FabricCare care={["Machine wash cold", "Tumble dry low", "Do not bleach"]} />
						{/* Add more feature components here as they are developed */}
					</div>
				)}
				<button className="back-button" onClick={() => setView("carousel")}>
					Back to Carousel
				</button>
			</ToastProvider>
		</div>
	);
}

export default App;
