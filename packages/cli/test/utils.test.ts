import { Bundle } from "../src/types";
import { addDependents, assert, resolveBundle } from "../src/utils";

describe("utils", () => {
  describe("assert", () => {
    test("no error", () => {
      const noError = true;
      expect(() => assert(noError, Error("test"))).not.toThrow();
    });
    test("an error", () => {
      const noError = false;
      expect(() => assert(noError, Error("test"))).toThrowError("test");
    });
  });
  describe("resolveBundle", () => {
    test("exception", () => {
      expect(resolveBundle([], "bundles/userModal/path/to/file")).toBe(
        "bundles/userModal"
      );
    });
    test("actual bundle", () => {
      expect(
        resolveBundle(
          [{ importName: "bundles/test" } as Bundle],
          "bundles/test/path/to/file"
        )
      ).toBe("bundles/test");
    });
  });
  describe("addDependents", () => {
    const bundles = [
      {
        importName: "bundle/a",
        dependencies: ["bundle/b"],
        dependents: [] as string[]
      } as Bundle,
      {
        importName: "bundle/b",
        dependencies: [] as string[],
        dependents: [] as string[]
      } as Bundle
    ];
    addDependents(bundles);
    expect(bundles[1].dependents).toEqual(["bundle/a"]);
  });
});
