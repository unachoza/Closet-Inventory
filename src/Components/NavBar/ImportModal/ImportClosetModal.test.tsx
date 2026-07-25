import { useState } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ImportClosetModal from "./ImportClosetModal";
import { importClosetFromCSV, importClosetFromJSON, importClosetFromFile } from "../../../utils/importCloset";

// jsdom's File doesn't implement .text(); patch it for the parsers under test.
function makeFile(content: string, name: string, type: string): File {
	const file = new File([content], name, { type });
	Object.defineProperty(file, "text", { value: () => Promise.resolve(content) });
	return file;
}

function csvFile(content: string, name = "closet.csv"): File {
	return makeFile(content, name, "text/csv");
}

function jsonFile(content: string, name = "closet.json"): File {
	return makeFile(content, name, "application/json");
}

const CSV_HEADER = "Name,Brand,Category,Color,Size,Price,Material,Occasion,Condition,Purchase Date,Care,On Sale,Notes";

describe("ImportClosetModal", () => {
	describe("CSV parsing (importCloset.ts)", () => {
		it("maps headers to fields", async () => {
			const csv = `${CSV_HEADER}\nTee,Acme,tops,blue,M,20,cotton,casual,good,2024-01-01,cold wash,false,nice`;
			const { items: [item] } = await importClosetFromCSV(csvFile(csv));

			expect(item.name).toBe("Tee");
			expect(item.brand).toBe("Acme");
			expect(item.category).toBe("tops");
		});

		it("generates a unique id for every imported item", async () => {
			const csv = `${CSV_HEADER}\nTee,Acme,tops,blue,M,20,cotton,casual,good,2024-01-01,cold,false,a\nHat,Acme,tops,red,S,10,wool,casual,good,2024-01-01,cold,false,b`;
			const { items } = await importClosetFromCSV(csvFile(csv));

			expect(items[0].id).toBeTruthy();
			expect(items[1].id).toBeTruthy();
			expect(items[0].id).not.toBe(items[1].id);
		});

		it("coerces the On Sale column into a real boolean", async () => {
			const csv = `${CSV_HEADER}\nTee,Acme,tops,blue,M,20,cotton,casual,good,2024-01-01,cold,true,a\nHat,Acme,tops,red,S,10,wool,casual,good,2024-01-01,cold,false,b`;
			const { items } = await importClosetFromCSV(csvFile(csv));

			expect(items[0].onSale).toBe(true);
			expect(items[1].onSale).toBe(false);
		});

		it("handles quoted cells containing commas", async () => {
			const csv = `${CSV_HEADER}\n"Tee, v2",Acme,tops,blue,M,20,cotton,casual,good,2024-01-01,cold,false,a`;
			const { items: [item] } = await importClosetFromCSV(csvFile(csv));

			expect(item.name).toBe("Tee, v2");
		});

		it("rejects a CSV with no data rows", async () => {
			await expect(importClosetFromCSV(csvFile(CSV_HEADER))).rejects.toThrow(/empty|no data/i);
		});
	});

	describe("JSON parsing + file dispatch", () => {
		it("parses a JSON array and preserves types", async () => {
			const json = JSON.stringify([{ id: "x1", name: "Tee", onSale: true, price: "20" }]);
			const { items: [item] } = await importClosetFromJSON(jsonFile(json));

			expect(item.id).toBe("x1");
			expect(item.onSale).toBe(true);
		});

		it("throws on invalid JSON", async () => {
			await expect(importClosetFromJSON(jsonFile("{not json"))).rejects.toThrow(/valid json/i);
		});

		it("throws when JSON is not a list of items", async () => {
			await expect(importClosetFromJSON(jsonFile('{"foo":1}'))).rejects.toThrow(/list|no valid/i);
		});

		it("dispatches by extension", async () => {
			const fromJson = await importClosetFromFile(jsonFile('[{"name":"A"}]'));
			expect(fromJson.items[0].name).toBe("A");

			await expect(importClosetFromFile(csvFile("x", "closet.txt"))).rejects.toThrow(/unsupported/i);
		});

		it("skips rows missing a name and imports the rest", async () => {
			const json = JSON.stringify([{ id: "bad-1", category: "tops", brand: "Acme" }, { name: "Good Item" }]);
			const { items, skipped } = await importClosetFromJSON(jsonFile(json));

			expect(items).toHaveLength(1);
			expect(items[0].name).toBe("Good Item");
			expect(skipped).toEqual([
				{ index: 1, id: "bad-1", reason: expect.stringMatching(/name/i), record: { id: "bad-1", category: "tops", brand: "Acme" } },
			]);
		});
	});

	describe("Modal/UI behavior", () => {
		const baseProps = {
			isOpen: true,
			currentItemCount: 3,
			importItemCount: 2,
			importMode: "merge" as const,
			onModeChange: vi.fn(),
			onConfirm: vi.fn(),
			onCancel: vi.fn(),
		};

		function getModeRadio(mode: "replace" | "merge") {
			return document.querySelector(`input[name="importMode"][value="${mode}"]`) as HTMLInputElement;
		}

		it("shows the item counts in the summary", () => {
			render(<ImportClosetModal {...baseProps} />);
			const values = Array.from(document.querySelectorAll(".ecm-import-summary__value")).map((el) => el.textContent);
			expect(values).toEqual(["2", "3"]);
		});

		it("calls onConfirm and onCancel", () => {
			const onConfirm = vi.fn();
			const onCancel = vi.fn();
			render(<ImportClosetModal {...baseProps} onConfirm={onConfirm} onCancel={onCancel} />);

			fireEvent.click(screen.getByRole("button", { name: /import closet/i }));
			fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

			expect(onConfirm).toHaveBeenCalledTimes(1);
			expect(onCancel).toHaveBeenCalledTimes(1);
		});

		it("switches mode when a radio is selected", () => {
			const onModeChange = vi.fn();
			render(<ImportClosetModal {...baseProps} onModeChange={onModeChange} />);

			fireEvent.click(getModeRadio("replace"));
			expect(onModeChange).toHaveBeenCalledWith("replace");
		});

		it("marks the current import mode as selected", () => {
			render(<ImportClosetModal {...baseProps} importMode="merge" />);

			const mergeRadio = getModeRadio("merge");
			const replaceRadio = getModeRadio("replace");

			expect(mergeRadio).toBeChecked();
			expect(replaceRadio).not.toBeChecked();

			expect(mergeRadio.closest(".import-option")).toHaveClass("import-option--selected");
			expect(replaceRadio.closest(".import-option")).not.toHaveClass("import-option--selected");
		});

		it("keeps the decorative checkmark hidden from assistive technology", () => {
			render(<ImportClosetModal {...baseProps} />);

			const checkmarks = document.querySelectorAll(".import-option__check");
			expect(checkmarks).toHaveLength(2);
			for (const checkmark of checkmarks) {
				expect(checkmark).toHaveAttribute("aria-hidden", "true");
			}
		});

		it("moves the selected class and animated checkmark when the controlled mode changes", async () => {
			const user = userEvent.setup();

			function TestHarness() {
				const [mode, setMode] = useState<"replace" | "merge">("merge");
				return <ImportClosetModal {...baseProps} importMode={mode} onModeChange={setMode} />;
			}

			render(<TestHarness />);

			const mergeRadio = getModeRadio("merge");
			const replaceRadio = getModeRadio("replace");

			expect(mergeRadio.closest(".import-option")).toHaveClass("import-option--selected");
			expect(replaceRadio.closest(".import-option")).not.toHaveClass("import-option--selected");

			await user.click(replaceRadio);

			expect(replaceRadio).toBeChecked();
			expect(mergeRadio).not.toBeChecked();
			expect(replaceRadio.closest(".import-option")).toHaveClass("import-option--selected");
			expect(mergeRadio.closest(".import-option")).not.toHaveClass("import-option--selected");
		});

		it("shows a name input per skipped row when present", () => {
			render(
				<ImportClosetModal
					{...baseProps}
					skippedItems={[
						{ index: 5, id: "abc-1", reason: "missing a required 'name' field", record: { id: "abc-1", brand: "Acme", category: "tops" } },
					]}
				/>,
			);
			expect(screen.getByText(/1 item missing a name/i)).toBeInTheDocument();
			expect(screen.getByPlaceholderText(/item name/i)).toBeInTheDocument();
			expect(screen.getByText(/acme · tops/i)).toBeInTheDocument();
		});

		it("shows no skipped section when skippedItems is empty", () => {
			render(<ImportClosetModal {...baseProps} />);
			expect(screen.queryByText(/missing a name/i)).not.toBeInTheDocument();
		});

		it("typing a name for a skipped row fires onSkippedNameChange and updates the live count", () => {
			const onSkippedNameChange = vi.fn();
			const { rerender } = render(
				<ImportClosetModal
					{...baseProps}
					skippedItems={[{ index: 5, reason: "missing a required 'name' field", record: {} }]}
					skippedNameFixes={{}}
					onSkippedNameChange={onSkippedNameChange}
				/>,
			);
			expect(document.querySelector(".ecm-import-summary__value")?.textContent).toBe("2");

			fireEvent.change(screen.getByPlaceholderText(/item name/i), { target: { value: "Fixed Name" } });
			expect(onSkippedNameChange).toHaveBeenCalledWith(5, "Fixed Name");

			rerender(
				<ImportClosetModal
					{...baseProps}
					skippedItems={[{ index: 5, reason: "missing a required 'name' field", record: {} }]}
					skippedNameFixes={{ 5: "Fixed Name" }}
					onSkippedNameChange={onSkippedNameChange}
				/>,
			);
			expect(document.querySelector(".ecm-import-summary__value")?.textContent).toBe("3");
		});

		it("shows a debounced confirmation after typing a name, and hides it again on further edits", () => {
			vi.useFakeTimers();
			try {
				const skippedItems = [{ index: 5, reason: "missing a required 'name' field", record: {} }];
				const renderWith = (value: string) => (
					<ImportClosetModal
						{...baseProps}
						skippedItems={skippedItems}
						skippedNameFixes={{ 5: value }}
						onSkippedNameChange={() => {}}
					/>
				);

				const { rerender } = render(renderWith(""));
				const getInput = () => screen.getByPlaceholderText(/item name/i);

				fireEvent.change(getInput(), { target: { value: "Fixed Name" } });
				rerender(renderWith("Fixed Name"));
				expect(screen.queryByText(/item name updated/i)).not.toBeInTheDocument();

				act(() => {
					vi.advanceTimersByTime(600);
				});
				expect(screen.getByText(/✓ item name updated/i)).toBeInTheDocument();

				// Editing again hides the confirmation until the debounce fires again.
				fireEvent.change(getInput(), { target: { value: "Fixed Name 2" } });
				rerender(renderWith("Fixed Name 2"));
				expect(screen.queryByText(/item name updated/i)).not.toBeInTheDocument();

				act(() => {
					vi.advanceTimersByTime(600);
				});
				expect(screen.getByText(/✓ item name updated/i)).toBeInTheDocument();

				// Clearing the field back to blank hides the confirmation and doesn't re-show it.
				fireEvent.change(getInput(), { target: { value: "" } });
				rerender(renderWith(""));
				act(() => {
					vi.advanceTimersByTime(600);
				});
				expect(screen.queryByText(/item name updated/i)).not.toBeInTheDocument();
			} finally {
				vi.useRealTimers();
			}
		});
	});
});
