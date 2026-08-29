# dsh-wsl-distro

DeepSeek Harness plugin: inject a short **current distro** note into the system prompt, plus tool **`distro_info`** (`wsl -l -v`, `os-release`).

Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 ↓](#中文)

---

## English

### Why

Default WSL distro, usernames, and home paths can differ across Ubuntu / other installs. `\\wsl$\WrongDistro\...` silently breaks opens. This plugin states the current distro and can list all distros.

### Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-distro
```

### Config

```yaml
- id: dsh-wsl-distro
  name: dsh-wsl-distro
  config:
    timeoutMs: 15000
```

### Test

```sh
npm test
```

### License

MIT

---

## 中文

### 为什么需要

多发行版时，默认 distro、用户名、家目录可能不一致，写错 `\\wsl$\发行版\...` 会打不开文件。本插件在 prompt 里标明当前发行版，并提供 `distro_info` 列出 `wsl -l -v`。

### 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-distro
```

### 许可

MIT
