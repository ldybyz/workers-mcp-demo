# MCP Demo

这是一个使用 [Cloudflare Workers MCP](https://github.com/cloudflare/workers-mcp) 创建自定义 AI 工具的简单演示项目，这些工具可以与 Claude、Cursor 和其他支持 MCP 的 AI 助手一起使用。

## 什么是 MCP？

MCP (Model Context Protocol) 是由 [Anthropic 开源的一个标准](https://www.anthropic.com/news/model-context-protocol)，用于连接 AI 助手与数据源，包括内容仓库、业务工具和开发环境。它的目标是帮助前沿模型生成更好、更相关的回应。

本项目利用 Cloudflare Workers MCP 创建自定义工具，这些工具可以被 AI 助手访问和使用，从而扩展 AI 的能力。

## 特点

- 在 Cloudflare Workers 上运行的自定义 AI 工具
- 与 Claude、Cursor 和其他 MCP 客户端的无缝集成
- 能够通过自己的无服务器函数扩展 AI 能力

## 前提条件

- [Node.js](https://nodejs.org/) (v16 或更高版本)
- [pnpm](https://pnpm.io/installation) 包管理器
- [Cloudflare 账户](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- Claude Desktop、Cursor 或其他支持 MCP 的客户端

## 设置步骤

### 1. 克隆此仓库

```bash
git clone https://github.com/akazwz/workers-mcp-demo.git
cd workers-mcp-demo
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置你的 Cloudflare Worker

确保你已经通过 Wrangler 登录到 Cloudflare：

```bash
pnpx wrangler login
```

然后运行 MCP 设置命令：

```bash
npx workers-mcp setup
```

这将自动配置你的 Worker 以支持 MCP。

#### 免费用户配置注意事项

如果你是 Cloudflare Workers 的免费用户（非付费用户），需要修改 `wrangler.jsonc` 文件，删除或注释掉以下配置：

```jsonc
"browser": {
  "binding": "BROWSER"
}
```

这是因为 Browser Rendering API 仅适用于付费用户。删除此配置后，`screenshotURL` 和 `extractImagesFromURL` 功能将无法使用，但其他功能仍然可以正常工作。

### 4. 部署你的 Worker

```bash
pnpm run deploy
```

### 5. 配置你的 MCP 客户端

#### 对于 Claude Desktop：

运行以下命令在 Claude 中安装你的 MCP 服务器：

```bash
pnpx workers-mcp install:claude
```

#### 对于 Cursor：

在 Cursor 的 MCP 配置中添加以下内容：

```json
{
  "type": "command",
  "command": "/path/to/workers-mcp run workers-mcp-demo https://your-worker-url.workers.dev /path/to/workers-mcp-demo"
}
```

## 使用方法

配置完成后，你可以直接从 AI 助手使用你的自定义 MCP 工具。例如，在 Claude Desktop 中，你可以使用如下命令：

```
@workers-mcp-demo getRandomNumber
```

## 可用工具

此演示包括以下工具：

- `getRandomNumber`：生成一个随机数
- `generateImage`：根据文本提示创建图像
- `screenshotURL`：对指定 URL 进行截图（需要付费账户）
- `extractImagesFromURL`：从网页中提取图像（需要付费账户）

## 自定义

要添加自己的工具，编辑 `src/index.ts` 文件并向 Worker 类添加新方法。更改后，使用以下命令重新部署你的 Worker：

```bash
pnpm run deploy
```

## 故障排除

- 如果你的 AI 助手看不到你的工具，尝试重启助手。
- 如果你更改了方法名称或参数，你需要重启 AI 助手才能使更改生效。
- 检查 Cloudflare Workers 日志以查看部署中的任何错误。
- 如果使用免费账户时出现 `Error: Browser Rendering API is only available for Workers Paid plans` 错误，请参考上面的免费用户配置注意事项。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 致谢

- [Cloudflare Workers MCP](https://github.com/cloudflare/workers-mcp) 提供底层框架
- [Anthropic Model Context Protocol](https://www.anthropic.com/news/model-context-protocol) 开源的 MCP 标准
- [Cloudflare Workers](https://workers.cloudflare.com/) 提供无服务器平台 