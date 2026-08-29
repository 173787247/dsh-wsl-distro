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

export async function listDistros({ execFileFn = execFileAsync } = {}) {
  try {
    const { stdout } = await execFileFn("wsl.exe", ["-l", "-v"], {
      encoding: "utf8",
      timeout: 10_000,
      windowsHide: true,
    });
    return { ok: true, raw: String(stdout || "").replace(/\0/g, "") };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function buildDistroAdvice(info) {
  const tips = [];
  if (info.current) tips.push(`This agent is inside distro: ${info.current}`);
  else tips.push("WSL_DISTRO_NAME is unset; path mapping via \\\\wsl$\\ may be wrong.");
  tips.push("Default distro (`wsl -s`) may differ from this session — do not assume /home paths match another distro.");
  tips.push("Usernames can differ across distros; prefer absolute paths.");
  if (info.os?.PRETTY_NAME) tips.push(`os-release: ${info.os.PRETTY_NAME}`);
  return tips;
}

export function formatDistroReport(info) {
  const lines = ["distro_info", `current: ${info.current || "(unknown)"}`];
  if (info.os?.PRETTY_NAME) lines.push(`os: ${info.os.PRETTY_NAME}`);
  if (info.list?.ok) {
    lines.push("--- wsl -l -v ---");
    lines.push(info.list.raw.trim());
  } else if (info.list?.error) {
    lines.push(`wsl -l: ${info.list.error}`);
  }
  for (const tip of info.advice || []) lines.push(`- ${tip}`);
  return lines.join("\n");
}
