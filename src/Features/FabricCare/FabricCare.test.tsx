import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import FabricCare from "./FabricCare";

describe("FabricCare Component", () => {
      it("renders care instructions correctly when given a string", () => {
            render(<FabricCare care="Machine wash cold, tumble dry low" />);
            expect(screen.getByText("Machine wash cold, tumble dry low")).toBeInTheDocument();
      });
      it("renders care instructions correctly when given an array of strings", () => {
            const careArray = ["Machine wash cold", "Tumble dry low", "Do not bleach"];
            render(<FabricCare care={careArray} />);
            careArray.forEach((instruction) => {
                  expect(screen.getByText(instruction)).toBeInTheDocument();
            });
      });
      it("renders nothing when care is an empty string", () => {
            const { container } = render(<FabricCare care="" />);
            expect(container).toBeEmptyDOMElement();
      });
      it("renders nothing when care is an empty array", () => {
            const { container } = render(<FabricCare care={[]} />);
            expect(container).toBeEmptyDOMElement();
      });
});   
