import { useState, useCallback, useEffect } from "react";
import { GMAIL_SEARCH_SUBJECTS, GMAIL_SEARCH_BODY_KEYWORDS, GMAIL_EXCLUDE_SENDERS } from "../constants";
import { MobileSearchWizard } from "../AdvnacedSearch/MobileAdvancedSearchFlow/MobileAdvancedSearchFlow";
import { DesktopSearchSplitPanel } from "../AdvnacedSearch/DesktopAdvancedSearchFlow/DesktopAdvancedSearchFlow";

export type SearchMode = "fetch" | "filter";

export interface AdvancedSearchParams {
	readonly subjects: readonly string[];
	readonly excludedSenders: readonly string[];
	readonly bodyKeywords: readonly string[];
	readonly from: string;
	readonly after: string;
	readonly before: string;
}

export const DEFAULT_SEARCH_PARAMS: AdvancedSearchParams = {
	subjects: GMAIL_SEARCH_SUBJECTS,
	excludedSenders: GMAIL_EXCLUDE_SENDERS,
	bodyKeywords: GMAIL_SEARCH_BODY_KEYWORDS,
	from: "",
	after: "",
	before: "",
};

interface AdvancedSearchUIProps {
	readonly onSearch: (params: AdvancedSearchParams, mode: SearchMode) => void;
	readonly loading: boolean;
	readonly cachedCount: number;
}

export const AdvancedSearchUI = ({ onSearch, loading, cachedCount }: AdvancedSearchUIProps) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [from, setFrom] = useState("");
	const [after, setAfter] = useState("");
	const [before, setBefore] = useState("");
	const [excludedSenders, setExcludedSenders] = useState<string[]>([...GMAIL_EXCLUDE_SENDERS]);
	const [bodyKeywords, setBodyKeywords] = useState<string[]>([...GMAIL_SEARCH_BODY_KEYWORDS]);
	const [subjects, setSubjects] = useState<string[]>([...GMAIL_SEARCH_SUBJECTS]);

	// Detect mobile/desktop dynamically
	const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const buildParams = useCallback(
		(): AdvancedSearchParams => ({
			subjects,
			excludedSenders,
			bodyKeywords,
			from,
			after,
			before,
		}),
		[subjects, excludedSenders, bodyKeywords, from, after, before],
	);

	// ── Handler to execute search ──────────────────────────

	const handleSearch = useCallback(
		(mode: SearchMode) => {
			onSearch(buildParams(), mode);
			setIsExpanded(false)
		},
		[buildParams, onSearch],
	);

	return (
		<div className="advanced-search">
			<button className="advanced-search-toggle" onClick={() => setIsExpanded((prev) => !prev)} type="button">
				{isExpanded ? "Hide" : "Show"} Advanced Search
			</button>

			{isExpanded && isMobile && (
				<MobileSearchWizard
					fromSender={from}
					onFromSenderChange={setFrom}
					dateAfter={after}
					onDateAfterChange={setAfter}
					dateBefore={before}
					onDateBeforeChange={setBefore}
					subjects={subjects}
					onAddSubject={(s) => setSubjects((prev) => [...prev, s])}
					onRemoveSubject={(s) => setSubjects((prev) => prev.filter((x) => x !== s))}
					keywords={bodyKeywords}
					onAddKeyword={(k) => setBodyKeywords((prev) => [...prev, k])}
					onRemoveKeyword={(k) => setBodyKeywords((prev) => prev.filter((x) => x !== k))}
					excluded={excludedSenders}
					onAddExcluded={(s) => setExcludedSenders((prev) => [...prev, s])}
					onRemoveExcluded={(s) => setExcludedSenders((prev) => prev.filter((x) => x !== s))}
					onSearch={handleSearch}
					loading={loading}
					cachedCount={cachedCount}
				/>
			)}

			{isExpanded && !isMobile && (
				<DesktopSearchSplitPanel
					fromSender={from}
					onFromSenderChange={setFrom}
					dateAfter={after}
					onDateAfterChange={setAfter}
					dateBefore={before}
					onDateBeforeChange={setBefore}
					subjects={subjects}
					onAddSubject={(s) => setSubjects((prev) => [...prev, s])}
					onRemoveSubject={(s) => setSubjects((prev) => prev.filter((x) => x !== s))}
					keywords={bodyKeywords}
					onAddKeyword={(k) => setBodyKeywords((prev) => [...prev, k])}
					onRemoveKeyword={(k) => setBodyKeywords((prev) => prev.filter((x) => x !== k))}
					excluded={excludedSenders}
					onAddExcluded={(s) => setExcludedSenders((prev) => [...prev, s])}
					onRemoveExcluded={(s) => setExcludedSenders((prev) => prev.filter((x) => x !== s))}
					onSearch={handleSearch}
					loading={loading}
					cachedCount={cachedCount}
				/>
			)}
		</div>
	);
};
