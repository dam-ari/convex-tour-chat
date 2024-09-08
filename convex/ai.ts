import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY!;
const MODEL = "meta-llama/Llama-3-8b-chat-hf";
const aiUrl = "https://api.together.xyz/v1/chat/completions"
const DEFAULT_AI_MESSAGE = "I'm sorry, I don't understand that.";

export const chat = action({
    args: { messageBody: v.string() },
    handler: async (ctx, args) => {
        const messages = [
            {
                // Provide a 'system' message giving context about how to respond
                role: "system",
                content:
                    "You are a terse bot in a group chat responding to questions with 1-sentence answers.",
            },
            {
                // Pass on the chat user's message to the AI agent
                role: "user",
                content: args.messageBody,
            },
        ]

        // Send a new message.
        const response = await fetch(aiUrl, {
            method: "POST",
            headers: {
                // Set the Authorization header with the API key
                Authorization: `Bearer ${TOGETHER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: MODEL,
                messages
            }),
        });

        const json = await response.json();
        const messageContent = json.choices[0].message?.content;

        // Send a new message.
        await ctx.runMutation(api.messages.send, {
            author: "AI",
            body: messageContent || DEFAULT_AI_MESSAGE
        });
    }
})
