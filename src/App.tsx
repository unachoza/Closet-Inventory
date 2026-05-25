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

function buildClothingItem(prefilled: Partial<ClothingItem>): ClothingItem {
	return {
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
}

function App() {
	const [view, setView] = useState<ViewType>("carousel");
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
	const [editItem, setEditItem] = useState<ClothingItem | null>(null);
	const [editMode, setEditMode] = useState<"edit" | "create">("edit");
	const [prefilledFormData, setPrefilledFormData] = useState<Partial<ItemFormData> | undefined>(undefined);

	// Gmail import state
	const [gmailSourceEmailId, setGmailSourceEmailId] = useState<string | null>(null);
	const [importQueue, setImportQueue] = useState<ClothingItem[]>([]);
	const [importQueueIndex, setImportQueueIndex] = useState(0);

	const handleEditItem = (item: ClothingItem) => {
		setEditItem(item);
		setEditMode("edit");
		setView("edit");
	};

	// Single-item import from Gmail
	const handleGmailImport = useCallback((prefilled: Partial<ClothingItem>) => {
		const newItem = buildClothingItem(prefilled);
		setEditItem(newItem);
		setEditMode("create");
		setImportQueue([]);
		setImportQueueIndex(0);
		setView("edit");
	}, []);

	// Batch import: "Import All Items" from an email
	const handleGmailImportAll = useCallback((items: Partial<ClothingItem>[]) => {
		if (items.length === 0) return;

		const clothingItems = items.map(buildClothingItem);
		setImportQueue(clothingItems);
		setImportQueueIndex(0);
		setEditItem(clothingItems[0]);
		setEditMode("create");
		setView("edit");
	}, []);

	// After "Add to Closet" or "Skip" in batch mode — advance to next item
	const handleQueueAdvance = useCallback(() => {
		const nextIndex = importQueueIndex + 1;
		if (nextIndex < importQueue.length) {
			setImportQueueIndex(nextIndex);
			setEditItem(importQueue[nextIndex]);
		} else {
			// Queue complete — return to gmail with the email still selected
			setImportQueue([]);
			setImportQueueIndex(0);
			setView("gmail");
		}
	}, [importQueue, importQueueIndex]);

	// Return to email preview from EditItemView
	const handleReturnToEmail = useCallback(() => {
		setImportQueue([]);
		setImportQueueIndex(0);
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

	const isInBatchMode = importQueue.length > 1;

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
							onImportAll={handleGmailImportAll}
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
							onSkipItem={isInBatchMode ? handleQueueAdvance : undefined}
							onItemAdded={isInBatchMode ? handleQueueAdvance : undefined}
							queuePosition={isInBatchMode ? importQueueIndex + 1 : undefined}
							queueTotal={isInBatchMode ? importQueue.length : undefined}
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
