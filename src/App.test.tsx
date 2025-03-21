import {render, screen} from '@testing-library/react'
import App from './App'

it("should have heading here text ", () => {
    render(<App/>)
    // const message = screen.queryByText(/Vite + React/)
    const heading = screen.getByRole("heading");
    expect(heading).toBeVisible()
})