# Demo-Description

## 项目概述

本项目旨在为 CLINE AI 编码助手构建一个创新的可视化架构，通过 SubAgent 机制实现与 MCP (Model Context Protocol) 服务器的解耦和可观测性增强。

### 核心价值
1. **解耦性**：Main Agent 不直接处理 MCP 复杂性，通过 SubAgent 中间层隔离
2. **可观测性**：每一步操作都可追踪、可视化、可调试
3. **可扩展性**：轻松添加新的 MCP 服务，无需修改核心逻辑
4. **用户友好**：实时展示 AI 的工作流程，提升透明度和可控性

---

## 架构设计

### 1. 整体层次结构

```
┌─────────────────────────────────────────────┐
│      UI Layer (前端可视化)                   │
│  - Real-time Graph Visualization            │
│  - Interactive Hover Panels                 │
│  - Event Timeline                           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      Main Agent (CLINE 主智能体)            │
│  - Task Planning & Decision Making          │
│  - Routing to SubAgents                     │
│  - Result Aggregation                       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      SubAgent Manager (管理层)              │
│  - SubAgent Lifecycle Management            │
│  - Connection Pool Management               │
│  - Load Balancing                           │
│  - Event Broadcasting                       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      SubAgent Pool (多个 SubAgent 实例)     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │SubAgent 1│  │SubAgent 2│  │SubAgent 3│  │
│  │(FileSystem)│  │(Git)    │  │(Database)│  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      MCP Servers (实际功能服务)             │
│  - File Operations                          │
│  - Git Operations                           │
│  - Database Queries                         │
│  - Custom Tools                             │
└─────────────────────────────────────────────┘
```

---

### 2. 核心组件详细设计

#### 2.1 Main Agent (CLINE)

**职责**：
- 理解用户意图并制定任务计划
- 判断是否需要调用 MCP 服务
- 通过 SubAgent Manager 路由到对应的 SubAgent
- 聚合 SubAgent 返回的结果
- **不直接与 MCP 服务器交互**

**工作流程**：
```
用户请求 → 分析任务 → 判断需要的工具 → 路由到 SubAgent → 等待结果 → 继续决策
```

---

#### 2.2 SubAgent Manager

**职责**：
- 管理所有 SubAgent 的生命周期（创建、启动、停止、销毁）
- 维护 SubAgent 与 MCP 服务器的映射关系
- 实现连接池机制（复用连接，减少开销）
- 处理负载均衡（同类型多实例）
- 广播所有事件到 UI 层

**数据结构**：
```typescript
interface SubAgentManager {
  subagents: Map<string, SubAgent>;
  mcpConnections: Map<string, MCPConnection>;

  // 核心方法
  getOrCreateSubAgent(mcpType: string): SubAgent;
  routeToSubAgent(toolName: string, params: any): Promise<any>;
  broadcastEvent(event: AgentEvent): void;

  // 连接池管理
  connectionPool: ConnectionPool;
  scaleUp(mcpType: string): void;
  scaleDown(mcpType: string): void;
}
```

---

#### 2.3 SubAgent（核心组件）

**职责**：
- 封装一个特定的 MCP 服务器
- 维护与 MCP 服务器的持久连接
- 暴露该 MCP 服务器的所有工具
- 追踪自己的所有操作历史
- 实时广播自己的状态变化

**数据模型**：
```typescript
interface SubAgent {
  // 基本信息
  id: string;
  name: string;
  mcpServerType: "filesystem" | "git" | "database" | "custom";
  status: "idle" | "connecting" | "ready" | "executing" | "error";

  // 连接信息
  connection: {
    mcpServerUrl: string;
    connected: boolean;
    connectedAt: timestamp;
    lastPing: timestamp;
    reconnectAttempts: number;
  };

  // 工具信息
  tools: Tool[];

  // 执行历史
  executionHistory: ToolExecution[];

  // 性能指标
  metrics: {
    totalExecutions: number;
    successRate: number;
    avgDuration: number;
    lastExecuted: timestamp;
    errorCount: number;
  };

  // 核心方法
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  executeTool(toolName: string, params: any): Promise<any>;
  broadcastStatus(): void;
}
```

**状态机**：
```
IDLE (空闲)
  ↓ (Main Agent 调用)
CONNECTING (连接 MCP)
  ↓ (连接成功)
READY (已连接，等待任务)
  ↓ (收到工具调用请求)
EXECUTING (执行中)
  ├→ SUCCESS → READY
  ├→ ERROR → READY (可重试)
  └→ FATAL_ERROR → RECONNECTING
```

---

#### 2.4 Tool Execution（工具执行）

**数据模型**：
```typescript
interface ToolExecution {
  // 基本信息
  id: string;
  toolName: string;
  subagentId: string;

  // 状态
  status: "queued" | "running" | "streaming" | "completed" | "failed";

  // 输入输出
  input: {
    data: any;
    timestamp: timestamp;
    size: number;
  };

  output: {
    data: any;
    chunks: any[];  // 流式输出的分块
    timestamp: timestamp;
    size: number;
  };

  // 时间信息
  timing: {
    queuedAt: timestamp;
    startedAt: timestamp;
    completedAt: timestamp;
    duration: number;
  };

  // 错误信息
  error?: {
    message: string;
    stack: string;
    code: string;
  };
}
```

---

### 3. 数据流设计

#### 3.1 执行流程

```
┌──────────────────────────────────────────────┐
│ 1. User Request                              │
│    "读取 /src/main.py 文件"                  │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│ 2. Main Agent 分析                           │
│    - 识别需要 filesystem 工具                │
│    - 决定调用 read_file                      │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│ 3. SubAgent Manager 路由                     │
│    - 查找/创建 FileSystem SubAgent           │
│    - 检查连接状态                            │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│ 4. SubAgent 建立连接（如果未连接）           │
│    SubAgent ←→ MCP Server                    │
│    - 握手                                    │
│    - 工具列表获取                            │
│    - 状态更新: CONNECTING → READY            │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│ 5. SubAgent 执行工具                         │
│    - 记录输入参数                            │
│    - 调用 MCP 工具 read_file                 │
│    - 接收输出（可能是流式）                  │
│    - 记录输出结果                            │
│    - 广播执行状态                            │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│ 6. 返回结果给 Main Agent                     │
│    - 成功：文件内容                          │
│    - 失败：错误信息                          │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│ 7. Main Agent 继续决策                       │
│    - 处理文件内容                            │
│    - 决定下一步操作                          │
└──────────────────────────────────────────────┘
```

---

#### 3.2 状态追踪流

所有操作都会产生事件流，通过 WebSocket 实时推送到前端：

**Main Agent 层事件**：
```typescript
{
  type: "main_agent_event",
  event: "thinking" | "routing" | "waiting" | "processing",
  data: {
    message: string;
    targetSubAgent?: string;
    timestamp: number;
  }
}
```

**SubAgent 层事件**：
```typescript
{
  type: "subagent_event",
  subagentId: string;
  event: "activated" | "connecting" | "connected" | "executing" | "idle" | "error",
  data: {
    status: string;
    toolName?: string;
    connectionInfo?: object;
    timestamp: number;
  }
}
```

**Tool 层事件**：
```typescript
{
  type: "tool_event",
  subagentId: string;
  toolName: string;
  event: "called" | "executing" | "output_chunk" | "completed" | "error",
  data: {
    input?: any;
    output?: any;
    chunk?: any;
    progress?: number;
    error?: string;
    timestamp: number;
  }
}
```

---

## UI 可视化设计

### 1. 图的层次结构

```
┌──────────────────────────────────────────────────┐
│           Main Agent Graph                       │
│                                                  │
│    ┌────────┐    ┌──────┐    ┌────────┐        │
│    │ Think  │ ──→│ Route│ ──→│ Decide │         │
│    └────────┘    └───┬──┘    └────────┘        │
│                       │                          │
│                  需要 MCP 服务时                 │
└───────────────────────┼──────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ↓               ↓               ↓
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ SubAgent 1   │ │ SubAgent 2   │ │ SubAgent 3   │
│ (FileSystem) │ │ (Git)        │ │ (Database)   │
│              │ │              │ │              │
│ ○ read_file  │ │ ○ commit     │ │ ○ query      │
│ ○ write_file │ │ ○ push       │ │ ○ insert     │
│ ○ list_dir   │ │ ○ pull       │ │ ○ update     │
│ ○ delete     │ │ ○ branch     │ │ ○ delete     │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

### 2. 鼠标悬浮交互设计

#### 2.1 悬浮在 SubAgent 节点上

显示实时面板：
```
┌──────────────────────────────────────────┐
│ SubAgent: FileSystem MCP                 │
├──────────────────────────────────────────┤
│ Status: ● Executing                      │
│ Connected to: mcp-server-fs:8080         │
│ Uptime: 5m 23s                           │
├──────────────────────────────────────────┤
│ Real-time Activity Stream:               │
│                                          │
│ [12:34:01.234] Tool called: read_file    │
│   Input: {                               │
│     path: "/src/main.py"                 │
│     encoding: "utf-8"                    │
│   }                                      │
│   ⏳ Executing... (1.2s elapsed)         │
│                                          │
│ [12:33:58.456] Tool completed: list_dir  │
│   Output: ["file1.py", "file2.py", ...]  │
│   ✓ Success (120ms)                      │
│                                          │
│ [12:33:55.789] Connected to MCP Server   │
│   ✓ Handshake successful                 │
│   ✓ Tools loaded: 15                     │
├──────────────────────────────────────────┤
│ Statistics:                              │
│ • Available Tools: 15                    │
│ • Total Executions: 47                   │
│ • Success Rate: 98.7%                    │
│ • Avg Response Time: 89ms                │
└──────────────────────────────────────────┘
```

---

#### 2.2 悬浮在 Tool 节点上

显示工具执行详情：
```
┌──────────────────────────────────────────┐
│ Tool: read_file                          │
├──────────────────────────────────────────┤
│ Status: ● Executing                      │
│ Started: 12:34:01.234                    │
│ Duration: 1.2s                           │
├──────────────────────────────────────────┤
│ Input Stream:                            │
│ {                                        │
│   "path": "/src/main.py",                │
│   "encoding": "utf-8",                   │
│   "options": {                           │
│     "includeLineNumbers": true           │
│   }                                      │
│ }                                        │
├──────────────────────────────────────────┤
│ Output Stream: (streaming... 47%)        │
│ ┌────────────────────────────────────┐   │
│ │ Line 1: import os                  │   │
│ │ Line 2: import sys                 │   │
│ │ Line 3: from typing import *       │   │
│ │ ...                                │   │
│ │ ⏳ Reading (473 / 1000 lines)      │   │
│ └────────────────────────────────────┘   │
├──────────────────────────────────────────┤
│ History:                                 │
│ • Last used: 2s ago                      │
│ • Total calls today: 156                 │
│ • Avg duration: 89ms                     │
│ • Success rate: 100%                     │
└──────────────────────────────────────────┘
```

---

### 3. 视觉设计要点

#### 3.1 节点状态颜色编码

**Main Agent**：
- 🟡 Thinking: 黄色脉动动画
- 🟦 Routing: 蓝色，箭头流动动画
- ⚪ Waiting: 灰色，虚线边框
- 🟢 Processing: 绿色，实线边框

**SubAgent**：
- ⚪ Idle: 灰色，透明度 50%
- 🟠 Connecting: 橙色，加载动画
- 🟢 Ready: 绿色，实线边框
- 🔵 Executing: 蓝色，脉动动画
- 🔴 Error: 红色，抖动动画

**Tool**：
- ⚪ Queued: 白色，虚线边框
- 🔵 Running: 蓝色，进度条动画
- 🌊 Streaming: 流动渐变效果
- ✅ Completed: 绿色，勾选图标
- ❌ Failed: 红色，叉号图标

---

#### 3.2 连接线动画

**Main Agent → SubAgent**：
- 调用时：虚线流动动画（粒子从 Main → SubAgent）
- 等待时：静态虚线
- 返回时：实线流动动画（粒子从 SubAgent → Main）

**SubAgent → Tool**：
- 执行时：粒子流动效果
- 完成时：闪烁高亮一次

---

## 实时数据流机制

### 1. WebSocket 事件架构

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  - Graph Visualization (D3.js)          │
│  - Real-time Updates                    │
└───────────────┬─────────────────────────┘
                │ WebSocket
┌───────────────▼─────────────────────────┐
│      WebSocket Server                   │
│  - Event Broadcasting                   │
│  - Client Management                    │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Event Bus                       │
│  - Event Queue                          │
│  - Event Filtering                      │
│  - Event Aggregation                    │
└───────────────┬─────────────────────────┘
        ┌───────┼───────┐
        │       │       │
┌───────▼──┐ ┌──▼────┐ ┌▼────────┐
│  Main    │ │SubAgent│ │SubAgent│
│  Agent   │ │   1    │ │   2    │
└──────────┘ └───┬────┘ └─────────┘
                 │
           ┌─────▼──────┐
           │ MCP Client │
           └─────┬──────┘
                 │
           ┌─────▼──────┐
           │ MCP Server │
           └────────────┘
```

---

### 2. 事件处理流程

```typescript
// 1. SubAgent 产生事件
subAgent.executeTool("read_file", params);
  ↓
subAgent.emit("tool_executing", {
  toolName: "read_file",
  input: params,
  timestamp: Date.now()
});

// 2. Event Bus 接收并广播
eventBus.on("tool_executing", (event) => {
  // 过滤、聚合、格式化
  const formattedEvent = formatEvent(event);

  // 广播到 WebSocket
  wsServer.broadcast(formattedEvent);
});

// 3. 前端接收并更新 UI
wsClient.on("message", (event) => {
  // 更新图节点状态
  updateGraphNode(event.subagentId, event.status);

  // 更新悬浮面板（如果打开）
  if (hoveredNode === event.subagentId) {
    updateHoverPanel(event);
  }

  // 添加到事件时间线
  addToTimeline(event);
});
```

---

## 性能优化策略

### 1. SubAgent 连接池

**问题**：每次创建新连接开销大，响应慢

**方案**：
```typescript
class ConnectionPool {
  pools: Map<string, SubAgent[]>;

  // 预创建常用 MCP 服务的 SubAgent
  async initialize() {
    this.createPool("filesystem", 3);
    this.createPool("git", 2);
    this.createPool("database", 2);
  }

  // 动态扩容
  async scaleUp(mcpType: string, count: number) {
    for (let i = 0; i < count; i++) {
      const agent = await this.createSubAgent(mcpType);
      this.pools.get(mcpType).push(agent);
    }
  }

  // 空闲缩容
  async scaleDown(mcpType: string) {
    const pool = this.pools.get(mcpType);
    const idleAgents = pool.filter(a => a.isIdle() && a.idleTime > 5 * 60 * 1000);

    for (const agent of idleAgents) {
      await agent.disconnect();
      pool.splice(pool.indexOf(agent), 1);
    }
  }
}
```

---

### 2. 事件节流

**问题**：工具输出流太快（如大文件读取），UI 刷新卡顿

**方案**：
```typescript
class EventThrottler {
  buffer: Event[] = [];
  flushInterval: number = 100; // ms

  constructor() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  add(event: Event) {
    this.buffer.push(event);

    // 如果缓冲区过大，立即刷新
    if (this.buffer.length > 100) {
      this.flush();
    }
  }

  flush() {
    if (this.buffer.length === 0) return;

    // 批量发送
    wsServer.broadcast({
      type: "batch_events",
      events: this.buffer
    });

    this.buffer = [];
  }
}
```

---

### 3. 历史数据管理

**问题**：执行记录越来越多，内存爆炸

**方案**：
```typescript
class ExecutionHistoryManager {
  inMemoryLimit: number = 100;

  async addExecution(exec: ToolExecution) {
    // 添加到内存
    subAgent.executionHistory.push(exec);

    // 如果超过限制，持久化旧数据
    if (subAgent.executionHistory.length > this.inMemoryLimit) {
      const oldExecs = subAgent.executionHistory.splice(0, 50);
      await this.persistToDatabase(oldExecs);
    }
  }

  async getHistory(subAgentId: string, offset: number, limit: number) {
    // 先从内存获取
    let result = subAgent.executionHistory.slice(offset, offset + limit);

    // 如果不够，从数据库加载
    if (result.length < limit) {
      const dbResult = await this.loadFromDatabase(subAgentId, offset, limit);
      result = result.concat(dbResult);
    }

    return result;
  }
}
```

---

## 与 CLINE 的集成

### 1. CLINE 现有架构

```
CLINE (VSCode Extension)
  ├─ Webview (UI 层)
  │   ├─ Chat Interface
  │   ├─ Task Management
  │   └─ Settings
  │
  ├─ Extension Host (主逻辑)
  │   ├─ CLINE Core (AI Agent)
  │   ├─ MCP Manager (现有)
  │   ├─ File Watcher
  │   └─ Terminal Integration
  │
  └─ Language Server
      └─ Code Analysis
```

---

### 2. 集成方案

#### 方案 A：Extension Host 内集成（推荐）

```
Extension Host
  ├─ CLINE Core (现有)
  │
  ├─ SubAgent Manager (新增)
  │   ├─ SubAgent Pool
  │   ├─ Connection Pool
  │   └─ Event Bus
  │
  ├─ MCP Client Pool (新增)
  │   ├─ Filesystem MCP Client
  │   ├─ Git MCP Client
  │   └─ Custom MCP Clients
  │
  └─ Event Broadcaster (新增)
      └─ WebSocket Server
```

**优点**：
- 实现简单，无需额外进程
- 共享内存，性能好
- 便于调试

**缺点**：
- 可能影响 Extension Host 性能
- 难以独立扩展

---

#### 方案 B：独立服务（高性能场景）

```
┌──────────────────────────┐
│  CLINE Extension         │
│  (VSCode Extension Host) │
└───────────┬──────────────┘
            │ HTTP/WebSocket
┌───────────▼──────────────┐
│  SubAgent Service        │
│  (独立 Node.js 进程)      │
│                          │
│  ├─ SubAgent Manager     │
│  ├─ MCP Client Pool      │
│  ├─ Event Bus            │
│  └─ WebSocket Server     │
└──────────────────────────┘
```

**优点**：
- 解耦，不影响 Extension Host
- 可独立扩展和部署
- 支持多实例负载均衡

**缺点**：
- 实现复杂
- 需要进程间通信
- 部署和配置复杂

---

### 3. UI 可视化位置

#### 选项 1：嵌入式面板

```
┌────────────────────────────────────────┐
│  CLINE Chat Interface (现有)           │
│  [User]  你好，帮我读取文件            │
│  [CLINE] 好的，正在读取...              │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  Agent Flow (新增)                │ │
│  │                                  │ │
│  │  [Main Agent]                    │ │
│  │       ↓                          │ │
│  │  [SubAgent: FS] → read_file      │ │
│  │                                  │ │
│  │  鼠标悬浮显示详情                │ │
│  └──────────────────────────────────┘ │
└────────────────────────────────────────┘
```

---

#### 选项 2：独立侧边栏

```
┌──────────────┬───────────────────────┐
│  CLINE Chat  │  Agent Graph Panel    │
│  (现有)      │  (新增)               │
│              │                       │
│  [User]      │  ┌────────┐           │
│  你好...     │  │  Main  │           │
│              │  │  Agent │           │
│  [CLINE]     │  └───┬────┘           │
│  正在处理... │      │                │
│              │  ┌───▼────┐           │
│              │  │SubAgent│           │
│              │  │   FS   │ ● Active  │
│              │  └────────┘           │
│              │                       │
│              │  [Event Timeline]     │
│              │  12:34:01 Connected   │
│              │  12:34:02 Executing   │
└──────────────┴───────────────────────┘
```

---

## 调试和监控功能

### 1. 调试面板功能

#### 1.1 事件时间线

```
┌──────────────────────────────────────────┐
│  Event Timeline                          │
├──────────────────────────────────────────┤
│  [====|====|====|====|====]              │
│   │    │    │    │    │                  │
│   │    │    │    │    └─ Tool Completed  │
│   │    │    │    └────── Output Stream   │
│   │    │    └─────────── Tool Executing  │
│   │    └──────────────── SubAgent Ready  │
│   └───────────────────── Connected       │
│                                          │
│  Filter: [All] [Main Agent] [SubAgents]  │
│  Time Range: [Last 5 min] [Custom]       │
└──────────────────────────────────────────┘
```

---

#### 1.2 调用树

```
┌──────────────────────────────────────────┐
│  Call Tree                               │
├──────────────────────────────────────────┤
│  Main Agent                              │
│  └─ Task: Read and analyze file          │
│      ├─ SubAgent: FileSystem             │
│      │   ├─ read_file("/src/main.py")    │
│      │   │   Duration: 120ms ✓           │
│      │   └─ list_dir("/src")             │
│      │       Duration: 45ms ✓            │
│      │                                    │
│      └─ SubAgent: Git                    │
│          └─ git_status()                 │
│              Duration: 230ms ✓           │
│                                          │
│  Total Duration: 395ms                   │
│  Success Rate: 100%                      │
└──────────────────────────────────────────┘
```

---

#### 1.3 性能分析

```
┌──────────────────────────────────────────┐
│  Performance Analysis                    │
├──────────────────────────────────────────┤
│  Hot Tools (Top 5):                      │
│  1. read_file         156 calls  89ms    │
│  2. write_file         89 calls  145ms   │
│  3. list_dir           67 calls  34ms    │
│  4. git_status         45 calls  230ms   │
│  5. git_commit         23 calls  456ms   │
│                                          │
│  Slowest Operations:                     │
│  1. git_push          1.2s               │
│  2. database_query    890ms              │
│  3. git_commit        456ms              │
│                                          │
│  Bottleneck Analysis:                    │
│  ⚠ Git operations taking 60% of time    │
│  💡 Consider connection pooling          │
└──────────────────────────────────────────┘
```

---

#### 1.4 错误追踪

```
┌──────────────────────────────────────────┐
│  Error Tracking                          │
├──────────────────────────────────────────┤
│  Recent Errors (Last 24h):               │
│                                          │
│  [12:34:01] ❌ read_file failed           │
│    SubAgent: filesystem_001              │
│    Error: ENOENT: File not found        │
│    Path: /invalid/path.txt               │
│    Stack: [View Full Stack]              │
│    Retry: [Retry] [Ignore]               │
│                                          │
│  [11:20:15] ❌ git_push failed            │
│    SubAgent: git_002                     │
│    Error: Authentication failed          │
│    Remote: origin                        │
│    [View Details] [Configure Auth]       │
│                                          │
│  Error Rate: 2.3% (3 / 130 ops)          │
└──────────────────────────────────────────┘
```

---

## 实现路线图

### Phase 1: 核心架构（MVP）

**目标**：实现基础的 SubAgent 机制和简单可视化

**任务**：
1. ✅ 设计 SubAgent 数据模型
2. ⬜ 实现 SubAgent Manager
3. ⬜ 实现单个 SubAgent（以 FileSystem 为例）
4. ⬜ 集成到 CLINE Core
5. ⬜ 基础图可视化（静态）
6. ⬜ 简单状态展示

**时间**：1-2 周

---

### Phase 2: 实时交互

**目标**：鼠标悬浮显示详情，实时状态更新

**任务**：
1. ⬜ 实现 WebSocket 事件系统
2. ⬜ Event Bus 设计和实现
3. ⬜ 鼠标悬浮面板 UI
4. ⬜ 实时状态同步
5. ⬜ 基础动画效果

**时间**：1 周

---

### Phase 3: 流式输出

**目标**：支持大输出的实时显示

**任务**：
1. ⬜ 流式数据处理
2. ⬜ 进度条和百分比
3. ⬜ 输出预览窗口
4. ⬜ 事件节流优化

**时间**：1 周

---

### Phase 4: 性能和调试

**目标**：优化性能，添加调试工具

**任务**：
1. ⬜ 连接池实现
2. ⬜ 历史数据管理
3. ⬜ 事件时间线
4. ⬜ 调用树可视化
5. ⬜ 性能分析面板
6. ⬜ 错误追踪系统

**时间**：2 周

---

## 技术栈

### 后端
- **语言**：TypeScript / Node.js
- **框架**：VSCode Extension API
- **MCP 客户端**：@modelcontextprotocol/sdk
- **WebSocket**：ws
- **事件系统**：EventEmitter / EventBus

### 前端
- **框架**：React
- **图可视化**：D3.js / React Flow
- **状态管理**：Zustand / Redux
- **WebSocket 客户端**：原生 WebSocket API
- **样式**：Tailwind CSS / CSS Modules

### 数据存储
- **内存缓存**：LRU Cache
- **持久化**：SQLite（VSCode Extension 内置）
- **日志**：文件系统（结构化日志）

---

## 总结

本架构通过 SubAgent 机制实现了：

1. **解耦**：Main Agent 专注于决策，SubAgent 处理具体工具调用
2. **可观测**：每一步操作都可追踪、可视化、可调试
3. **可扩展**：轻松添加新的 MCP 服务，无需修改核心逻辑
4. **用户友好**：实时展示 AI 的工作流程，提升透明度和可控性

通过实时的图可视化和交互式面板，用户可以清晰地看到：
- AI 正在做什么
- 调用了哪些工具
- 每个工具的输入输出
- 执行时间和性能
- 错误和异常

这将显著提升 CLINE 的用户体验和开发效率。
