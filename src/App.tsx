import { useState, useCallback } from "react";
import { EditProvider } from "./Features/Form/EditContext";
import Carousel from "./Features/Carousel/Carousel";
import MultiStepForm from "./Features/Form/Form";
import Header from "./Components/Header";
import Closet from "./Features/Closet/Closet";
import GmailImport from "./Features/GmailImport/GmailImport";
import { CategoryType, ClothingItem, ItemFormData, ViewType } from "./utils/types";
import { ToastProvider } from "./Components/Toast/Toast";
import "./App.css";
import EditItemView from "./Features/Form/EditItemView/EditItemView";

function App() {
	const [view, setView] = useState<ViewType>("carousel");
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
	const [editItem, setEditItem] = useState<ClothingItem | null>(null);
	const [prefilledFormData, setPrefilledFormData] = useState<Partial<ItemFormData> | undefined>(undefined);

	const handleEditItem = (item: ClothingItem) => {
		setEditItem(item);
		setView("edit");
	};

	const handleGmailImport = useCallback((prefilled: Partial<ItemFormData>) => {
		setPrefilledFormData(prefilled);
		setView("form");
	}, []);

	const handleAddItem = useCallback(() => {
		setPrefilledFormData(undefined);
		setView("form");
	}, []);

	return (
		<div className="main">
			<EditProvider>
				<ToastProvider>
					<Header />
					<div className="button-container">
						<button onClick={handleAddItem}>Add Item</button>
						<button onClick={() => setView("overview")}>View All Items</button>
						<button onClick={() => setView("gmail")}>Import from Gmail</button>
					</div>
					{view === "form" && <MultiStepForm setView={setView} initialData={prefilledFormData} />}
					{view === "gmail" && <GmailImport onImport={handleGmailImport} />}
					{view === "carousel" && (
						<div data-testid="carousel">
							<Carousel setCategory={setSelectedCategory as any} />
						</div>
					)}
					{view === "carousel" && (
						<div data-testid="closet-container">
							<Closet selectedCategory={selectedCategory} onEditItem={handleEditItem} />
						</div>
					)}
					{view === "edit" && editItem && <EditItemView item={editItem} setView={setView}  />}
					<button className="back-button" onClick={() => setView("carousel")}>
						Back to Carousel
					</button>
				</ToastProvider>
			</EditProvider>
		</div>
	);
}

export default App;
