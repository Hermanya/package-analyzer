import { fetchProjectData } from "../api";

describe("api", () => {
  test("fetchProjectData", () => {
    expect(fetchProjectData).toBeDefined();
  });
});
