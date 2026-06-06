import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useLocalStorage } from "../uselocalStorage";

beforeEach(() => localStorage.clear());

describe("useLocalStorage", () => {
	it("returns the default value when the key is absent", () => {
		const { result } = renderHook(() => useLocalStorage("test-key", "default"));
		expect(result.current[0]).toBe("default");
	});

	it("reads an existing value from localStorage on mount", () => {
		localStorage.setItem("test-key", JSON.stringify("persisted"));
		const { result } = renderHook(() => useLocalStorage("test-key", "default"));
		expect(result.current[0]).toBe("persisted");
	});

	it("writes to localStorage when the value changes", () => {
		const { result } = renderHook(() => useLocalStorage("test-key", "initial"));
		act(() => result.current[1]("updated"));
		expect(JSON.parse(localStorage.getItem("test-key")!)).toBe("updated");
	});

	it("works with object values", () => {
		const { result } = renderHook(() => useLocalStorage("obj-key", { a: 1 }));
		act(() => result.current[1]({ a: 99 }));
		expect(result.current[0]).toEqual({ a: 99 });
		expect(JSON.parse(localStorage.getItem("obj-key")!)).toEqual({ a: 99 });
	});

	it("falls back to the default when the stored value is corrupt JSON", () => {
		localStorage.setItem("bad-key", "not valid json {{");
		const { result } = renderHook(() => useLocalStorage("bad-key", "fallback"));
		expect(result.current[0]).toBe("fallback");
	});
});
