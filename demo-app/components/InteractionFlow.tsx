"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Brain,
  Send,
  Cog,
  Calendar,
  Layers,
  Factory,
  Bot,
  Code2,
  Server,
  CheckCircle2,
  Recycle,
  ArrowDown,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const flowSteps = [
  {
    step: 1,
    icon: User,
    title: "用户请求",
    description: '用户："帮我搜索 2025 年最新的 AI 发展"',
    category: "User",
  },
  {
    step: 2,
    icon: Brain,
    title: "主 Agent 决策",
    description: "主 Agent (Claude) 分析请求，决定使用 dispatch_to_subagent 工具",
    category: "Main Agent",
  },
  {
    step: 3,
    icon: Send,
    title: "调用 dispatch_to_subagent",
    description: 'dispatch_to_subagent(\n  agent_type: "perplexity",\n  task_description: "Search for latest AI developments in 2025"\n)',
    category: "Tool Call",
  },
  {
    step: 4,
    icon: Cog,
    title: "DispatchToSubagentHandler 处理",
    description: "验证参数、解析 context、调用 scheduler.execute()",
    category: "Handler",
  },
  {
    step: 5,
    icon: Calendar,
    title: "McpSubAgentScheduler 调度",
    description: "生成任务 ID、创建 SubAgentTask、调用 pool.acquire()",
    category: "Scheduler",
  },
  {
    step: 6,
    icon: Layers,
    title: "McpSubAgentPool 管理实例",
    description: "复用空闲实例 OR 创建新实例 OR 等待可用实例",
    category: "Pool",
  },
  {
    step: 7,
    icon: Bot,
    title: "McpSubAgentInstance 执行任务",
    description: "状态 IDLE → BUSY、验证权限、调用 template.execute()",
    category: "Instance",
  },
  {
    step: 8,
    icon: Code2,
    title: "PerplexityTemplate 执行",
    description: "验证权限、调用 MCP 工具 perplexity_search",
    category: "Template",
  },
  {
    step: 9,
    icon: Server,
    title: "McpHub 转发到 MCP 服务器",
    description: "连接 Perplexity MCP、调用工具、等待响应",
    category: "MCP Hub",
  },
  {
    step: 10,
    icon: Code2,
    title: "Template 格式化结果",
    description: "提取 summary、keyPoints、sources、confidence",
    category: "Template",
  },
  {
    step: 11,
    icon: Bot,
    title: "Instance 返回结果",
    description: "状态 BUSY → IDLE、更新 lastActiveTime、触发 TASK_COMPLETED",
    category: "Instance",
  },
  {
    step: 12,
    icon: Recycle,
    title: "Pool 释放实例",
    description: "复用模式：保留为 IDLE；销毁模式：立即终止",
    category: "Pool",
  },
  {
    step: 13,
    icon: Calendar,
    title: "Scheduler 返回结果",
    description: "返回 SubAgentResult { success, data, taskId, duration }",
    category: "Scheduler",
  },
  {
    step: 14,
    icon: Cog,
    title: "Handler 返回",
    description: "提取 result.result，返回给主 Agent",
    category: "Handler",
  },
  {
    step: 15,
    icon: Brain,
    title: "主 Agent 接收结果",
    description: "处理返回值，生成用户友好的回复",
    category: "Main Agent",
  },
  {
    step: 16,
    icon: CheckCircle2,
    title: "用户看到最终回复",
    description: '"根据最新搜索，2025年的AI发展包括..."',
    category: "User",
  },
];

const categoryColors: Record<string, string> = {
  User: "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
  "Main Agent": "bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-purple-100",
  "Tool Call": "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
  Handler: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
  Scheduler: "bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100",
  Pool: "bg-pink-100 text-pink-900 dark:bg-pink-900 dark:text-pink-100",
  Instance: "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100",
  Template: "bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-100",
  "MCP Hub": "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
};

export function InteractionFlow() {
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [showAll, setShowAll] = useState(false);

  const toggleStep = (step: number) => {
    setExpandedSteps((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
  };

  const displayedSteps = showAll ? flowSteps : flowSteps.slice(0, 6);

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Complete Flow
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            User Request to Response Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            16-step interaction flow from user input to final response
          </p>
        </motion.div>

        {/* Flow Steps */}
        <div className="space-y-3">
          {displayedSteps.map((step, index) => {
            const Icon = step.icon;
            const isExpanded = expandedSteps.includes(step.step);

            return (
              <div key={step.step}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-all duration-300 border-border"
                    onClick={() => toggleStep(step.step)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                            <Icon className="w-5 h-5 text-foreground" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs font-mono">
                              Step {step.step}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${categoryColors[step.category] || ""}`}
                            >
                              {step.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-base">{step.title}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="pt-0">
                          <div className="pl-14">
                            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 p-3 rounded-md">
                              {step.description}
                            </pre>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </Card>
                </motion.div>

                {/* Arrow between steps */}
                {index < displayedSteps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {flowSteps.length > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              {showAll ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show All 16 Steps
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="border-border bg-accent/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Key Features Highlighted</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground"></div>
                      <span><strong>Dynamic Creation</strong>: Instances created on-demand (Step 6)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground"></div>
                      <span><strong>Sandbox Isolation</strong>: Permission control at template level (Step 8)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground"></div>
                      <span><strong>Intelligent Scheduling</strong>: Pool manages reuse and cleanup (Steps 6, 12)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground"></div>
                      <span><strong>Event-Driven</strong>: State transitions and event emissions (Step 11)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
