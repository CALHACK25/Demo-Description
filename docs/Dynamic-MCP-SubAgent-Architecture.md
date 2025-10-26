# 动态 MCP Sub-Agent 池架构设计

> 目标：按需创建、沙盒隔离、智能调度、并发扩展、自动回收

## 核心理念
- 按需创建：只在需要时创建 Sub-Agent 实例
- 并发支持：同一 MCP 可并行多个独立实例
- 自动回收：任务完成后复用或在空闲超时后销毁
- 负载均衡：调度器智能分配任务到可用实例
- 沙盒隔离：每个实例仅可访问其允许的 MCP 服务

## 架构设计
```
┌─────────────────────────────────────────────────────────────┐
│                    主 Agent (Cline)                          │
│  - 用户交互                                                  │
│  - 任务决策                                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              McpSubAgentScheduler (调度器)                   │
│  - 接收任务请求                                              │
│  - 决定创建新实例或复用现有实例                              │
│  - 负载均衡                                                  │
└───────────┬─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│              McpSubAgentPool (实例池)                        │
│  ┌────────┬────────┬────────┬────────┐                      │
│  │ Perp-1 │ Perp-2 │ Ctx7-1 │ Fire-1 │  ←运行中的实例      │
│  │ (busy) │ (idle) │ (busy) │ (idle) │                      │
│  └────────┴────────┴────────┴────────┘                      │
│  - 管理所有 Sub-Agent 实例                                   │
│  - 实例生命周期管理（创建 / 销毁 / 复用）                    │
│  - 健康检查和超时处理                                        │
└───────────┬─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│              McpSubAgentFactory (工厂)                       │
│  - 根据 MCP 类型创建新实例                                   │
│  - 注入对应的 MCP 服务和权限                                 │
│  - 配置沙盒环境                                              │
└───────────┬─────────────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────────┐
│         动态创建的 Sub-Agent 实例                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Perplexity-1│  │ Perplexity-2│  │ Context7-1  │          │
│  │ Instance    │  │ Instance    │  │ Instance    │          │
│  │ State: Busy │  │ State: Idle │  │ State: Busy │          │
│  │ Task: #123  │  │ Task: None  │  │ Task: #456  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  - 独立运行时；仅可访问对应 MCP 服务；任务后复用或销毁        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    MCP 服务层                                 │
│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐            │
│  │Perplexity││Context7  ││Firecrawl ││Puppeteer │            │
│  └──────────┘└──────────┘└──────────┘└──────────┘            │
└──────────────────────────────────────────────────────────────┘
```

## 代码结构
```
cline/src/core/mcp-subagents/
├── McpSubAgentScheduler.ts      # 调度器（核心）
├── McpSubAgentPool.ts           # 实例池管理
├── McpSubAgentFactory.ts        # 实例工厂
├── McpSubAgentInstance.ts       # Sub-Agent 实例基类
├── McpSubAgentConfig.ts         # 配置定义
├── types.ts                     # 类型定义
│
├── templates/                   # MCP 模板（定义每种 MCP 的行为）
│   ├── PerplexityTemplate.ts
│   ├── Context7Template.ts
│   ├── FirecrawlTemplate.ts
│   └── PuppeteerTemplate.ts
│
└── docs/                        # 每个 MCP 的使用文档
    ├── PERPLEXITY_GUIDE.md
    ├── CONTEXT7_GUIDE.md
    ├── FIRECRAWL_GUIDE.md
    └── PUPPETEER_GUIDE.md
```

## 核心组件实现

### 1) Sub-Agent 实例（动态创建）
```ts
// cline/src/core/mcp-subagents/McpSubAgentInstance.ts
import { ulid } from 'ulid';
import { EventEmitter } from 'events';

export enum SubAgentState {
  IDLE = 'idle',
  BUSY = 'busy',
  TERMINATED = 'terminated',
}

export class McpSubAgentInstance extends EventEmitter {
  readonly id: string;
  readonly mcpType: McpSubAgentType; // 'perplexity' | 'context7' | ...
  readonly createdAt: number;

  private state: SubAgentState = SubAgentState.IDLE;
  private currentTask: SubAgentTask | null = null;
  private lastActiveTime: number;

  // 沙盒环境
  private mcpHub: McpHub;
  private allowedMcpServers: string[];
  private toolExecutor: ToolExecutor;
  private template: McpSubAgentTemplate;

  constructor(config: SubAgentInstanceConfig) {
    super();
    this.id = ulid();
    this.mcpType = config.mcpType;
    this.createdAt = Date.now();
    this.lastActiveTime = Date.now();

    // 只允许访问对应的 MCP 服务
    this.allowedMcpServers = [config.mcpServerName];

    // 加载模板（包含提示词和行为定义）
    this.template = McpSubAgentTemplateRegistry.get(config.mcpType);

    // 初始化工具执行器（带权限限制）
    this.toolExecutor = new ToolExecutor({
      allowedMcpServers: this.allowedMcpServers,
      isSubAgent: true,
      subAgentType: this.mcpType,
    });
  }

  isAvailable(): boolean {
    return this.state === SubAgentState.IDLE;
  }

  async execute(task: SubAgentTask): Promise<SubAgentResult> {
    if (!this.isAvailable()) throw new Error(`Sub-Agent ${this.id} is not available`);

    this.state = SubAgentState.BUSY;
    this.currentTask = task;
    this.emit('state:changed', { state: this.state, task });

    try {
      const result = await this.template.execute(task, this.toolExecutor);
      this.state = SubAgentState.IDLE;
      this.currentTask = null;
      this.lastActiveTime = Date.now();
      this.emit('task:completed', { task, result });
      return result;
    } catch (error) {
      this.state = SubAgentState.IDLE;
      this.currentTask = null;
      this.emit('task:failed', { task, error });
      throw error;
    }
  }

  terminate(): void {
    this.state = SubAgentState.TERMINATED;
    this.emit('terminated');
    this.removeAllListeners();
  }

  getInfo(): SubAgentInstanceInfo {
    return {
      id: this.id,
      mcpType: this.mcpType,
      state: this.state,
      currentTask: this.currentTask?.id || null,
      createdAt: this.createdAt,
      lastActiveTime: this.lastActiveTime,
      uptime: Date.now() - this.createdAt,
    };
  }
}
```

### 2) 实例工厂（动态创建）
```ts
// cline/src/core/mcp-subagents/McpSubAgentFactory.ts
export class McpSubAgentFactory {
  private mcpHub: McpHub;
  private templateRegistry: Map<McpSubAgentType, McpSubAgentTemplate>;

  constructor(mcpHub: McpHub) {
    this.mcpHub = mcpHub;
    this.templateRegistry = new Map();
    this.registerTemplates();
  }

  private registerTemplates(): void {
    this.templateRegistry.set('perplexity', new PerplexityTemplate());
    this.templateRegistry.set('context7', new Context7Template());
    this.templateRegistry.set('firecrawl', new FirecrawlTemplate());
    this.templateRegistry.set('puppeteer', new PuppeteerTemplate());
  }

  createInstance(mcpType: McpSubAgentType): McpSubAgentInstance {
    const template = this.templateRegistry.get(mcpType);
    if (!template) throw new Error(`Unknown MCP type: ${mcpType}`);

    const mcpServer = this.mcpHub.getServer(template.mcpServerName);
    if (!mcpServer) throw new Error(`MCP server '${template.mcpServerName}' not found`);

    const instance = new McpSubAgentInstance({
      mcpType,
      mcpServerName: template.mcpServerName,
      mcpHub: this.mcpHub,
      template,
    });

    console.log(`[Factory] Created ${mcpType} Sub-Agent instance: ${instance.id}`);
    return instance;
  }
}
```

### 3) 实例池（管理与复用）
```ts
// cline/src/core/mcp-subagents/McpSubAgentPool.ts
export interface PoolConfig {
  maxInstancesPerType: number;
  maxTotalInstances: number;
  idleTimeout: number;      // ms
  enableReuse: boolean;
}

export class McpSubAgentPool {
  private instances: Map<string, McpSubAgentInstance> = new Map();
  private factory: McpSubAgentFactory;
  private config: PoolConfig;

  constructor(factory: McpSubAgentFactory, config: PoolConfig) {
    this.factory = factory;
    this.config = config;
    this.startCleanupTimer();
  }

  async acquire(mcpType: McpSubAgentType): Promise<McpSubAgentInstance> {
    if (this.config.enableReuse) {
      const idle = this.findIdleInstance(mcpType);
      if (idle) {
        console.log(`[Pool] Reusing ${mcpType} instance: ${idle.id}`);
        return idle;
      }
    }

    if (!this.canCreateNewInstance(mcpType)) {
      return await this.waitForAvailableInstance(mcpType);
    }

    const instance = this.factory.createInstance(mcpType);
    this.instances.set(instance.id, instance);
    console.log(`[Pool] Created new ${mcpType} instance: ${instance.id}`);
    console.log(`[Pool] Current pool size: ${this.instances.size}`);

    instance.on('terminated', () => this.instances.delete(instance.id));
    return instance;
  }

  async release(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    if (!this.config.enableReuse) {
      instance.terminate();
      this.instances.delete(instanceId);
      console.log(`[Pool] Terminated instance: ${instanceId}`);
    } else {
      console.log(`[Pool] Released instance for reuse: ${instanceId}`);
    }
  }

  private findIdleInstance(mcpType: McpSubAgentType): McpSubAgentInstance | null {
    for (const inst of this.instances.values()) {
      if (inst.mcpType === mcpType && inst.isAvailable()) return inst;
    }
    return null;
  }

  private canCreateNewInstance(mcpType: McpSubAgentType): boolean {
    const totalCount = this.instances.size;
    const typeCount = this.getInstanceCountByType(mcpType);
    return (
      totalCount < this.config.maxTotalInstances &&
      typeCount < this.config.maxInstancesPerType
    );
  }

  private getInstanceCountByType(mcpType: McpSubAgentType): number {
    let count = 0;
    for (const inst of this.instances.values()) if (inst.mcpType === mcpType) count++;
    return count;
  }

  private async waitForAvailableInstance(
    mcpType: McpSubAgentType,
    timeout = 30000
  ): Promise<McpSubAgentInstance> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const inst = this.findIdleInstance(mcpType);
      if (inst) return inst;
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for available ${mcpType} Sub-Agent`);
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      for (const inst of this.instances.values()) {
        const idleTime = now - inst.getInfo().lastActiveTime;
        if (inst.isAvailable() && idleTime > this.config.idleTimeout) {
          console.log(`[Pool] Cleaning up idle instance: ${inst.id}`);
          inst.terminate();
          this.instances.delete(inst.id);
        }
      }
    }, 60000);
  }

  getPoolStats(): PoolStats {
    const stats: PoolStats = {
      totalInstances: this.instances.size,
      byType: {},
      byState: { idle: 0, busy: 0, terminated: 0 },
    };

    for (const inst of this.instances.values()) {
      const info = inst.getInfo();
      if (!stats.byType[inst.mcpType]) stats.byType[inst.mcpType] = { total: 0, idle: 0, busy: 0 } as any;
      stats.byType[inst.mcpType].total++;
      stats.byType[inst.mcpType][info.state]++;
      stats.byState[info.state]++;
    }

    return stats;
  }
}
```

### 4) 调度器（智能分配）
```ts
// cline/src/core/mcp-subagents/McpSubAgentScheduler.ts
export class McpSubAgentScheduler {
  private pool: McpSubAgentPool;
  private taskQueue: Map<string, SubAgentTask> = new Map();
  private results: Map<string, SubAgentResult> = new Map();

  constructor(pool: McpSubAgentPool) {
    this.pool = pool;
  }

  async dispatch(
    mcpType: McpSubAgentType,
    taskDesc: string,
    context?: any
  ): Promise<string> {
    const taskId = ulid();
    const task: SubAgentTask = {
      id: taskId,
      mcpType,
      description: taskDesc,
      context,
      createdAt: Date.now(),
    };

    this.taskQueue.set(taskId, task);

    this.executeTask(task).catch(error => {
      console.error(`[Scheduler] Task ${taskId} failed:`, error);
      this.results.set(taskId, { success: false, error: (error as Error).message, taskId });
    });

    return taskId;
  }

  private async executeTask(task: SubAgentTask): Promise<void> {
    console.log(`[Scheduler] Dispatching task ${task.id} to ${task.mcpType} Sub-Agent`);
    const instance = await this.pool.acquire(task.mcpType);

    try {
      const result = await instance.execute(task);
      this.results.set(task.id, { success: true, data: result, taskId: task.id, instanceId: instance.id });
      console.log(`[Scheduler] Task ${task.id} completed by instance ${instance.id}`);
    } finally {
      await this.pool.release(instance.id);
      this.taskQueue.delete(task.id);
    }
  }

  async waitForResult(taskId: string, timeout = 60000): Promise<SubAgentResult> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const result = this.results.get(taskId);
      if (result) {
        this.results.delete(taskId);
        return result;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for task ${taskId}`);
  }

  async execute(mcpType: McpSubAgentType, taskDesc: string, context?: any): Promise<SubAgentResult> {
    const taskId = await this.dispatch(mcpType, taskDesc, context);
    return await this.waitForResult(taskId);
  }

  getSchedulerStats(): SchedulerStats {
    return { pendingTasks: this.taskQueue.size, poolStats: this.pool.getPoolStats() };
  }
}
```

### 5) MCP 模板（行为定义）
```ts
// cline/src/core/mcp-subagents/templates/PerplexityTemplate.ts
export class PerplexityTemplate implements McpSubAgentTemplate {
  readonly mcpServerName = 'perplexity';

  getSystemPrompt(): string {
    return `You are a specialized research Sub-Agent powered by Perplexity AI.
## Your Capabilities
- Web search using Perplexity AI
- Real-time information retrieval
- Fact verification

## Available MCP Tools
- perplexity_search: Search the web

## Important Limitations
- You can ONLY use the Perplexity MCP server
- You CANNOT access other MCP services (Context7, Firecrawl, Puppeteer)
- You CANNOT create new sub-agents
- Focus ONLY on search and research tasks

## Guidelines
- Use precise search queries
- Cite sources with URLs
- Be concise but thorough`;
  }

  async execute(task: SubAgentTask, toolExecutor: ToolExecutor): Promise<any> {
    const result = await toolExecutor.executeMcpTool({
      server_name: 'perplexity',
      tool_name: 'perplexity_search',
      arguments: { query: task.description, mode: 'detailed' },
    });

    return { summary: result, sources: [] };
  }

  async getDocumentation(): Promise<string> {
    return await fs.readFile(path.join(__dirname, '../docs/PERPLEXITY_GUIDE.md'), 'utf-8');
  }
}
```

## 使用示例（主 Agent 调用）
```ts
// 单个任务（同步）
const result = await mcpScheduler.execute('perplexity', 'Search for latest AI developments in 2025');

// 并发任务（自动创建多个实例）
const id1 = await mcpScheduler.dispatch('perplexity', 'Task 1');
const id2 = await mcpScheduler.dispatch('perplexity', 'Task 2');
const [r1, r2] = await Promise.all([
  mcpScheduler.waitForResult(id1),
  mcpScheduler.waitForResult(id2),
]);

// 不同 MCP 并发
const tasks = await Promise.all([
  mcpScheduler.dispatch('perplexity', 'Search task'),
  mcpScheduler.dispatch('context7', 'Docs lookup'),
  mcpScheduler.dispatch('firecrawl', 'Scrape website'),
]);
```

## 配置示例
```ts
const poolConfig: PoolConfig = {
  maxInstancesPerType: 3,  // 每种 MCP 最多 3 个实例
  maxTotalInstances: 10,   // 总共最多 10 个实例
  idleTimeout: 300000,     // 5 分钟无活动后销毁
  enableReuse: true,       // 启用实例复用
};

const factory = new McpSubAgentFactory(mcpHub);
const pool = new McpSubAgentPool(factory, poolConfig);
const scheduler = new McpSubAgentScheduler(pool);
```

## 实现步骤（Roadmap）
- Phase 1: 核心框架（1–2 周）
  - 实现 `McpSubAgentInstance` 基类
  - 实现 `McpSubAgentFactory` 工厂
  - 实现 `McpSubAgentPool` 实例池
  - 实现 `McpSubAgentScheduler` 调度器
- Phase 2: MCP 模板与权限（2–3 周）
  - 实现 4 个 MCP 模板类
  - 编写每个 MCP 的使用文档
  - 配置权限控制机制（仅允许匹配的 MCP 服务）
- Phase 3: 集成与测试（1 周）
  - 单元测试
  - 并发测试
  - 负载测试

## 监控与调试
```ts
const stats = scheduler.getSchedulerStats();
console.log(`
  Pending Tasks: ${stats.pendingTasks}
  Total Instances: ${stats.poolStats.totalInstances}
  Perplexity: ${stats.poolStats.byType.perplexity?.total || 0} (${stats.poolStats.byType.perplexity?.idle || 0} idle)
  Context7: ${stats.poolStats.byType.context7?.total || 0} (${stats.poolStats.byType.context7?.idle || 0} idle)
  Firecrawl: ${stats.poolStats.byType.firecrawl?.total || 0} (${stats.poolStats.byType.firecrawl?.idle || 0} idle)
  Puppeteer: ${stats.poolStats.byType.puppeteer?.total || 0} (${stats.poolStats.byType.puppeteer?.idle || 0} idle)
`);
```

## 方案优势
- 按需创建：不浪费资源
- 自动扩展：并发时自动增加实例
- 智能复用：减少实例创建开销
- 沙盒隔离：每个实例独立且受限于对应 MCP
- 灵活配置：可调整池大小、空闲超时与复用策略

---

如需将该方案落地到现有代码库：
- 可从 `Phase 1` 开始逐步实现上述文件与接口
- 模板与类型定义建议集中在 `templates/` 与 `types.ts`
- 工具执行器需支持按 `allowedMcpServers` 做访问控制
