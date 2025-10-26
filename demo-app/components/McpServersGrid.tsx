"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  BookOpen,
  Globe,
  Monitor,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const mcpServers = [
  {
    name: "Perplexity",
    version: "0.2.2",
    icon: Search,
    description: "Web search and AI-powered research",
    features: ["Real-time search", "Fact verification", "Source citation"],
    status: "built",
    apiKeyRequired: true,
    color: "text-foreground",
  },
  {
    name: "Context7",
    version: "1.0.0",
    icon: BookOpen,
    description: "4000+ library documentation query",
    features: ["Doc access", "Code examples", "API reference"],
    status: "built",
    apiKeyRequired: true,
    color: "text-foreground",
  },
  {
    name: "Firecrawl",
    version: "3.5.2",
    icon: Globe,
    description: "Web scraping and data extraction",
    features: ["Content extraction", "Deep crawling", "Markdown conversion"],
    status: "built",
    apiKeyRequired: true,
    color: "text-foreground",
  },
  {
    name: "Puppeteer",
    version: "23.11.1",
    icon: Monitor,
    description: "Browser automation and control",
    features: ["Browser control", "Screenshots", "Form interaction"],
    status: "installed",
    apiKeyRequired: false,
    color: "text-foreground",
  },
];

export function McpServersGrid() {
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
            MCP Servers
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Integrated Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            4 powerful MCP servers locally installed and ready to serve
          </p>
        </motion.div>

        {/* Servers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mcpServers.map((server, index) => {
            const Icon = server.icon;
            return (
              <motion.div
                key={server.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 h-full border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Icon className={`w-6 h-6 ${server.color}`} />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={server.status === "built" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {server.status === "built" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Built
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Installed
                            </>
                          )}
                        </Badge>
                        {server.apiKeyRequired && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            API Key
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl mb-1">{server.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">v{server.version}</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {server.description}
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Key Features:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {server.features.map((feature) => (
                          <Badge
                            key={feature}
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Card className="inline-block">
            <CardContent className="p-6">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-3xl font-bold">27</p>
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div>
                  <p className="text-3xl font-bold text-green-600">24</p>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
                <div className="h-12 w-px bg-border"></div>
                <div>
                  <p className="text-3xl font-bold">88.9%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
