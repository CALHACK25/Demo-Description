# Dynamic MCP Sub-Agent Pool Architecture

> **CALHACK25 Project** - Interactive demonstration website showcasing the intelligent task scheduling system for Cline AI Assistant

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-latest-black)

## Overview

This website provides an interactive, visually stunning demonstration of the **Dynamic MCP Sub-Agent Pool Architecture** - a production-grade system built for Cline AI Assistant that enables:

- **On-Demand Creation**: Dynamic instance creation only when needed
- **Concurrency Support**: Automatic scaling for parallel tasks
- **Sandbox Isolation**: Security-first permission control
- **Intelligent Scheduling**: Smart task routing and load balancing
- **Auto Cleanup**: Resource-efficient automatic instance termination
- **Event-Driven**: Real-time monitoring and observability

## Features

### Interactive Sections

1. **Hero Section** - Project overview with core values and real-time progress indicator
2. **Architecture Flow** - Interactive system architecture diagram with animated flow
3. **MCP Servers Showcase** - 4 integrated MCP servers with status and capabilities
4. **Live Workflow Demo** - Animated task execution with play/pause controls
5. **Core Features Grid** - 6 key capabilities with detailed benefits
6. **Project Statistics** - Code metrics and completion status

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Alternative Ports

If port 3000 is occupied:

```bash
# Use port 3001
npm run dev -- -p 3001

# Use port 8080
npm run dev -- -p 8080
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Format code
npm run format
```

## Project Structure

```
demo-app/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── Hero.tsx            # Hero section
│   ├── ArchitectureFlow.tsx # Architecture diagram
│   ├── McpServersGrid.tsx  # MCP servers
│   ├── WorkflowDemo.tsx    # Workflow demo
│   ├── ProjectStats.tsx    # Statistics
│   └── FeaturesGrid.tsx    # Features
└── lib/
    └── utils.ts            # Utilities
```

## Design System (shadcn/ui)

This project uses shadcn/ui's neutral color palette with no gradients:

- Clean, minimal card-based design
- Subtle shadows and borders
- Smooth animations and transitions
- Clear visual hierarchy
- Accessible by default

## Build & Deploy

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Related Documentation

- [CALHACK25 Main Project](../../)
- [Architecture Design](../docs/Dynamic-MCP-SubAgent-Architecture.md)
- [Implementation Summary](../../IMPLEMENTATION_SUMMARY.md)
- [Demo Description](../../DEMO_DESCRIPTION.md)

## Performance

- ✅ Build Time: ~2.5 seconds (Turbopack)
- ✅ TypeScript strict mode enabled
- ✅ Zero runtime errors
- ✅ Optimized bundle size

---

**Built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui**
