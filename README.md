# ⚡ Pulse - Advanced AI Chat Platform

[![Architecture Docs](https://img.shields.io/badge/Documentation-Architecture-blueviolet)](architecture.md)
[![Implementation Plan](https://img.shields.io/badge/Documentation-Implementation-green)](implementation_plan.md)
[![API Reference](https://img.shields.io/badge/Documentation-API-blue)](api_documentation.md)

Pulse is a high-fidelity, real-time chat application built for the **Tars Full Stack Engineer Internship Challenge**. It goes beyond the basic requirements to offer a premium, AI-powered communication experience with rich media support, real-time calling, and exceptional attention to detail.

---

## ✨ Unique & Advanced Features (The "Extra Mile")

These features represent the professional-grade capabilities implemented to make Pulse a state-of-the-art communication tool:

- **🧠 AI Smart Replies**: Context-aware response suggestions powered by **Google Gemini 2.0 Flash**. Never get stuck on what to say next.
- **🎙️ Voice Notes + AI Transcription**: Record high-quality voice notes directly in the browser and get automated, real-time transcriptions powered by Gemini.
- **✨ AI Summarization ("Catch me up")**: Instantly summarize long chat histories into punchy bullet points using AI.
- **📞 Real-time Audio & Video Calls**: Native, low-latency calling experience powered by **LiveKit**, integrated seamlessly into the chat interface.
- **✅ Message Read Receipts**: Real-time status indicators showing if your message is **Sent**, **Delivered**, or **Read**.
- **📄 Advanced Markdown Engine**: Full support for GitHub Flavored Markdown (**Bold**, *Italics*, ~~Strikethrough~~, Lists, and Links) with syntax-highlighted code blocks.
- **🌊 Premium Glassmorphic UI**: A meticulously crafted interface using **Tailwind CSS** and **Framer Motion**, featuring smooth micro-animations and theme-aware design.
- **🖼️ Rich Media Lightbox**: High-performance image and video previewer with download capabilities and smooth animations.
- **💬 Contextual Replying**: Reply to specific messages to maintain conversation flow in busy group chats.
- **🔐 Privacy Controls**: "Delete for Me" option and "Delete for Everyone" with persistent status indicators.
- **🐳 DevOps Ready**: Fully containerized with **Docker** and **Docker Compose** for consistent deployment.

---

## 🛠️ Assignment Requirements (1-14)

Pulse covers all requirements of the Tars coding challenge with extreme polish:

1.  **Authentication**: Secure sign-up/login via **Clerk** (Social & Email).
2.  **User Discovery**: Real-time user list with instant search filtering.
3.  **1-on-1 Messaging**: Private conversations with real-time **Convex subscriptions**.
4.  **Smart Timestamps**: Adaptive date/time formatting (e.g., "2:34 PM" for today, "Feb 15" for older).
5.  **Empty States**: Beautifully designed placeholders for empty chats, searches, and conversations.
6.  **Responsive Layout**: Mobile-first design with smooth transitions and a dedicated mobile chat view.
7.  **Presence Tracking**: Real-time indicators for online/offline status.
8.  **Typing Indicators**: Real-time "Alex is typing..." animations.
9.  **Unread Badges**: Real-time message counters that clear automatically when read.
10. **Smart Auto-Scroll**: Intelligent scrolling with a "↓ New messages" notification.
11. **Message Deletion**: Support for deleting messages with visible status for all users.
12. **Emoji Reactions**: Quick reactions (👍 ❤️ 😂 😮 😢) with real-time count updates.
13. **Loading/Error States**: Skeleton loaders and graceful error handling.
14. **Group Chats**: Create multi-user groups with real-time member management.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion
- **Backend**: Convex (Real-time syncing & Database)
- **Authentication**: Clerk
- **AI Engine**: Google Gemini 2.0 Flash
- **Calling Infrastructure**: LiveKit
- **State Management**: Zustand
- **Media Storage**: Convex File Storage

---

## 📦 Getting Started

### 1. Setup Environment
You will need API keys for Clerk, Convex, Google Gemini, and LiveKit.

### 2. Install & Run
```bash
# Install dependencies
npm install

# Run Convex (this will prompt for keys)
npx convex dev

# Run development server
npm run dev
```

### 3. Docker Deployment
```bash
docker compose up --build
```

---

Built with ❤️ by **Yadnyesh Sunil Borole** for the **Tars Internship Coding Challenge 2026**.
