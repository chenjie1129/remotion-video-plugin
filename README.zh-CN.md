# DeepSeek Harness Remotion 视频插件

[English](README.md) | [简体中文](README.zh-CN.md)

[![CI](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/chenjie1129/remotion-video-plugin/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-53d7ff.svg)](LICENSE)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-0.1.0--rc.5-9e7bff.svg)](docs/SMOKE_TEST_RESULTS.md)

为 DeepSeek Harness 添加一套可复现的 [Remotion](https://www.remotion.dev/) 视频创建流程：检查项目、编写由帧驱动的 React 动画、预览效果，并渲染经过验证的视频输出。

[![Remotion 视频插件 12 秒演示](.github/assets/remotion-video-plugin-demo.gif)](.github/assets/remotion-video-plugin-demo.mp4)

**[观看 12 秒 MP4](.github/assets/remotion-video-plugin-demo.mp4)** · [了解如何复现验证结果](docs/DEMO.md)

## 快速开始

将插件安装到 DeepSeek Harness 的 Web profile：

```bash
dsh plugin --profile web add github:chenjie1129/remotion-video-plugin
dsh web
```

使用标准智能体预设创建新会话，从技能菜单选择 `remotion-video`，或者直接输入：

> 为我的产品制作一个 15 秒、16:9 的发布视频。使用由帧驱动的动画，先展示预览，通过检查后再渲染 MP4。

还可以尝试：

- “把这些截图和文案制作成精致的 Remotion 产品演示视频。”
- “改进这个现有 Remotion 合成的节奏和文字动画。”
- “先渲染一张代表性静帧并检查，通过后再渲染完整视频。”

## 插件提供什么

- 在 Harness 标准技能目录中添加模型和用户均可调用的 `remotion-video` 技能。
- 提供项目检查、Remotion 脚手架、合成、帧驱动动画、媒体处理、预览、渲染和输出验证指导。
- 以 Harness bundle 形式分发，执行 `dsh plugin ... add` 后会自动挂载。
- 遵守 Harness 当前权限策略：文件修改、依赖安装、预览和渲染均由常规 Harness 工具执行。

本插件不收集遥测数据、不存储凭据、不上传媒体，也不会自行连接外部服务。

## 有效性证明

| 检查项 | 结果 | 证据 |
| --- | --- | --- |
| 插件单元测试 | 2/2 通过 | [测试源码](tests/plugin.spec.ts) |
| Harness bundle 安装 | 通过 | [冒烟测试结果](docs/SMOKE_TEST_RESULTS.md) |
| Harness 最终组合配置 | 插件已挂载并启用 | [冒烟测试流程](docs/SMOKE_TEST.md) |
| 演示源码检查 | ESLint 与 TypeScript 通过 | [可复现演示](demo/) |
| 真实视频渲染 | H.264、1280×720、30 fps、约 12 秒 | [MP4](.github/assets/remotion-video-plugin-demo.mp4) |
| 包安全边界 | 不访问运行时服务或凭据 | [安全策略](SECURITY.md) |

## 环境要求

- Node.js `^22.19.0` 或 `>=24.0.0`
- DeepSeek Harness，并提供 `@deepseek-ai/dsh-skill >=0.0.1-rc.1 <0.2.0`
- 如需让模型使用该技能，需要配置模型并选择标准智能体预设
- 只需在创建或编辑的视频项目中安装 Remotion 依赖

DeepSeek Harness 目前处于开发者预览阶段。已记录的冒烟测试使用 Harness `0.1.0-rc.5`。

## 验证或移除

无需启动 Harness 即可检查最终组合配置：

```bash
dsh web --dump-config
```

输出中应包含 `id: remotion-video-plugin` 和 `name: '@chenjie1129/dsh-remotion-video-plugin'`。

移除插件：

```bash
dsh plugin --profile web remove @chenjie1129/dsh-remotion-video-plugin
```

安装或移除后请重新启动 Harness。

## 开发

```bash
npm install
npm run check
dsh plugin --profile web add .
```

如需复现宣传视频，请按照 [demo/README.md](demo/README.md) 操作。

更多文档：[架构说明](docs/ARCHITECTURE.md) · [冒烟测试](docs/SMOKE_TEST.md) · [贡献指南](CONTRIBUTING.md) · [更新日志](CHANGELOG.md)

## 项目状态与许可证

这是一个独立的社区插件，并非 DeepSeek 或 Remotion 官方项目。本插件采用 MIT 许可证。Remotion 有独立的许可证条款；用户有责任根据团队规模和使用方式确认适用条款。
