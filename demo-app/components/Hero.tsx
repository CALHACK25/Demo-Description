"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Boxes,
  Eye,
  Zap,
  Heart
} from "lucide-react";

const coreValues = [
  {
    icon: Boxes,
    title: "Decoupling",
    description: "Dynamic pool architecture with on-demand instance creation",
    color: "text-foreground",
  },
  {
    icon: Eye,
    title: "Observability",
    description: "Detailed statistics and event-driven monitoring system",
    color: "text-foreground",
  },
  {
    icon: Zap,
    title: "Scalability",
    description: "Flexible configuration and template-based extension",
    color: "text-foreground",
  },
  {
    icon: Heart,
    title: "User Friendly",
    description: "Simple API with automatic resource management",
    color: "text-foreground",
  },
];

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center py-20 px-6 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 text-sm">
            CALHACK25 Project
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Dynamic MCP Sub-Agent
            <br />
            <span className="text-muted-foreground">Pool Architecture</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Intelligent Task Scheduling System for Cline AI Assistant
          </p>

          {/* Progress */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Project Progress</span>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </motion.div>

        {/* Core Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 border-border bg-card h-full">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className={`w-6 h-6 ${value.color}`} />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
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
