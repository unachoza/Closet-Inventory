import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Carousel from "./Features/Carousel/Carousel";
import MultiStepForm from "./Features/Form/Form";
import Header from "./Components/Header";
import Closet from "./Features/Closet/Closet";
import { CategoryType, ViewType } from "./utils/types";
import "./App.css";

function App() {
	const [view, setView] = useState<ViewType>("carousel");
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
	const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

	return (
		<div>
			<Header />
			{/* Controls */}
			<div className="controlls">
				<button onClick={() => setIsFormOpen(true)}>Add Item</button>
				<button className="" onClick={() => setView("carousel")}>
					View All Items
				</button>
			</div>
			{/* Dialog for Form */}
			<Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
				<Dialog.Portal>
					<Dialog.Overlay className="dialog-overlay" />
					<Dialog.Content className="dialog-content">
						<MultiStepForm setView={setView} onClose={() => setItFormOpen(false)} />
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
			{view === "carousel" && <Carousel setCategory={setSelectedCategory} />}
			{view === "carousel" && <Closet selectedCategory={selectedCategory} />}
			<button className="back-button" onClick={() => setView("overview")}>
				Back to Carousel
			</button>
		</div>
	);
}

export default App;
