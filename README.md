# dsh-wsl-distro
> **Install set:** part of [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit). Prefer `KIT_SET=daily` | `llm` | `github` | `full` (see kit README). Fault tree: [TROUBLESHOOTING.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.md).


DeepSeek Harness plugin: inject a short **current distro** note into the system prompt, plus tool **`distro_info`** (`wsl -l -v`, `os-release`).

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 → README.zh.md](./README.zh.md)

---

## Why

Default WSL distro, usernames, and home paths can differ across Ubuntu / other installs. `\\wsl$\WrongDistro\...` silently breaks opens. This plugin states the current distro and can list all distros.

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-distro
```

## Config

```yaml
- id: dsh-wsl-distro
  name: dsh-wsl-distro
  config:
    timeoutMs: 15000
```

## Test

```sh
npm test
```

## License

MIT
