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
	const [editMode, setEditMode] = useState<"edit" | "create">("edit");
	const [prefilledFormData, setPrefilledFormData] = useState<Partial<ItemFormData> | undefined>(undefined);
	// Gmail import state
	const [gmailSourceEmailId, setGmailSourceEmailId] = useState<string | null>(null);

	const handleEditItem = (item: ClothingItem) => {
		setEditItem(item);
		setEditMode("edit");
		setView("edit");
	};

	const handleGmailImport = useCallback((prefilled: Partial<ClothingItem>) => {
		// Build a full ClothingItem shape for EditItemView create mode
		const newItem: ClothingItem = {
			id: prefilled.id || crypto.randomUUID(),
			imageURL: prefilled.imageURL ?? "",
			name: prefilled.name ?? "",
			category: prefilled.category ?? "",
			color: prefilled.color ?? "",
			size: prefilled.size ?? "",
			brand: prefilled.brand ?? "",
			price: prefilled.price ?? "",
			material: prefilled.material ?? "",
			occasion: prefilled.occasion ?? "",
			age: prefilled.age ?? "new",
			care: prefilled.care ?? "",
			onSale: prefilled.onSale ?? false,
			notes: prefilled.notes ?? "",
		};

		setEditItem(newItem);
		setEditMode("create");
		setView("edit");
	}, []);

	// Return to email preview from EditItemView
	const handleReturnToEmail = useCallback(() => {
		setView("gmail");
	}, []);

	const handleSourceEmailChange = useCallback((emailId: string | null) => {
		setGmailSourceEmailId(emailId);
	}, []);

	const handleAddItem = useCallback(() => {
		setPrefilledFormData(undefined);
		setGmailSourceEmailId(null);
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
					{view === "gmail" && (
						<GmailImport
							onImport={handleGmailImport}
							initialSelectedEmailId={gmailSourceEmailId}
							onSourceEmailChange={handleSourceEmailChange}
						/>
					)}
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
					{view === "edit" && editItem && (
						<EditItemView
							item={editItem}
							mode={editMode}
							setView={setView}
							onReturnToEmail={editMode === "create" ? handleReturnToEmail : undefined}
						/>
					)}
					<button className="back-button" onClick={() => setView("carousel")}>
						Back to Carousel
					</button>
				</ToastProvider>
			</EditProvider>
		</div>
	);
}

export default App;
