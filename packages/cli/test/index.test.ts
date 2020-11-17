import path from "path";
import collectPackageMetadata from "../src/index";
import fetch from "node-fetch";
jest.mock("node-fetch");

describe("cli", () => {
  let mockFetch: jest.Mock;
  beforeEach(() => {
    mockFetch = (fetch as unknown) as jest.Mock;
    mockFetch.mockReset();
    jest.spyOn(global.console, "log").mockImplementation();
  });
  test("happy path", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve()
    });
    const root = path.resolve(__dirname, "..", "..") + path.sep;
    await collectPackageMetadata({
      root,
      revision: "sha",
      ref: "ref",
      projectId: "testProject",
      secret: "verySecret"
    });
    expect(mockFetch.mock.calls.length).toBe(1);
    const result = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(result.packages.length).toBe(3);
  });
  test("upload failure", async () => {
    mockFetch.mockRejectedValueOnce("test failure");
    const root = path.resolve(__dirname, "..", "..") + path.sep;
    const logSpy = jest.spyOn(global.console, "error").mockImplementation();
    await collectPackageMetadata({
      root,
      revision: "sha",
      ref: "ref",
      projectId: "testProject",
      secret: "verySecret"
    });
    expect(mockFetch.mock.calls.length).toBe(1);
    expect(logSpy).toHaveBeenCalled();
  });
});
