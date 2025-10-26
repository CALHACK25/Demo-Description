"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  FileText,
  Package,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    icon: Code2,
    value: "2,500+",
    label: "Lines of Code",
    description: "Core implementation",
    color: "text-foreground",
  },
  {
    icon: FileText,
    value: "2,000+",
    label: "Documentation",
    description: "Detailed guides",
    color: "text-foreground",
  },
  {
    icon: Package,
    value: "12",
    label: "Components",
    description: "Modular architecture",
    color: "text-foreground",
  },
  {
    icon: TrendingUp,
    value: "75%",
    label: "Complete",
    description: "Ready for integration",
    color: "text-foreground",
  },
];

export function ProjectStats() {
  return (
    <section className="py-20 px-6 bg-muted/30">
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
            Progress
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Project Statistics
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Production-grade implementation with comprehensive documentation
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 border-border text-center h-full">
                  <CardContent className="p-8">
                    <div className="mb-4 flex justify-center">
                      <div className="w-14 h-14 rounded-lg bg-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">{stat.value}</h3>
                    <p className="text-sm font-semibold mb-1">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
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
