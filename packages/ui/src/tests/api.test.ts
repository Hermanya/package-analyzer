import { fetchMetadata, fetchProject } from "../api";

describe("api", () => {
  test("fetchProject", () => {
    expect(fetchProject).toBeDefined();
  });
  test("fetchMetadata", () => {
    expect(fetchMetadata).toBeDefined();
  });
});
