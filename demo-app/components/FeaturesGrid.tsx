"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  GitBranch,
  Lock,
  BarChart3,
  Recycle,
  Radio,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "On-Demand Creation",
    description: "Instances created only when needed, minimizing resource waste",
    benefits: ["Zero idle cost", "Fast startup", "Efficient allocation"],
  },
  {
    icon: GitBranch,
    title: "Concurrency Support",
    description: "Automatic instance scaling for parallel task execution",
    benefits: ["Multiple instances", "Load balancing", "No blocking"],
  },
  {
    icon: Lock,
    title: "Sandbox Isolation",
    description: "Each instance restricted to specific MCP services only",
    benefits: ["Security first", "Permission control", "Isolated execution"],
  },
  {
    icon: BarChart3,
    title: "Intelligent Scheduling",
    description: "Smart task routing and resource allocation",
    benefits: ["Priority queues", "Optimal routing", "Predictive scaling"],
  },
  {
    icon: Recycle,
    title: "Auto Cleanup",
    description: "Idle instances automatically terminated after timeout",
    benefits: ["Memory efficient", "Resource recovery", "Configurable TTL"],
  },
  {
    icon: Radio,
    title: "Event-Driven",
    description: "Real-time monitoring with comprehensive event system",
    benefits: ["Live updates", "Full observability", "Debug friendly"],
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Core Capabilities
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Production-ready features for intelligent task management
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 border-border h-full">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {feature.description}
                    </p>
                    <div className="space-y-2">
                      {feature.benefits.map((benefit) => (
                        <div
                          key={benefit}
                          className="flex items-center gap-2 text-xs"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-foreground"></div>
                          <span className="text-muted-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
