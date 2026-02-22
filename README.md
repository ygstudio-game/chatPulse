# Pulse - Advanced AI Chat Platform

Pulse is a high-fidelity, real-time chat application built with **Next.js**, **Convex**, and **Clerk**, featuring advanced AI capabilities and rich media support.

## ✨ Features

- **AI Smart Replies**: Context-aware suggestions powered by Gemini 2.0 Flash.
- **Voice Notes**: Native browser recording with AI-powered transcription.
- **Rich Media**: High-performance image, video, and PDF rendering with background uploads.
- **Group Chats**: Real-time group creation and management.
- **Real-time Calls**: Audio and video calling integrated via LiveKit.
- **Mobile-First**: Fully responsive, glassmorphic UI optimized for all devices.
- **Themes**: Premium Light and Dark modes with automatic synchronization.

## 🚀 Getting Started

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.local.example` to `.env.local` (or see `DEPLOYMENT.md`).

3. **Run Convex Dev**:
   ```bash
   npx convex dev
   ```

4. **Start Next.js**:
   ```bash
   npm run dev
   ```

### Docker Deployment

Pulse is ready for containerized deployment.

1. **Build and Run**:
   ```bash
   docker compose up --build
   ```

2. **Manual Build**:
   ```bash
   docker build -t pulse-app .
   ```

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Database/Backend**: Convex
- **Auth**: Clerk
- **AI**: Google Gemini (GenAI)
- **Calling**: LiveKit
- **Styling**: Tailwind CSS + Framer Motion
- **State**: Zustand

---
Built with ❤️ during the Tars Coding Assignment.

