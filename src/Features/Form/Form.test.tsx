import { render, screen, fireEvent } from "@testing-library/react";
import Form from "./Form.tsx";

describe("Form Component", () => {
	it("should have a multistep form with 8 steps", () => {});
  it("should have back and next buttons at bottom of form for navigation", () => {})
  it('Returns to carousel after adding an item', () => {})

});

/*
  ========================
       EXISTING TESTS
  ========================
  import { render, screen, fireEvent } from '@testing-library/react';
  import ClosetInventoryApp from './ClosetInventoryApp';

  test('Add item flow', () => {
    render(<ClosetInventoryApp />);
    // Initially, carousel is shown
    expect(screen.queryByText('Add Item')).toBeInTheDocument();

    // Go to Add Item form (now multi-step)
    fireEvent.click(screen.getByText('Add Item'));
    expect(screen.getByPlaceholderText('Select clothing type')).toBeInTheDocument();

    // Minimally fill out brand to eventually pass existing test
    // But it's multiple steps now! We must skip forward to brand.
    // Step 1: pick type
    fireEvent.click(screen.getByText('Tops'));
    fireEvent.click(screen.getByText('Next')); // move to color
    fireEvent.click(screen.getByText('Next')); // skip color
    fireEvent.click(screen.getByText('Next')); // skip size

    // Now we are on Step 4: Brand
    fireEvent.change(screen.getByPlaceholderText('e.g. Gucci, Zara...'), {
      target: { value: 'Zara' },
    });

    // Move forward through steps until final
    fireEvent.click(screen.getByText('Next')); // material
    fireEvent.click(screen.getByText('Next')); // occasion
    fireEvent.click(screen.getByText('Next')); // age
    fireEvent.click(screen.getByText('Next')); // care

    // Finally "Submit"
    fireEvent.click(screen.getByText('Submit'));

    // Expect an item added message
    expect(screen.queryByText('Item added successfully!')).toBeInTheDocument();
  });

  test('Returns to carousel after adding an item', async () => {
    render(<ClosetInventoryApp />);

    // Navigate to Add Item
    fireEvent.click(screen.getByText('Add Item'));
    // We'll jump steps quickly to get to the final
    fireEvent.click(screen.getByText('Next')); // skip type
    fireEvent.click(screen.getByText('Next')); // skip color
    fireEvent.click(screen.getByText('Next')); // skip size
    fireEvent.click(screen.getByText('Next')); // skip brand
    fireEvent.click(screen.getByText('Next')); // skip material
    fireEvent.click(screen.getByText('Next')); // skip occasion
    fireEvent.click(screen.getByText('Next')); // skip age
    // On care step, fill something minimal
    fireEvent.change(screen.getByPlaceholderText('e.g. Dry clean only'), {
      target: { value: 'Wash Cold' },
    });
    fireEvent.click(screen.getByText('Submit'));

    // Once added, user sees the carousel again
    expect(await screen.findByText('View All Items')).toBeInTheDocument();
  });

  /*
    ================================
    NEW TESTS FOR MULTI-STEP LOGIC
    ================================
  */


// test("Multi-step color selection is styled properly", () => {
// 	render(<ClosetInventoryApp />);
// 	fireEvent.click(screen.getByText("Add Item"));

// 	// Step 1: Type => skip
// 	fireEvent.click(screen.getByText("Next"));

// 	// Step 2: Color
// 	// Check 'red' => background red, text white
// 	const redLabel = screen.getByLabelText("red").closest("label");
// 	expect(redLabel).toHaveStyle("background-color: red");
// 	// Select 'red'
// 	fireEvent.click(screen.getByLabelText("red"));
// 	expect(screen.getByLabelText("red")).toBeChecked();
// });

// test("User can go back steps", () => {
// 	render(<ClosetInventoryApp />);
// 	fireEvent.click(screen.getByText("Add Item"));
// 	// Step 1 => Next => Step 2 => Next => Step 3 => ...
// 	fireEvent.click(screen.getByText("Next"));
// 	fireEvent.click(screen.getByText("Next"));
// 	// Now we are on Step 3
// 	expect(screen.queryByText("Size")).toBeInTheDocument();

// 	// Go back => Step 2
// 	fireEvent.click(screen.getByText("Back"));
// 	expect(screen.queryByText("Color")).toBeInTheDocument();
// });
// // Fill out fields
// fireEvent.change(screen.getByPlaceholderText("e.g. Red, Blue..."), { target: { value: "Red" } });
// fireEvent.change(screen.getByPlaceholderText("e.g. S, M, L..."), { target: { value: "M" } });
// // ... fill out other fields as needed

// // Submit the form
// fireEvent.click(screen.getByText("Add Item"));

// // Expect an item added message
// expect(screen.queryByText("Item added successfully!")).toBeInTheDocument();
