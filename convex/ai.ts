import { v } from "convex/values";
import { action, internalAction, internalQuery, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { GoogleGenAI } from "@google/genai";

export const getConversationHistory = internalQuery({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args): Promise<string> => {
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .order("desc")
            .take(30);

        // FIX 1: Spread into a new array [...messages] before reversing!
        // This prevents the runtime crash from mutating a frozen Convex array.
        const formatted = await Promise.all(
            [...messages].reverse().map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);
                return `${sender?.name || "Unknown"}: ${msg.content}`;
            })
        );

        return formatted.join("\n");
    },
});

export const transcribeAudio = internalAction({
    args: {
        fileId: v.id("_storage"),
        messageId: v.id("messages"),
    },
    handler: async (ctx, args) => {
        try {
            const fileUrl = await ctx.storage.getUrl(args.fileId);
            if (!fileUrl) throw new Error("File not found");

            // Fetch the audio file
            const response = await fetch(fileUrl);
            const blob = await response.blob();

            // Convert to base64
            const arrayBuffer = await blob.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString('base64');

            const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("Missing Gemini API Key in environment variables.");

            const ai = new GoogleGenAI({ apiKey });

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: 'Please transcribe the following audio file. Return ONLY the raw transcription text without any markdown or extra commentary.' },
                            {
                                inlineData: {
                                    mimeType: blob.type || 'audio/webm',
                                    data: base64Data
                                }
                            }
                        ]
                    }
                ]
            });

            const transcript = result.text;

            if (transcript) {
                // Update the message with the transcript via a mutation
                await ctx.runMutation(internal.messages.updateTranscript, {
                    messageId: args.messageId,
                    transcript: transcript.trim()
                });
            }

        } catch (error) {
            console.error("Transcription failed:", error);
            // Non-fatal, we just don't have a transcript
            await ctx.runMutation(internal.messages.updateTranscript, {
                messageId: args.messageId,
                transcript: "Transcription unavailable."
            });
        }
    },
});

export const summarize = action({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args): Promise<string> => {
        // Ensure this file is actually named `ai.ts` so `internal.ai` resolves correctly.
        const history: string = await ctx.runQuery(internal.ai.getConversationHistory, {
            conversationId: args.conversationId,
        });

        if (!history || history.trim().length === 0) {
            return "Not enough message history to summarize.";
        }

        // FIX 2: Corrected "GOGGLE" typo to "GOOGLE"
        const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Missing Gemini API Key in environment variables.");
        }

        const prompt: string = `Summarize the following chat conversation in exactly 3 short, punchy bullet points. Focus only on the main takeaways.\n\nConversation:\n${history}`;

        try {
            // FIX 3: Ensured a stable model version endpoint. 
            const response: Response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 5000,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Gemini API Error:", errorText);
                return "Failed to generate summary due to an API error.";
            }

            const data: any = await response.json();
            const summaryText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            return summaryText || "No summary generated.";
        } catch (error) {
            console.error("Action error:", error);
            return "An error occurred while calling the AI model.";
        }
    },
});

export const getSmartReplies = action({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args): Promise<string[]> => {
        const history: string = await ctx.runQuery(internal.ai.getConversationHistory, {
            conversationId: args.conversationId,
        });

        if (!history || history.trim().length === 0) return [];

        const prompt = `You are a helpful chat assistant. Based on the conversation history below, provide exactly 3 short, conversational "smart reply" buttons for the user. 
Replies should be brief (1-4 words) and highly relevant to the last message sent.
Output MUST be a strict JSON array of 3 strings.

History:
${history.split("\n").slice(-8).join("\n")}

Respond ONLY with the JSON array:`;

        console.log("Generating smart replies for history snippet:", history.split("\n").slice(-3).join(" | "));

        // Attempt 1: Gemini
        try {
            const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                    const parsed = parseAIArray(text);
                    if (parsed.length > 0) return parsed;
                }
            } else {
                console.error("Gemini API Error:", await response.text());
            }
        } catch (e) {
            console.error("Gemini failed, falling back to Grok:", e);
        }

        // Attempt 2: Grok (xAI) Fallback
        try {
            const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
            if (grokKey) {
                const response = await fetch("https://api.x.ai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${grokKey}`,
                    },
                    body: JSON.stringify({
                        model: "grok-beta",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data?.choices?.[0]?.message?.content;
                    if (text) {
                        const parsed = parseAIArray(text);
                        if (parsed.length > 0) return parsed;
                    }
                }
            }
        } catch (e) {
            console.error("Grok failed as well:", e);
        }

        return ["Got it!", "Thanks!", "Talk soon!"]; // Static fallback
    },
});

function parseAIArray(text: string): string[] {
    try {
        // Find JSON array pattern in text
        const match = text.match(/\[.*\]/s);
        if (match) {
            const arr = JSON.parse(match[0]);
            if (Array.isArray(arr)) return arr.slice(0, 3);
        }
    } catch (e) {
        console.error("Failed to parse AI response:", text);
    }
    return [];
}