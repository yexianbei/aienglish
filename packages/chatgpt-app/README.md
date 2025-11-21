# ChatGPT App 集成

这个目录包含了 AI English Learning App 与 ChatGPT 集成所需的配置文件和代码。

## 📋 集成说明

### 1. OpenAI Apps SDK 集成方式

目前 OpenAI Apps SDK 处于预览阶段，集成方式可能包括：

- **方式 A：作为 ChatGPT 插件/App**
  - 用户在 ChatGPT 中安装你的 App
  - App 通过 iframe 嵌入到 ChatGPT 界面
  - 可以访问聊天上下文

- **方式 B：通过按钮触发**
  - 在聊天消息旁边显示"加入生词本"按钮
  - 用户点击后打开你的 App 界面
  - 传递消息内容给你的应用

### 2. 工作流程

```
┌─────────────────────────────────────────┐
│         ChatGPT 聊天界面                 │
│                                         │
│  用户: "翻译 procrastinate"              │
│  AI: "拖延、耽搁 v. ..."                │
│                                         │
│  [📝 加入生词本] ← 触发按钮              │
└─────────────────────────────────────────┘
              ↓ 点击
┌─────────────────────────────────────────┐
│       你的 App (iframe 或新窗口)         │
│                                         │
│  接收到的上下文：                        │
│  - 单词: "procrastinate"                │
│  - AI 回复: "拖延、耽搁 v. ..."          │
│                                         │
│  ┌─────────────────────────┐           │
│  │  你掌握这个单词吗？      │           │
│  │  [😰不认识] [🤔模糊] [✅掌握] │       │
│  └─────────────────────────┘           │
└─────────────────────────────────────────┘
              ↓
     保存到你的后端数据库
```

## 🔧 配置步骤

### 1. 准备 manifest.json

`manifest.json` 文件定义了你的 App 的基本信息和权限：

```json
{
  "name": "AI English Learning",
  "description": "智能英语学习助手",
  "version": "1.0.0",
  "entry_point": {
    "type": "iframe",
    "url": "https://your-domain.com/chatgpt-app"
  },
  "triggers": [
    {
      "type": "button",
      "text": "📝 加入生词本",
      "placement": ["message_actions"]
    }
  ]
}
```

### 2. 部署你的应用

你需要将前端应用部署到一个公开的 URL：

```bash
# 构建前端
cd packages/frontend
npm run build

# 部署到你的服务器或云平台
# 例如: Vercel, Netlify, AWS, etc.
```

### 3. 创建 ChatGPT App 界面

在前端项目中创建一个专门的页面用于 ChatGPT iframe 嵌入：

```tsx
// packages/frontend/src/pages/ChatGPTAppPage.tsx
import { useEffect, useState } from 'react';

export const ChatGPTAppPage = () => {
  const [context, setContext] = useState(null);

  useEffect(() => {
    // 从 URL 参数或 postMessage 接收上下文
    const params = new URLSearchParams(window.location.search);
    const contextData = params.get('context');
    if (contextData) {
      setContext(JSON.parse(contextData));
    }
  }, []);

  // 显示收集单词的界面
  return (
    <div>
      {/* 卡片式收集界面 */}
    </div>
  );
};
```

### 4. 提交到 OpenAI

1. 访问 OpenAI 开发者平台
2. 提交你的 App manifest
3. 等待审核
4. 审核通过后，用户可以在 ChatGPT 中安装你的 App

## 🚀 开发测试

在正式提交前，你可以：

1. **本地测试**: 
   - 在浏览器中直接访问你的应用
   - 模拟 ChatGPT 传递的上下文数据

2. **使用 ngrok 等工具**:
   ```bash
   ngrok http 5173
   ```
   - 获得一个公开 URL 用于测试

3. **模拟 ChatGPT 环境**:
   - 创建一个测试页面，模拟 iframe 嵌入
   - 测试 postMessage 通信

## 📚 参考资源

- [OpenAI Apps SDK 官方文档](https://openai.com/zh-Hans-CN/index/introducing-apps-in-chatgpt/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)

## ⚠️ 注意事项

1. **隐私和安全**: 确保用户数据的安全性
2. **性能优化**: iframe 应用应该快速加载
3. **响应式设计**: 适配不同的显示尺寸
4. **错误处理**: 优雅地处理网络错误和数据异常

## 🔮 未来功能

- [ ] 支持语音朗读
- [ ] 智能推荐相似单词
- [ ] 社区学习功能
- [ ] 导出学习报告

