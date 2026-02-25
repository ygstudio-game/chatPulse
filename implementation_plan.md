# ✍️ Pulse - Implementation Plan

This document outlines the technical implementation details of the **Pulse Chat Platform**, focusing on core algorithms, data flows, and design decisions made to exceed the base assignment requirements.

---

## 🧠 Core Feature Implementations

### 1. **AI Smart Replies (Contextual Analysis)**
To ensure high-quality suggestions, the algorithm doesn't just look at the last message.
- **Flow**:
    1. Fetch the last 10 messages of the conversation.
    2. Format into a structured transcript (Sender: Content).
    3. Prompt Gemini Pro with a specific "Assistant" persona to generate 3 short, actionable replies.
    4. Validate the response is a strict JSON array to prevent UI parsing errors.
- **Optimization**: Uses `Gemini 2.0 Flash` for the best balance of speed and contextual understanding.

### 2. **Real-time Voice Transcription**
- **Process**:
    1. Audio is recorded as a WebM blob in the browser.
    2. Uploaded to **Convex Storage**.
    3. A Convex Action is triggered, fetching the audio and sending a multimodal prompt to Gemini.
    4. The resulting transcript is saved back to the message object, triggering a reactive UI update for all participants.

### 3. **Intelligent Auto-Scroll System**
- **Logic**:
    - Users shouldn't be "snapped" to the bottom if they are reading historical messages.
    - A custom `useChatScroll` hook tracks the scroll position relative to the container height.
    - If a new message arrives and the user is within 100px of the bottom, it auto-scrolls.
    - If the user is further up, a "↓ New Messages" badge appears.

### 4. **High-Water Mark Read Receipts**
- **Strategy**:
    - Instead of updating every message (O(n) writes), each member record stores a `lastSeenMessageId`.
    - The `listMessages` query performs a client-side comparison: `isRead = message._creationTime <= member.lastSeenMessageTimestamp`.
    - This keeps the backend highly performant even in high-traffic group chats.

---

## 🗄️ Database Architecture (DSA Focus)

### **Efficient Message Deletion**
- **Global Delete**: Mark `deleted: true` on the message. The UI renders "This message was deleted" in place of the content.
- **Privacy ("Delete for Me")**: Stores a `deletedBy: string[]` array on the message. The message list query filters these out dynamically for the requesting user.
    - *Complexity*: O(k) per query where k is the number of users who deleted the message (usually 1).

### **Unread Count Denormalization**
- To avoid expensive aggregate queries on the sidebar, `unreadCount` is stored directly on the `members` record.
- It increments on every `send` mutation for all members except the sender.
- Resets to 0 upon the `markRead` mutation.

---

## 🎨 UI/UX Implementation

### **Glassmorphism Design System**
Built strictly with **Tailwind CSS**, utilizing:
- `backdrop-blur-*` for frosted glass effects on headers and sidebars.
- `bg-white/10` and `bg-slate-900/50` for theme-aware opacity.
- **CSS Variables**: For seamless switching between Light and Dark modes without flash-of-unstyled-content (FOUC).

### **Animations**
- **Framer Motion**: Used for:
    - Sidebar entry/exit.
    - Message arrival staggers.
    - Reaction badge pops.
    - Call ringing pulse effects.

---

## 🛠️ Developmental Milestone Plan

### **Phase 1: Foundation (Complete)**
- [x] Clerk Auth Integration.
- [x] Convex Schema Setup.
- [x] Responsive Sidebar & Header Layout.

### **Phase 2: Core Messaging (Complete)**
- [x] Real-time message streaming.
- [x] Group chat creation/management.
- [x] Emoji reactions & Typing indicators.

### **Phase 3: AI & Media (Complete)**
- [x] Gemini API Integration (Summarize/Replies).
- [x] File uploads to Convex Storage.
- [x] Voice notes with automated transcription.

### **Phase 4: Real-time RTC (Complete)**
- [x] LiveKit room orchestration.
- [x] Ringing & Answer/Decline flow.
- [x] Native audio/video stream handling.
