import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import ClosetCarousel from "./Features/Carousel/Carousel";
import ClosetInventoryApp from "./Features/Carousel/Carousel2";
import MultiStepForm from "./Features/Form/Form";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);
	const [view, setView] = useState<"carousel" | "form" | "overview">("carousel");

	return (
		<>
			<div>
				<a href="https://vite.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
			</div>
			{/* <ClosetCarousel /> */}
			{/* Controls */}
			<div className="mt-4">
				<button onClick={() => setView("form")}>Add Item</button>
				<button className="ml-2" onClick={() => setView("carousel")}>
					View All Items
				</button>
			</div>
			{view === "form" && <MultiStepForm />}
			{/* {view === "carousel" && <ClosetCarousel />} */}
			{view === "carousel" && <ClosetInventoryApp />}
		</>
	);
}

export default App;

// {clothingItems.map((item: any) => (
// 						<Card key={item.id} className="bg-black/30 text-white">
// 							<CardContent>
// 								<p>Type: {item.type}</p>
// 								<p>Color: {item.color}</p>
// 								<p>Size: {item.size}</p>
// 								<p>Brand: {item.brand}</p>
// 								<p>Material: {item.material}</p>
// 								<p>Occasion: {item.occasion}</p>
// 								<p>Age: {item.age}</p>
// 								<p>Care Instructions: {item.care}</p>
// 							</CardContent>
// 						</Card>
// 					))}
