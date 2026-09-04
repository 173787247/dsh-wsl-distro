import { detectWsl } from "./lib/wsl-host.js";
import {
  buildDistroAdvice,
  currentDistro,
  formatDistroReport,
  listDistros,
  readOsReleaseFields,
} from "./lib/distro.js";

export const name = "dsh-wsl-distro";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  const timeoutMs = positive(config.timeoutMs, 15_000);
  const wsl = detectWsl();
  const current = currentDistro();
  const os = readOsReleaseFields();

  ctx.systemPrompt.section({
    name: "wsl-distro",
    order: 14,
    text: [
      current
        ? `You are running inside WSL distro "${current}"${os.PRETTY_NAME ? ` (${os.PRETTY_NAME})` : ""}.`
        : "WSL distro name is unknown; verify before writing \\\\wsl$\\ paths.",
      "Other installed distros may have different users and home directories. Use distro_info when unsure.",
    ].join(" "),
  });

  ctx.tools.register({
    name: "distro_info",
    description: "Show current WSL distro, os-release, and wsl.exe -l -v listing to avoid cross-distro path mistakes.",
    parameters: { type: "object", additionalProperties: false, properties: {} },
    output: {
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          wsl: { type: "boolean" },
          current: { type: "string" },
          os: { type: "object", additionalProperties: true },
          list: { type: "object", additionalProperties: true },
          advice: { type: "array", items: { type: "string" } },
        },
      },
      render: (_args, value) => [{ type: "text", text: formatDistroReport(value) }],
    },
    timeoutMs,
    isConcurrencySafe: () => true,
    async execute() {
      const list = wsl ? await listDistros() : { ok: false, error: "not WSL", distros: [], defaultName: "", raw: "" };
      const info = { wsl, current, os, list };
      info.advice = buildDistroAdvice(info);
      return info;
    },
    presentCall: () => ({ card: "generic", title: "Distro info" }),
    presentResult: (_args, result) => (
      result.isError
        ? { card: "generic", title: "Distro info failed", content: result.content }
        : { card: "generic", title: "Distro info", content: result.content }
    ),
  });
}

function positive(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
