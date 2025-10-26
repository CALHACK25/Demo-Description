"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Calendar,
  Layers,
  Factory,
  Bot,
  Server,
  ArrowDown,
} from "lucide-react";

const architectureNodes = [
  {
    id: "main-agent",
    title: "Main Agent (Cline)",
    description: "User interaction and task decision making",
    icon: User,
    badge: "Entry Point",
  },
  {
    id: "scheduler",
    title: "McpSubAgentScheduler",
    description: "Task dispatching and load balancing",
    icon: Calendar,
    badge: "Scheduler",
  },
  {
    id: "pool",
    title: "McpSubAgentPool",
    description: "Instance lifecycle management",
    icon: Layers,
    badge: "Pool Manager",
  },
  {
    id: "factory",
    title: "McpSubAgentFactory",
    description: "Dynamic instance creation",
    icon: Factory,
    badge: "Factory",
  },
  {
    id: "instances",
    title: "Sub-Agent Instances",
    description: "Independent task execution units",
    icon: Bot,
    badge: "Runtime",
  },
  {
    id: "mcp-servers",
    title: "MCP Servers",
    description: "Perplexity • Context7 • Firecrawl • Puppeteer",
    icon: Server,
    badge: "Services",
  },
];

export function ArchitectureFlow() {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Architecture
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            System Architecture
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dynamic flow from user interaction to MCP service execution
          </p>
        </motion.div>

        {/* Architecture Flow */}
        <div className="space-y-4">
          {architectureNodes.map((node, index) => {
            const Icon = node.icon;
            const isActive = activeNode === node.id;
            const isLastNode = index === architectureNodes.length - 1;

            return (
              <div key={node.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "shadow-lg border-primary scale-[1.02]"
                        : "hover:shadow-md hover:border-muted-foreground/20"
                    }`}
                    onMouseEnter={() => setActiveNode(node.id)}
                    onMouseLeave={() => setActiveNode(null)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                            <Icon className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{node.title}</CardTitle>
                          </div>
                        </div>
                        <Badge variant="secondary">{node.badge}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {node.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Arrow */}
                {!isLastNode && (
                  <div className="flex justify-center py-2">
                    <motion.div
                      animate={{
                        y: [0, 5, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowDown className="w-6 h-6 text-muted-foreground/40" />
                    </motion.div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
