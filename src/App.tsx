import { useState, useCallback, useEffect } from "react";
import { ViewProvider, useView } from "./context/ViewContext";
import { SearchProvider } from "./context/SearchContext";
import { GmailAuthProvider } from "./context/GmailAuthContext";
import { SupabaseAuthProvider } from "./context/SupabaseAuthContext";
import { ClosetProvider, useCloset } from "./context/ClosetContext";
import { LocationsProvider } from "./context/LocationsContext";
import NavBar from "./Components/NavBar/NavBar";
import BottomNav from "./Components/BottomNav/BottomNav";
import { exportCloset, type ExportFormat } from "./utils/exportCloset";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary";
import { ToastProvider } from "./Components/Toast/Toast";
import EditItemView from "./Features/Form/EditItemView/EditItemView";
import MultiStepForm from "./Features/Form/Form";
import Carousel from "./Features/Carousel/Carousel";
import Closet from "./Features/Closet/Closet";
import GmailImport from "./Features/GmailImport/GmailImport";
import InteractiveGuide from "./Features/FabricCare/InteractiveGuide";
import EntireClosetView from "./Features/SearchCloset/EntireClosetView/EntireClosetView";
import { CategoryType, ClothingItem, ItemFormData } from "./utils/types";
import "./App.css";
import JourneyC from "./Components/GuideComponents/FiberJourney/JourneyC";
import { OnboardingExpanded } from "./Features/Onboarding/OnboardingSteps";
import ConsentBanner from "./Components/ConsentBanner/ConsentBanner";

function buildClothingItem(prefilled: Partial<ClothingItem>): ClothingItem {
	return {
		imageURL: "",
		name: "",
		category: "",
		color: "",
		size: "",
		brand: "",
		material: [],
		occasion: "",
		age: "",
		condition: "new",
		care: "",
		onSale: false,
		notes: [],
		// Spread carries all prefilled fields including `style` and any future
		// ClothingItem properties — nothing is silently dropped by enumeration.
		...prefilled,
		id: prefilled.id || crypto.randomUUID(),
	};
}

/**
 * E3-bug.8 — stable identity for an imported product across re-imports, so a
 * saved edit draft can be matched back to the same item. Name + brand are
 * deterministic for a given parsed product.
 */
function draftSignature(prefilled: Partial<ClothingItem>): string {
	return `${prefilled.name ?? ""}|${prefilled.brand ?? ""}`;
}

const ONBOARDING_KEY = "closetly-onboarding-complete";

function AppShell() {
	const { view, setView } = useView();
	const { closet, getCloset, importItems, clearCloset } = useCloset();
	const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
	const [editItem, setEditItem] = useState<ClothingItem | null>(null);
	const [editMode, setEditMode] = useState<"edit" | "create">("edit");
	const [prefilledFormData, setPrefilledFormData] = useState<Partial<ItemFormData> | undefined>(undefined);
	const [gmailSourceEmailId, setGmailSourceEmailId] = useState<string | null>(null);
	const [importQueue, setImportQueue] = useState<ClothingItem[]>([]);
	const [importQueueIndex, setImportQueueIndex] = useState(0);
	// E3-bug.9: "unskipped" (included) product indices per email id, held here so
	// the choice survives GmailImport unmounting on the view switch to edit.
	const [unskippedByEmail, setUnskippedByEmail] = useState<Record<string, number[]>>({});
	// E3-bug.8: in-progress import drafts, keyed by product signature, so edits
	// survive an edit → "Back to email" → re-import round trip.
	const [draftBySignature, setDraftBySignature] = useState<Record<string, ClothingItem>>({});
	const [activeDraftSignature, setActiveDraftSignature] = useState<string | null>(null);

	const [showOnboarding, setShowOnboarding] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Purge any sensitive data left over by pre-PR#76 builds on first load,
		// regardless of which view the user lands on.
		const LEGACY_KEYS = ["gmail_auth_token", "gmail_auth_loading", "gmail_auth_error", "gmail_email_bodies_cache", "gmail_emails_cache"];
		LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));

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
			// E3-bug.8: if the user already started editing this exact product and
			// stepped back to the email, restore that draft instead of a fresh item.
			const signature = draftSignature(prefilled);
			const savedDraft = draftBySignature[signature];
			setEditItem(savedDraft ?? buildClothingItem(prefilled));
			// Consume-once: a restored draft is removed so it can't reapply stale
			// edits after the item is added (a later peek re-stashes it).
			if (savedDraft) {
				setDraftBySignature((prev) => {
					const next = { ...prev };
					delete next[signature];
					return next;
				});
			}
			setActiveDraftSignature(signature);
			setEditMode("create");
			setImportQueue([]);
			setImportQueueIndex(0);
			setView("edit");
		},
		[setView, draftBySignature],
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

	// Return to email preview from EditItemView, stashing the in-progress draft
	// so re-importing the same product restores the user's edits (E3-bug.8).
	const handleReturnToEmail = useCallback(
		(draft: Partial<ClothingItem>) => {
			if (editItem && activeDraftSignature) {
				const merged: ClothingItem = { ...editItem, ...draft };
				setDraftBySignature((prev) => ({ ...prev, [activeDraftSignature]: merged }));
			}
			setImportQueue([]);
			setImportQueueIndex(0);
			setView("gmail");
		},
		[setView, editItem, activeDraftSignature],
	);

	const handleSourceEmailChange = useCallback((emailId: string | null) => {
		setGmailSourceEmailId(emailId);
	}, []);

	const handleUnskippedByEmailChange = useCallback((emailId: string, indices: number[]) => {
		setUnskippedByEmail((prev) => ({ ...prev, [emailId]: indices }));
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
		<div className={`main ${view === "carousel" ? "view-hero" : "view-browse"}`}>
			<NavBar
				onAddItem={handleAddItem}
				onExportCloset={handleExportCloset}
				onImportCloset={importItems}
				onClearCloset={clearCloset}
				closetItemCount={closet.length}
			/>
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
								unskippedByEmail={unskippedByEmail}
								onUnskippedByEmailChange={handleUnskippedByEmailChange}
							/>
						)}
						{view === "fabric" && <InteractiveGuide />}
						{view === "journey" && <JourneyC />}
						{view === "entireCloset" && <EntireClosetView onEditItem={handleEditItem} />}
						{view === "carousel" && (
							<>
								<div data-testid="carousel">
									<Carousel setCategory={setSelectedCategory} />
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
			{/* Mobile-only fixed bar (hidden ≥769px in CSS); shares the same
			    Add-Item handler as the NavBar drawer (E5-1.2/E5-1.3). */}
			<BottomNav onAddItem={handleAddItem} />
		</div>
	);
}

function App() {
	return (
		<>
			<ConsentBanner />
			<SupabaseAuthProvider>
			{/* Single cloud-backed closet instance shared by all consumers (E1-1.4).
			    Inside SupabaseAuthProvider so it can read the signed-in userId. */}
			<ClosetProvider>
				{/* Single per-user locations store (E12-3.2) — same rationale as
				    ClosetProvider: one live list, not one fetch per consumer. */}
				<LocationsProvider>
					<ViewProvider initialView="carousel">
						<SearchProvider>
							{/* Session-scoped Gmail auth — mounted above the view switch so the
							    in-memory token survives gmail → edit → "Back to email" (E3-bug.2). */}
							<GmailAuthProvider>
								<AppShell />
							</GmailAuthProvider>
						</SearchProvider>
					</ViewProvider>
				</LocationsProvider>
			</ClosetProvider>
		</SupabaseAuthProvider>
		</>
	);
}

export default App;
