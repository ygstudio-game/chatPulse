# ⚡ Pulse - Advanced AI Chat Platform

Pulse is a high-fidelity, real-time chat application built for the **Tars Full Stack Engineer Internship Challenge**. It goes beyond the basic requirements to offer a premium, AI-powered communication experience with rich media support, real-time calling, and exceptional attention to detail.

---

## 🌟 Unique & Advanced Features (Beyond Assignment)

These features represent the "extra mile" taken to make Pulse a state-of-the-art communication tool:

- **🧠 AI Smart Replies**: Context-aware response suggestions powered by **Google Gemini 2.0 Flash**. Never get stuck on what to say next.
- **✨ AI Summarization ("Catch me up")**: Instantly summarize long chat histories into punchy bullet points using AI.
- **🎙️ Voice Notes + AI Transcription**: Record high-quality voice notes directly in the browser and get automated, real-time transcriptions.
- **� Contextual Replying**: Reply to specific messages to maintain the flow of conversation, even in busy group chats.
- **✅ Message Read Receipts**: Real-time status indicators showing if your message is **Sent**, **Delivered**, or **Read**.
- **�📞 Real-time Audio & Video Calls**: Native, low-latency calling experience powered by **LiveKit**, integrated seamlessly into the chat interface.
- **📄 Advanced Markdown Engine**: Full support for GitHub Flavored Markdown (**Bold**, *Italics*, ~~Strikethrough~~, Lists, and Links) with syntax-highlighted code blocks for developers.
- **🔐 Privacy Controls**: "Delete for Me" option to hide specific messages from your own view without affecting others.
- **🖼️ Rich Media Lightbox**: High-performance image and video previewer with download capabilities and smooth animations.
- **🌊 Premium Glassmorphic UI**: A meticulously crafted interface using **Tailwind CSS** and **Framer Motion**, featuring smooth micro-animations and theme-aware design.
- **🐳 DevOps Ready**: Fully containerized with **Docker** and **Docker Compose** for easy, consistent deployments.

---

## 🛠️ Core Features (Assignment Requirements)

Pulse covers all requirements (1-14) of the Tars coding challenge:

1.  **Authentication**: Secure sign-up/login via **Clerk** (Social & Email).
2.  **User Discovery**: Real-time user list with instant search filtering.
3.  **1-on-1 Messaging**: Private conversations with real-time **Convex subscriptions**.
4.  **Smart Timestamps**: Adaptive date/time formatting (e.g., "2:34 PM" for today, "Feb 15" for older).
5.  **Empty States**: Beautifully designed placeholders for empty chats, searches, and conversations.
6.  **Responsive Layout**: Mobile-first design with smooth transitions and a dedicated mobile chat view.
7.  **Presence Tracking**: Real-time green indicators for online/offline status.
8.  **Typing Indicators**: "Alex is typing..." animations that sync across all clients.
9.  **Unread Badges**: Real-time message counters that clear automatically when read.
10. **Smart Auto-Scroll**: Intelligent scrolling that respects user position with a "↓ New messages" button.
11. **Message Deletion**: Support for deleting your own messages (*Show "This message was deleted" in italics for all users*).
12. **Emoji Reactions**: Quick reactions (👍 ❤️ 😂 😮 😢) with real-time count updates (restricted to reacting to others).
13. **Loading/Error States**: Skeleton loaders, spinners, and graceful error handling for network issues.
14. **Group Chats**: Create multi-user groups, manage members, and chat in real-time.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion
- **Backend & Database**: Convex (Real-time syncing)
- **Authentication**: Clerk
- **AI Engine**: Google Gemini (GenAI)
- **Calling Infrastructure**: LiveKit
- **State Management**: Zustand
- **Media Storage**: Convex File Storage

---

## 📦 Getting Started

### 1. Prerequisite Keys
You will need API keys for:
- [Clerk](https://clerk.com/)
- [Convex](https://convex.dev/)
- [Google AI Studio (Gemini)](https://aistudio.google.com/)
- [LiveKit](https://livekit.io/)

### 2. Setup
```bash
# Install dependencies
npm install

# Run Convex (this will prompt for keys)
npx convex dev

# Run development server
npm run dev
```

### 3. Docker (Optional)
```bash
docker compose up --build
```

---

Built with ❤️ by **Lokesh Sunil Borole** for the **Tars Internship Coding Challenge 2026**.
