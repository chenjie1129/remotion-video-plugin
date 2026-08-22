# DeepSeek Harness Remotion 视频插件

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/ci.yml)
[![Integration](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/integration.yml/badge.svg)](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/integration.yml)
[![npm](https://img.shields.io/npm/v/@chenjie1129/dsh-remotion-video-plugin.svg)](https://www.npmjs.com/package/@chenjie1129/dsh-remotion-video-plugin)
[![License: MIT](https://img.shields.io/badge/license-MIT-53d7ff.svg)](LICENSE)

为 DeepSeek Harness 提供结构化的 Remotion 工作流，以及五个限制在当前工作区内的工具，用于诊断项目、发现合成、渲染静帧和视频，并验证输出元数据。

[![Remotion 视频插件 12 秒演示](.github/assets/remotion-video-plugin-demo.gif)](.github/assets/remotion-video-plugin-demo.mp4)

**[观看 12 秒 MP4](.github/assets/remotion-video-plugin-demo.mp4)** · [复现验证结果](docs/DEMO.md)

## 安装

`0.4.0` 发布到 npm 并验证后，建议将不可变版本安装到 DeepSeek Harness Web profile：

```bash
dsh plugin --profile web add @chenjie1129/dsh-remotion-video-plugin@0.4.0
dsh web
```

在 npm 发布完成前，可使用固定的 GitHub release 标签：

```bash
dsh plugin --profile web add github:chenjie1129/remotion-video-plugin#v0.4.0
dsh web
```

创建标准智能体会话，然后输入：

> 制作一个 15 秒、16:9 的产品发布视频。先诊断项目，使用由帧驱动的动画，渲染一张代表性静帧，再渲染并验证 MP4。

## 0.4 版本包含什么

- 一个用户和模型均可调用的 `remotion-video` 技能，包含八个聚焦的规则模块。
- 产品发布、竖屏字幕和数据故事三套蓝图。
- 十个中英文 model-to-render 评估用例。
- 通过真实 Harness 工具注册表和受管子进程能力注册的五个工具。
- 包含工作区相对路径、字节数、SHA-256 摘要和标准化媒体信息的产物卡片。
- Node 22/24 检查、真实 Harness/Remotion 集成 CI，以及 npm 可信发布自动化。

| 工具 | 用途 | 写入文件 |
| --- | --- | --- |
| `remotion_doctor` | 诊断包、入口、CLI、ffprobe 和浏览器就绪情况 | 否 |
| `remotion_list_compositions` | 返回已注册的合成 ID | 否 |
| `remotion_render_still` | 渲染 PNG 或 JPEG 静帧 | 是 |
| `remotion_render_video` | 渲染视频并检查元数据 | 是 |
| `remotion_probe_output` | 返回标准化媒体元数据 | 否 |

技能和可执行工具使用两个独立的 Cordis 配置行，因此运维者可以分别停用任一能力。

## 证明与发布状态

仓库提供三种不同级别的证据：

| 证据 | 证明内容 | 当前记录 |
| --- | --- | --- |
| 单元与契约检查 | 技能生命周期、bundle 配置、规则资源、评估用例、工具 schema、参数安全、路径拒绝和产物展示 | [测试源码](tests/plugin.spec.ts) |
| 真实 Harness 探针 | 工具注册、受管子进程、项目诊断、内置 ffprobe 和已提交 MP4 的元数据 | [冒烟结果](docs/SMOKE_TEST_RESULTS.md) |
| 浏览器支持的集成测试 | 通过全部五个工具发现合成，并重新渲染静帧和视频 | [集成工作流](.github/workflows/integration.yml) |

仓库中的演示文件是真实的 H.264 渲染结果：1280×720、30 fps、约 12 秒。只有发布提交的浏览器集成工作流通过后，才能声称该版本完成了全链路证明。仅探针通过不等同于渲染工具通过。

## 环境要求与安全边界

- Node.js `^22.19.0` 或 `>=24.0.0`。
- `0.2.0` 之前的 DeepSeek Harness host 包：`dsh-skill`、`dsh-tools` 和 `dsh-subprocess`。
- 一个可信的 Remotion 项目，并在项目内安装 Remotion 依赖。
- 由运维者配置 Chrome/Chromium，或使用 Remotion 支持的浏览器获取流程。

渲染会执行所选项目的 JavaScript 和已安装依赖。工具路径限制在当前会话工作区内；命令使用固定参数数组；覆盖已有文件必须显式开启；进程输出和 props 有大小限制；取消信号会传递给受管进程树。本插件自身不收集遥测、不存储凭据、不上传媒体；但项目代码、远程素材或 Remotion 浏览器下载仍可能访问网络。详见[安全策略](SECURITY.md)与[工具契约](docs/TOOLS.md)。

## 验证、配置或移除

检查最终组合配置：

```bash
dsh --profile web --dump-config
```

输出应同时包含 `remotion-video-plugin` 和 `remotion-video-tools`。可在工具配置行设置可信浏览器：

```yaml
- id: remotion-video-tools
  name: '@chenjie1129/dsh-remotion-video-plugin/tools'
  config:
    browserExecutable: /absolute/path/to/chrome-or-chromium
    browserMode: chrome-for-testing
```

卸载 bundle 会移除两行配置；随后重启 Harness：

```bash
dsh plugin --profile web remove @chenjie1129/dsh-remotion-video-plugin
```

## 开发与发布

```bash
npm ci
npm run check
npm run release:verify
npm run test:e2e -- --probe-only
```

任何渲染行为变更还必须使用真实 Harness checkout 和获准浏览器执行完整的 `npm run test:e2e`。更多资料：[兼容性](docs/COMPATIBILITY.md)、[冒烟测试](docs/SMOKE_TEST.md)、[发布流程](docs/RELEASING.md)、[贡献指南](CONTRIBUTING.md)和[更新日志](CHANGELOG.md)。

## 项目状态与许可证

这是一个独立的社区插件，并非 DeepSeek 或 Remotion 官方项目。本插件采用 MIT 许可证。Remotion 有独立许可证条款，用户应根据团队规模和使用方式自行确认。
