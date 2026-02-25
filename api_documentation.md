# 📋 Pulse - API Documentation

The Pulse backend is powered by **Convex**, a real-time serverless platform. All endpoints listed below are either **Queries** (read-only, real-time), **Mutations** (state-changing), or **Actions** (for side effects like AI calls).

---

## 🔐 Authentication
Authentication is managed via **Clerk**. Every request must include a valid Clerk JWT token in the Authorization header.

| Method | Function | Type | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `users:storeUser` | Mutation | Syncs Clerk identity with the Convex database. |
| `GET` | `users:getMe` | Query | Returns the currently authenticated user's profile. |

---

## 💬 Conversations
Manages both private 1-on-1 chats and group conversations.

| Method | Function | Type | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `conversations:getOrCreateConversation` | Mutation | Retrieves or creates a 1-on-1 chat with another user. |
| `POST` | `conversations:createGroup` | Mutation | Creates a new group chat with name and member list. |
| `GET` | `conversations:listConversations` | Query | Lists all active conversations for the current user. |
| `POST` | `conversations:markRead` | Mutation | Updates the read status and resets unread counts. |
| `POST` | `conversations:leaveGroup` | Mutation | Removes the current user from a group chat. |

---

## ✉️ Messaging
The core engine for message delivery and media handling.

| Method | Function | Type | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `messages:send` | Mutation | Sends a text or media message. Supports replies. |
| `GET` | `messages:list` | Query | Retrieves paginated messages for a conversation. |
| `PATCH` | `messages:updateMedia` | Mutation | Link storage IDs to message records after upload. |
| `POST` | `messages:deleteMessage` | Mutation | "Delete for everyone" (Sender only). |
| `POST` | `messages:deleteForMe` | Mutation | Hide a message from the current user's view. |
| `POST` | `messages:addReaction` | Mutation | Toggle an emoji reaction on a message. |

---

## 🧠 AI Services
Integrations with Google Gemini 2.0 Flash for intelligent features.

| Method | Function | Type | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `ai:summarize` | Action | Generates a 3-point summary of recent chat history. |
| `POST` | `ai:getSmartReplies` | Action | Returns 3 contextually relevant reply suggestions. |
| `POST` | `ai:transcribeAudio` | Action | (Internal) Transcribes voice notes into text. |

---

## 📞 Calling (RTC)
State management for LiveKit-powered audio/video calls.

| Method | Function | Type | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `conversations:startCall` | Mutation | Initiates a call and sets state to 'ringing'. |
| `POST` | `conversations:acceptCall` | Mutation | Updates call state to 'accepted' for RTC connection. |
| `POST` | `conversations:declineCall` | Mutation | Ends/Declines the ongoing call session. |
| `GET` | `conversations:getOngoingCall` | Query | Real-time status of incoming or outgoing calls. |

---

## ⌨️ Presence & Typing
Providing immediate feedback on user activity.

| Method | Function | Type | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `users:updatePresence` | Mutation | Toggles 'online' status (heartbeat). |
| `POST` | `typing:startTyping` | Mutation | Broadcasts that the current user is typing. |
| `GET` | `typing:getTyping` | Query | Lists users currently typing in a conversation. |
| `POST` | `typing:stopTyping` | Mutation | Manually clears the typing indicator. |
