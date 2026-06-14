import { useState, useCallback, useEffect } from "react";
import { EditProvider } from "./Features/Form/EditContext";
import { ViewProvider, useView } from "./context/ViewContext";
import { SearchProvider } from "./context/SearchContext";
import NavBar from "./Components/NavBar/NavBar";
import { useLocalStorageCloset } from "./hooks/useLocalCloset";
import { exportCloset, type ExportFormat } from "./utils/exportCloset";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "./Components/Toast/Toast";
import EditItemView from "./Features/Form/EditItemView/EditItemView";
import MultiStepForm from "./Features/Form/Form";
import Carousel from "./Features/Carousel/Carousel";
import Closet from "./Features/Closet/Closet";
import GmailImport from "./Features/GmailImport/GmailImport";
import InteractiveGuide from "./Features/FabricCare/InteractiveGuide";
import EntireClosetView from "./Features/SearchCloset/EntireClosetView";
import { CategoryType, ClothingItem, ItemFormData } from "./utils/types";
import "./App.css";
import JourneyC from "./Components/GuideComponents/FiberJourney/JourneyC";
import { OnboardingExpanded } from "./Features/Onboarding/OnboardingSteps";

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
		material: prefilled.material ?? [],
		occasion: prefilled.occasion ?? "",
		age: prefilled.age ?? "",
		condition: prefilled.condition ?? "new",
		// Carry the email's purchase date through — earlier this was dropped by the
		// explicit literal, so imported items lost their factual age and showed "new".
		purchaseDate: prefilled.purchaseDate,
		care: prefilled.care ?? "",
		onSale: prefilled.onSale ?? false,
		notes: prefilled.notes ?? "",
		// Inferred style attributes (neckline, fit, etc.) from email import — carry
		// them through so CardDetails can show the Style/Features sections.
		style: prefilled.style,
	};
}

const ONBOARDING_KEY = "closetly-onboarding-complete";

function AppShell() {
	const { view, setView } = useView();
	const { closet, getCloset, importItems } = useLocalStorageCloset();
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
	const [editItem, setEditItem] = useState<ClothingItem | null>(null);
	const [editMode, setEditMode] = useState<"edit" | "create">("edit");
	const [prefilledFormData, setPrefilledFormData] = useState<Partial<ItemFormData> | undefined>(undefined);
	const [gmailSourceEmailId, setGmailSourceEmailId] = useState<string | null>(null);
	const [importQueue, setImportQueue] = useState<ClothingItem[]>([]);
	const [importQueueIndex, setImportQueueIndex] = useState(0);

	const [showOnboarding, setShowOnboarding] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);

		setShowOnboarding(!hasCompletedOnboarding);
		setIsLoading(false);
	}, []);

	const handleComplete = () => {
		localStorage.setItem(ONBOARDING_KEY, "true");
		setShowOnboarding(false);
	};

	const handleEditItem = (item: ClothingItem) => {
		setEditItem(item);
		setEditMode("edit");
		setView("edit");
	};

	const handleGmailImport = useCallback(
		(prefilled: Partial<ClothingItem>) => {
			const newItem = buildClothingItem(prefilled);
			setEditItem(newItem);
			setEditMode("create");
			setImportQueue([]);
			setImportQueueIndex(0);
			setView("edit");
		},
		[setView],
	);

	// Batch import: "Import All Items" from an email
	const handleGmailImportAll = useCallback(
		(items: Partial<ClothingItem>[]) => {
			if (items.length === 0) return;
			const clothingItems = items.map(buildClothingItem);
			setImportQueue(clothingItems);
			setImportQueueIndex(0);
			setEditItem(clothingItems[0]);
			setEditMode("create");
			setView("edit");
		},
		[setView],
	);

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
	}, [importQueue, importQueueIndex, setView]);

	// Return to email preview from EditItemView
	const handleReturnToEmail = useCallback(() => {
		setImportQueue([]);
		setImportQueueIndex(0);
		setView("gmail");
	}, [setView]);

	const handleSourceEmailChange = useCallback((emailId: string | null) => {
		setGmailSourceEmailId(emailId);
	}, []);

	const handleAddItem = useCallback(() => {
		setPrefilledFormData(undefined);
		setGmailSourceEmailId(null);
		setView("form");
	}, [setView]);

	const handleExportCloset = useCallback(
		(format: ExportFormat) => {
			exportCloset(getCloset(), format);
		},
		[getCloset],
	);

	const isInBatchMode = importQueue.length > 1;

	if (isLoading) {
		return null;
	}

	if (showOnboarding) {
		return <OnboardingExpanded onComplete={handleComplete} />;
	}
	return (
		<div className="main">
			<NavBar
				onAddItem={handleAddItem}
				onExportCloset={handleExportCloset}
				onImportCloset={importItems}
				closetItemCount={closet.length}
			/>
			<EditProvider>
				<ToastProvider>
					<div className="app-content">
						{/* Keyed by view so a crash in one screen resets when navigating away.
					     "Try again" sends the user back to the overview (closet) screen. */}
						<ErrorBoundary key={view} onReset={() => setView("overview")}>
							{view === "overview" && <Closet selectedCategory={selectedCategory} onEditItem={handleEditItem} />}
							{view === "form" && <MultiStepForm setView={setView} initialData={prefilledFormData} />}
							{view === "gmail" && (
								<GmailImport
									onImport={handleGmailImport}
									onImportAll={handleGmailImportAll}
									initialSelectedEmailId={gmailSourceEmailId}
									onSourceEmailChange={handleSourceEmailChange}
								/>
							)}
							{view === "fabric" && <InteractiveGuide />}
							{view === "journey" && <JourneyC />}
							{view === "entireCloset" && <EntireClosetView onEditItem={handleEditItem} />}
							{view === "carousel" && (
								<>
									<div data-testid="carousel">
										<Carousel setCategory={setSelectedCategory as any} />
									</div>
									<div data-testid="closet-container">
										<Closet selectedCategory={selectedCategory} onEditItem={handleEditItem} />
									</div>
								</>
							)}
							{view === "edit" && editItem && (
								<EditItemView
									key={(isInBatchMode ? importQueue[importQueueIndex] : editItem).id}
									item={isInBatchMode ? importQueue[importQueueIndex] : editItem}
									mode={editMode}
									setView={setView}
									onReturnToEmail={editMode === "create" ? handleReturnToEmail : undefined}
									onSkipItem={isInBatchMode ? handleQueueAdvance : undefined}
									onItemAdded={isInBatchMode ? handleQueueAdvance : undefined}
									queuePosition={isInBatchMode ? importQueueIndex + 1 : undefined}
									queueTotal={isInBatchMode ? importQueue.length : undefined}
								/>
							)}
						</ErrorBoundary>
					</div>
				</ToastProvider>
			</EditProvider>
		</div>
	);
}

function App() {
	return (
		<ViewProvider initialView="carousel">
			<SearchProvider>
				<AppShell />
			</SearchProvider>
		</ViewProvider>
	);
}

export default App;
