import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDistroAdvice, formatDistroReport } from "../lib/distro.js";

describe("distro_info", () => {
  it("warns on missing distro name", () => {
    const advice = buildDistroAdvice({ current: "", os: {} });
    assert.ok(advice.some((t) => /WSL_DISTRO_NAME/i.test(t)));
  });

  it("formats", () => {
    assert.match(formatDistroReport({ current: "Ubuntu", os: { PRETTY_NAME: "Ubuntu 24.04" }, advice: ["x"] }), /Ubuntu 24.04/);
  });
});
