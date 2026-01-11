import { render } from "@testing-library/react";
import App from "./App";

test("App renders correctly", () => {
  const { asFragment } = render(<App />);
  expect(asFragment()).toMatchSnapshot();
});
