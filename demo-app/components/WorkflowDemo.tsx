"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

type Step = {
  id: number;
  title: string;
  description: string;
  status: "pending" | "active" | "completed";
};

const initialSteps: Step[] = [
  {
    id: 1,
    title: "Task Dispatched",
    description: "User requests web search via Main Agent",
    status: "pending",
  },
  {
    id: 2,
    title: "Scheduler Receives",
    description: "McpSubAgentScheduler creates task ID",
    status: "pending",
  },
  {
    id: 3,
    title: "Pool Acquires Instance",
    description: "Checking for idle Perplexity instance",
    status: "pending",
  },
  {
    id: 4,
    title: "Factory Creates Instance",
    description: "New Sub-Agent instance created",
    status: "pending",
  },
  {
    id: 5,
    title: "Task Executing",
    description: "Instance calls Perplexity MCP tools",
    status: "pending",
  },
  {
    id: 6,
    title: "Result Returned",
    description: "Search results sent back to Main Agent",
    status: "pending",
  },
];

export function WorkflowDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep >= steps.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setSteps((prev) =>
        prev.map((step, index) => {
          if (index < currentStep) {
            return { ...step, status: "completed" };
          } else if (index === currentStep) {
            return { ...step, status: "active" };
          } else {
            return { ...step, status: "pending" };
          }
        })
      );
      setCurrentStep((prev) => prev + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  const handlePlay = () => {
    if (currentStep >= steps.length) {
      handleReset();
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps(initialSteps);
  };

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
            Live Demo
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Workflow Execution
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Watch how a task flows through the system in real-time
          </p>
        </motion.div>

        {/* Demo Card */}
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Task: Web Search Request</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={isPlaying ? handlePause : handlePlay}
                  disabled={currentStep >= steps.length && !isPlaying}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="icon" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all duration-300 ${
                    step.status === "active"
                      ? "bg-accent border-foreground"
                      : step.status === "completed"
                      ? "bg-muted/50 border-border"
                      : "bg-card border-border opacity-60"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {step.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : step.status === "active" ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Loader2 className="w-5 h-5 text-foreground" />
                      </motion.div>
                    ) : (
                      <Send className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      step.status === "active"
                        ? "default"
                        : step.status === "completed"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {step.status === "completed"
                      ? "Done"
                      : step.status === "active"
                      ? "Running"
                      : "Pending"}
                  </Badge>
                </div>
              </motion.div>
            ))}

            {/* Completion Message */}
            <AnimatePresence>
              {currentStep >= steps.length && !isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-6 p-6 bg-accent rounded-lg border border-border text-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">
                    Workflow Complete!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Task executed successfully in ~9 seconds
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
