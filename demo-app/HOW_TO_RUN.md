# 🚀 如何运行 Demo 网站

由于 Windows 端口监听权限限制，需要以管理员身份运行开发服务器。

---

## ✅ 方法 1：管理员模式运行（推荐）

### 步骤：

1. **以管理员身份打开 PowerShell 或 CMD**
   - 在开始菜单搜索 "PowerShell" 或 "CMD"
   - 右键点击 → 选择 **"以管理员身份运行"**

2. **导航到项目目录**
   ```powershell
   cd "C:\Users\aaron\OneDrive\桌面\CALHACK25\Demo-Description\demo-app"
   ```

3. **启动开发服务器**
   ```powershell
   npm run dev
   ```

4. **打开浏览器**
   - 访问 `http://localhost:3030`
   - 页面会自动加载

5. **查看效果** 🎉
   - Hero Section（项目介绍）
   - **NEW: 16步完整交互流程图** ⭐
   - Architecture Flow（架构图）
   - MCP Servers（4个服务器）
   - Workflow Demo（动画演示）
   - Features Grid（核心功能）
   - Project Stats（项目统计）

---

## ✅ 方法 2：查看静态构建版本

如果无法以管理员身份运行，可以直接打开构建后的 HTML 文件：

### 步骤：

1. **导航到构建目录**
   ```
   C:\Users\aaron\OneDrive\桌面\CALHACK25\Demo-Description\demo-app\.next
   ```

2. **使用任意静态服务器**
   - 例如：Python HTTP Server
   ```powershell
   python -m http.server 8000
   ```

3. **或者使用 VS Code Live Server**
   - 安装 Live Server 扩展
   - 右键 `.next` 文件夹
   - 选择 "Open with Live Server"

---

## 📝 端口说明

项目配置为使用 **localhost:3030**：
- 主机：`localhost` (而非 `0.0.0.0`)
- 端口：`3030` (避免 3000/3001 冲突)
- 配置文件：`package.json` 中的 `dev` 脚本

---

## 🐛 常见问题

### 问题 1: 仍然提示权限错误

**解决方案**：
- 确保以管理员身份运行
- 检查防火墙设置
- 尝试禁用杀毒软件

### 问题 2: 端口 3030 被占用

**解决方案**：
修改 `package.json` 中的端口号：
```json
"dev": "next dev -H localhost -p 8080"
```

### 问题 3: 构建失败

**解决方案**：
```powershell
# 删除 node_modules 和 .next
rm -r node_modules, .next

# 重新安装依赖
npm install

# 重新构建
npm run build
```

---

## 🎨 新增内容

### InteractionFlow 组件

位置：Hero 之后第一个板块

**特点**：
- ✅ 16步完整流程展示
- ✅ 可点击展开/折叠每一步
- ✅ "Show All 16 Steps" 按钮
- ✅ 彩色类别标签（User、Main Agent、Pool 等）
- ✅ 详细描述（包含代码示例）
- ✅ 关键特性总结卡片

**交互功能**：
- 点击卡片展开详细描述
- 点击按钮显示/隐藏所有步骤
- 悬停效果和动画过渡

---

## 📊 页面结构（更新后）

```
┌─────────────────────────────────┐
│  1. Hero Section                │  项目介绍 + 核心价值
├─────────────────────────────────┤
│  2. Interaction Flow   ⭐ NEW   │  16步完整流程图
├─────────────────────────────────┤
│  3. Architecture Flow           │  系统架构图
├─────────────────────────────────┤
│  4. MCP Servers Grid            │  4个 MCP 服务器
├─────────────────────────────────┤
│  5. Workflow Demo               │  动画工作流
├─────────────────────────────────┤
│  6. Features Grid               │  核心功能
├─────────────────────────────────┤
│  7. Project Stats               │  项目统计
├─────────────────────────────────┤
│  8. Footer                      │  页脚信息
└─────────────────────────────────┘
```

---

## ✨ 关键特性

### 1. 完整交互流程
- 从用户请求到最终响应的完整路径
- 16个步骤详细展示
- 包含代码示例和技术细节

### 2. 视觉设计
- shadcn/ui 风格
- 纯黑白灰配色
- 彩色类别标签（仅在流程图中）
- 流畅动画效果

### 3. 交互体验
- 可展开/折叠详情
- 显示/隐藏所有步骤
- 悬停反馈
- 响应式布局

---

## 🎯 快速启动命令

```powershell
# 完整流程（推荐首次运行）
cd "C:\Users\aaron\OneDrive\桌面\CALHACK25\Demo-Description\demo-app"
npm install
npm run build
npm run dev

# 快速启动（依赖已安装）
cd "C:\Users\aaron\OneDrive\桌面\CALHACK25\Demo-Description\demo-app"
npm run dev
```

---

## 📚 相关文档

- **README.md** - 项目文档
- **PROJECT_SUMMARY.md** - 项目总结
- **DEMO_DESCRIPTION.md** - Demo 描述（上级目录）
- **IMPLEMENTATION_SUMMARY.md** - 实现总结（上级目录）

---

**祝您使用愉快！** 🎉

如有问题，请参考上述故障排除指南或查阅项目文档。
