# DeepSeek Harness Remotion 视频插件

[English](README.md) | 简体中文

这是一个独立的 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 插件，用于提供模型和用户均可调用的 `remotion-video` 技能。该技能会指导 Harness 智能体检查现有视频项目、在需要时搭建 Remotion 项目、编写由帧驱动的 React 动画、预览合成内容，并渲染经过验证的视频输出。

## 功能

- 在 Harness 的 `ctx.skills` 上注册一个技能提供方。
- 将 `remotion-video` 技能添加到 Harness 标准技能目录。
- 以 Harness bundle 形式分发，因此执行 `dsh plugin ... add` 后会自动挂载。
- 本插件只提供操作指导；文件修改、依赖安装、预览和渲染仍由 Harness 的常规工具在当前权限策略下执行。
- 不收集遥测数据、不存储凭据，也不会自行连接外部服务。

## 环境要求

- Node.js `^22.19.0` 或 `>=24.0.0`
- DeepSeek Harness，并提供 `@deepseek-ai/dsh-skill >=0.0.1-rc.1 <0.2.0`
- 如需让模型使用该技能，需要配置模型并选择标准智能体预设
- 只需在创建或编辑的视频项目中安装 Remotion 依赖

DeepSeek Harness 目前处于开发者预览阶段。本插件已使用本地 Harness `0.1.0-rc.5` 检出版本完成冒烟测试；完整验证流程请参阅[冒烟测试](docs/SMOKE_TEST.md)。

## 从 GitHub 安装

将插件安装到 Web profile：

```bash
dsh plugin --profile web add github:chenjie1129/remotion-video-plugin
```

该包声明了一个 Harness bundle，其中的 `cordis.patch.yml` 会自动插入插件配置。安装后请重新启动 Harness：

```bash
dsh web
```

使用标准预设创建新会话，然后从技能菜单中调用 `remotion-video`，或直接让模型创建或编辑 Remotion 视频。

无需启动 Harness 即可检查最终组合配置：

```bash
dsh web --dump-config
```

输出中应包含 `id: remotion-video-plugin` 和 `name: '@chenjie1129/dsh-remotion-video-plugin'`。

## 安装本地检出版本

在本仓库目录中执行：

```bash
npm install
npm run check
dsh plugin --profile web add .
```

Harness 插件命令会基于当前执行目录解析相对本地路径。

## 移除

```bash
dsh plugin --profile web remove @chenjie1129/dsh-remotion-video-plugin
```

移除后请重新启动 Harness。删除 profile 中的依赖时，对应 bundle 也会一并移除。

## 开发

```bash
npm install
npm test
npm run build
npm pack --dry-run
```

仓库文档：

- [架构与行为](docs/ARCHITECTURE.md)
- [Harness 冒烟测试](docs/SMOKE_TEST.md)
- [最新冒烟测试结果](docs/SMOKE_TEST_RESULTS.md)
- [贡献指南](CONTRIBUTING.md)
- [安全策略](SECURITY.md)

## 许可证

本插件使用 MIT 许可证。Remotion 有独立的许可证条款；用户有责任根据团队规模和使用方式确认适用条款。
