import { render, screen, fireEvent } from "@testing-library/react";
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
			const [item] = await importClosetFromCSV(csvFile(csv));

			expect(item.name).toBe("Tee");
			expect(item.brand).toBe("Acme");
			expect(item.category).toBe("tops");
		});

		it("generates a unique id for every imported item", async () => {
			const csv = `${CSV_HEADER}\nTee,Acme,tops,blue,M,20,cotton,casual,good,2024-01-01,cold,false,a\nHat,Acme,tops,red,S,10,wool,casual,good,2024-01-01,cold,false,b`;
			const items = await importClosetFromCSV(csvFile(csv));

			expect(items[0].id).toBeTruthy();
			expect(items[1].id).toBeTruthy();
			expect(items[0].id).not.toBe(items[1].id);
		});

		it("coerces the On Sale column into a real boolean", async () => {
			const csv = `${CSV_HEADER}\nTee,Acme,tops,blue,M,20,cotton,casual,good,2024-01-01,cold,true,a\nHat,Acme,tops,red,S,10,wool,casual,good,2024-01-01,cold,false,b`;
			const items = await importClosetFromCSV(csvFile(csv));

			expect(items[0].onSale).toBe(true);
			expect(items[1].onSale).toBe(false);
		});

		it("handles quoted cells containing commas", async () => {
			const csv = `${CSV_HEADER}\n"Tee, v2",Acme,tops,blue,M,20,cotton,casual,good,2024-01-01,cold,false,a`;
			const [item] = await importClosetFromCSV(csvFile(csv));

			expect(item.name).toBe("Tee, v2");
		});

		it("rejects a CSV with no data rows", async () => {
			await expect(importClosetFromCSV(csvFile(CSV_HEADER))).rejects.toThrow(/empty|no data/i);
		});
	});

	describe("JSON parsing + file dispatch", () => {
		it("parses a JSON array and preserves types", async () => {
			const json = JSON.stringify([{ id: "x1", name: "Tee", onSale: true, price: "20" }]);
			const [item] = await importClosetFromJSON(jsonFile(json));

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
			expect(fromJson[0].name).toBe("A");

			await expect(importClosetFromFile(csvFile("x", "closet.txt"))).rejects.toThrow(/unsupported/i);
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

		it("shows the found and current counts", () => {
			render(<ImportClosetModal {...baseProps} />);
			expect(screen.getByText(/found 2 items/i)).toBeInTheDocument();
			expect(screen.getByText(/current closet: 3 items/i)).toBeInTheDocument();
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

			const replaceRadio = document.querySelector('input[name="importMode"][value="replace"]') as HTMLInputElement;
			fireEvent.click(replaceRadio);
			expect(onModeChange).toHaveBeenCalledWith("replace");
		});
	});
});
