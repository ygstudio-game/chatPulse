# Deployment Environment Variables

To deploy Pulse, the following environment variables must be configured in your hosting environment (Vercel, Railway, Docker, etc.).

## Clerk (Authentication)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Found in the Clerk Dashboard.
- `CLERK_SECRET_KEY`: Found in the Clerk Dashboard (required for server-side auth).

## Convex (Backend)
- `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL.
- `CONVEX_DEPLOY_KEY`: (Only needed for CI/CD deployments of Convex functions).

## LiveKit (Calling)
- `LIVEKIT_API_KEY`: Found in LiveKit Cloud or your self-hosted instance.
- `LIVEKIT_API_SECRET`: Found in LiveKit Cloud or your self-hosted instance.
- `NEXT_PUBLIC_LIVEKIT_URL`: Your LiveKit server URL (e.g., `wss://xxx.livekit.cloud`).

## AI (Smart Replies)
- `GOOGLE_GENERATIVE_AI_API_KEY`: For Gemini smart replies.
- `XAI_API_KEY`: (Optional) Fallback for Grok AI.

## Docker Build Args
If building with Docker, you must pass these as build args for Next.js static optimization:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_LIVEKIT_URL`
