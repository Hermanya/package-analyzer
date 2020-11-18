import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { fixture as mockFixture } from "../fixtures/fixture";
jest.mock("../api", () => ({
  fetchProjectData: () =>
    Promise.resolve({ json: () => Promise.resolve(mockFixture) }),
}));

test("renders project data", async () => {
  render(<App />);

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() =>
    expect(screen.getByText(/got project data/i)).toBeInTheDocument()
  );
});
