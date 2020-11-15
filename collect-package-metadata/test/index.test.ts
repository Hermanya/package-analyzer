import path from "path";
import collectPackageMetadata from "../src/index";
import fetch from "node-fetch";
jest.mock("node-fetch");

describe("collect-package-metadata", () => {
  test("collectPackageMetadata", async () => {
    const mockFetch = (fetch as unknown) as jest.Mock;
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve()
    });
    const root = path.resolve(__dirname, "..", "..") + path.sep;
    await collectPackageMetadata({
      root,
      revision: "sha",
      projectId: "testProject",
      secret: "verySecret"
    });
    expect(mockFetch.mock.calls.length).toBe(1);
    const result = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(result.packages.length).toBe(3);
  });
});
