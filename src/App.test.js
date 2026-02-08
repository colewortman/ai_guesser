import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

test("App renders correctly", async () => {
  const { asFragment } = render(<App />);

  // Wait for the directions content to appear (indicates initial load complete)
  await waitFor(() => {
    expect(screen.getByText(/can you tell the difference/i)).toBeInTheDocument();
  });

  // Now take the snapshot after async operations have settled
  expect(asFragment()).toMatchSnapshot();
});
