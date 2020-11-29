import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { fixture as mockFixture } from "../fixtures/fixture";
jest.mock("../api", () => ({
  fetchProject: () => Promise.resolve({ id: "mock-project-id" }),
  fetchMetadata: () => Promise.resolve(Promise.resolve(mockFixture)),
}));

test("renders project data", async () => {
  render(
    <MemoryRouter initialEntries={["/package-analyzer/map?package=ui"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  await waitFor(() =>
    expect(screen.getByText(/3 packages/i)).toBeInTheDocument()
  );
});
