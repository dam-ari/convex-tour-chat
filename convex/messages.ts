import { query, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // Grab the most recent messages.
    const messages = await ctx.db.query("messages").order("desc").take(100);
    // Grab the likes
      const messagesWithLikes = await Promise.all(
        messages.map(async (message) => {
          // Find the likes for each message
          const likes = await ctx.db
            .query("likes")
            .withIndex("byMessageId", (q) => q.eq("messageId", message._id))
            .collect();
          // Join the count of likes with the message data
          return {
            ...message,
            likes: likes.length,
          };
        }),
      );    

    // Reverse the list so that it's in a chronological order.
    return messagesWithLikes.reverse().map((message) => ({
      ...message,
      // Format smileys
      body: message.body.replaceAll(":)", "😊"),
    }));
    },



});

export const send = mutation({
  args: { body: v.string(), author: v.string() },
  handler: async (ctx, { body, author }) => {
    // Send a new message.
    await ctx.db.insert("messages", { body, author });

    // Calling AI to answer, if the message is not from AI and starts with @ai or @AI
    if (author !== "AI" && body.match(/^@ai\s/i)) {
      await ctx.scheduler.runAfter(0, api.ai.chat, { messageBody: body });
    }
  },
});

export const like = mutation({
  args: { liker: v.string(), messageId: v.id("messages") }, 
  handler: async (ctx,  {liker, messageId}) => {
    // Like a message.
    await ctx.db.insert("likes", { liker, messageId });
  }
});