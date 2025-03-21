import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import ClosetCarousel from "./Features/Carousel/Carousel";
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
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			{/* <ClosetCarousel /> */}
			{/* Controls */}
			<div className="mt-4">
				<button onClick={() => setView("form")}>Add Item</button>
				<button className="ml-2" onClick={() => setView("overview")}>
					View All Items
				</button>
			</div>
      form here
			{view === "form" && <MultiStepForm />}
		</>
	);
}

export default App;
