import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Search Closet Feature", () => {
	describe("sticky top bar", () => {
		it("sticks to top of view screeen no matter where the user has scrolled too");
		it("takes up no more than 12% of screen no less than 5%", () => {});
		it("contains 'closet inventory' title", () => {});
		it("contains 'control view change buttons", () => {});
		it("contains hamburger menu", () => {});
		it("contains search bar", () => {});
	});
	describe("Search Sort Bar", () => {
		it("when focus, adds suggestion, predictive test", () => {});
		it("has magnifying glass icon and placeholder text", () => {});
            it("has Sort dropdown, sort by price, age")
		it("triggers search of database", () => {});
            it(" shows text Results count: 'Showing {filtered} of {total} items' ")
	});
      describe("filtering pill row", () => {
            it("should display a pill for each filter applied", ()=> {})
            it("clothing cards should have the matching pill highlighted accent color, plus other pill")
      })
});
