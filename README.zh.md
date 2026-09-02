# dsh-wsl-distro
> **套件安装：** 见 [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)。推荐 `KIT_SET=daily` | `llm` | `github` | `full`。故障树：[TROUBLESHOOTING.zh.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.zh.md)。


DeepSeek Harness 插件：往 system prompt 注入一小段**当前发行版**说明，并提供工具 **`distro_info`**（`wsl -l -v`、`os-release`）。

属于 **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**。

[English → README.md](./README.md)

---

## 为什么需要

默认 WSL 发行版、用户名、家目录在 Ubuntu / 其它安装之间可能不一致。写错 `\\wsl$\WrongDistro\...` 会静默打不开文件。本插件在 prompt 里标明当前发行版，并可用 `distro_info` 列出全部发行版。

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-distro
```

## 配置

```yaml
- id: dsh-wsl-distro
  name: dsh-wsl-distro
  config:
    timeoutMs: 15000
```

## 测试

```sh
npm test
```

## 许可

MIT
