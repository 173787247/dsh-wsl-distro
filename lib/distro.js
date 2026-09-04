import { readFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function currentDistro({ env = process.env } = {}) {
  return env.WSL_DISTRO_NAME || "";
}

export function readOsReleaseFields({ readFile = readFileSync } = {}) {
  try {
    const text = readFile("/etc/os-release", "utf8");
    const out = {};
    for (const line of text.split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (!m) continue;
      out[m[1]] = m[2].replace(/^"|"$/g, "");
    }
    return out;
  } catch {
    return {};
  }
}

/**
 * Parse `wsl -l -v` table text into structured rows.
 * Example line: `* Ubuntu-24.04    Running         2`
 */
export function parseWslListVerbose(raw) {
  const text = String(raw || "").replace(/\0/g, "");
  const distros = [];
  let defaultName = "";
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || /^NAME\b/i.test(trimmed) || /^-+$/.test(trimmed)) continue;
    const m = trimmed.match(/^(\*)?\s*(\S+)\s+(\S+)\s+(\d+)\s*$/);
    if (!m) continue;
    const isDefault = Boolean(m[1]);
    const name = m[2];
    const state = m[3];
    const version = Number(m[4]);
    if (isDefault) defaultName = name;
    distros.push({ name, state, version, isDefault });
  }
  return { distros, defaultName };
}

export async function listDistros({ execFileFn = execFileAsync } = {}) {
  try {
    const { stdout } = await execFileFn("wsl.exe", ["-l", "-v"], {
      encoding: "utf8",
      timeout: 10_000,
      windowsHide: true,
    });
    const raw = String(stdout || "").replace(/\0/g, "");
    const parsed = parseWslListVerbose(raw);
    return { ok: true, raw, ...parsed };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      distros: [],
      defaultName: "",
      raw: "",
    };
  }
}

export function buildDistroAdvice(info) {
  const tips = [];
  if (info.current) tips.push(`This agent is inside distro: ${info.current}`);
  else tips.push("WSL_DISTRO_NAME is unset; path mapping via \\\\wsl$\\ may be wrong.");

  const defaultName = info.list?.defaultName || "";
  if (info.current && defaultName && info.current !== defaultName) {
    tips.push(
      `Default distro is "${defaultName}" but this session is "${info.current}" — do not assume /home matches the default.`,
    );
  } else {
    tips.push("Default distro (`wsl -s`) may differ from this session — do not assume /home paths match another distro.");
  }

  tips.push("Usernames can differ across distros; prefer absolute paths.");
  tips.push(
    `Windows UNC must use this distro: \\\\wsl$\\${info.current || "<distro>"}\\… — verify with path_convert / wsl_workspace.`,
  );
  if (info.os?.PRETTY_NAME) tips.push(`os-release: ${info.os.PRETTY_NAME}`);
  const running = (info.list?.distros || []).filter((d) => /running/i.test(d.state));
  if (running.length) tips.push(`Running: ${running.map((d) => d.name).join(", ")}`);
  return tips;
}

export function formatDistroReport(info) {
  const lines = ["distro_info", `current: ${info.current || "(unknown)"}`];
  if (info.os?.PRETTY_NAME) lines.push(`os: ${info.os.PRETTY_NAME}`);
  if (info.list?.defaultName) lines.push(`default: ${info.list.defaultName}`);
  if (info.list?.distros?.length) {
    lines.push("distros:");
    for (const d of info.list.distros) {
      lines.push(
        `  ${d.isDefault ? "*" : " "} ${d.name}  ${d.state}  WSL${d.version}`,
      );
    }
  } else if (info.list?.ok && info.list.raw) {
    lines.push("--- wsl -l -v ---");
    lines.push(info.list.raw.trim());
  } else if (info.list?.error) {
    lines.push(`wsl -l: ${info.list.error}`);
  }
  for (const tip of info.advice || []) lines.push(`- ${tip}`);
  return lines.join("\n");
}
