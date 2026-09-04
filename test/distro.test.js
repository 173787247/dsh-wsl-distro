import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDistroAdvice,
  formatDistroReport,
  parseWslListVerbose,
} from "../lib/distro.js";

describe("parseWslListVerbose", () => {
  it("parses default star and versions", () => {
    const sample = `
  NAME              STATE           VERSION
* Ubuntu-24.04      Running         2
  docker-desktop    Stopped         2
`;
    const { distros, defaultName } = parseWslListVerbose(sample);
    assert.equal(defaultName, "Ubuntu-24.04");
    assert.equal(distros.length, 2);
    assert.equal(distros[0].isDefault, true);
    assert.equal(distros[0].version, 2);
    assert.equal(distros[1].name, "docker-desktop");
  });
});

describe("buildDistroAdvice", () => {
  it("warns current vs default mismatch", () => {
    const tips = buildDistroAdvice({
      current: "Ubuntu-24.04",
      os: { PRETTY_NAME: "Ubuntu 24.04" },
      list: {
        defaultName: "docker-desktop",
        distros: [
          { name: "Ubuntu-24.04", state: "Running", version: 2, isDefault: false },
          { name: "docker-desktop", state: "Stopped", version: 2, isDefault: true },
        ],
      },
    });
    assert.ok(tips.some((t) => /Default distro is "docker-desktop"/i.test(t)));
    assert.ok(tips.some((t) => /wsl\$\\Ubuntu-24.04/i.test(t)));
  });
});

describe("formatDistroReport", () => {
  it("prints structured distros", () => {
    const text = formatDistroReport({
      current: "Ubuntu-24.04",
      list: {
        defaultName: "Ubuntu-24.04",
        distros: [{ name: "Ubuntu-24.04", state: "Running", version: 2, isDefault: true }],
      },
      advice: ["tip"],
    });
    assert.match(text, /\* Ubuntu-24.04/);
    assert.match(text, /tip/);
  });
});
