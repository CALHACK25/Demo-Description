import { Hero } from "@/components/Hero";
import { InteractionFlow } from "@/components/InteractionFlow";
import { ArchitectureFlow } from "@/components/ArchitectureFlow";
import { McpServersGrid } from "@/components/McpServersGrid";
import { WorkflowDemo } from "@/components/WorkflowDemo";
import { ProjectStats } from "@/components/ProjectStats";
import { FeaturesGrid } from "@/components/FeaturesGrid";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <InteractionFlow />
      <ArchitectureFlow />
      <McpServersGrid />
      <WorkflowDemo />
      <FeaturesGrid />
      <ProjectStats />

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            CALHACK25 Project - Dynamic MCP Sub-Agent Pool Architecture
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui
          </p>
        </div>
      </footer>
    </main>
  );
}
