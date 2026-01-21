import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// Start a new display session
export const startSession = mutation({
  args: {
    sessionId: v.string(),
    displayType: v.string(),
    viewportSize: v.optional(v.object({ width: v.number(), height: v.number() })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("displayAnalytics", {
      sessionId: args.sessionId,
      displayType: args.displayType,
      startedAt: Date.now(),
      viewportSize: args.viewportSize,
    });
  },
});

// End a display session
export const endSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("displayAnalytics")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .first();

    if (session && !session.endedAt) {
      await ctx.db.patch(session._id, {
        endedAt: Date.now(),
      });
      return true;
    }
    return false;
  },
});

// Get sessions for a date range
export const getSessions = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    displayType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Parse dates or use defaults
    const startTime = args.startDate
      ? new Date(args.startDate).getTime()
      : oneDayAgo;
    const endTime = args.endDate
      ? new Date(args.endDate).getTime() + 24 * 60 * 60 * 1000
      : now;

    let query = ctx.db
      .query("displayAnalytics")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("startedAt"), startTime),
          q.lte(q.field("startedAt"), endTime)
        )
      );

    const sessions = await query.collect();

    // Filter by display type if specified
    let filtered = args.displayType
      ? sessions.filter((s) => s.displayType === args.displayType)
      : sessions;

    // Sort by most recent first
    filtered.sort((a, b) => b.startedAt - a.startedAt);

    // Apply limit
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

// Get aggregated analytics
export const getAggregates = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Default to last 7 days
    const endDate = args.endDate ?? new Date().toISOString().split("T")[0];
    const startDate =
      args.startDate ??
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const aggregates = await ctx.db
      .query("analyticsAggregates")
      .withIndex("by_date_type")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();

    return aggregates;
  },
});

// Get summary stats
export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Get all sessions from the last week
    const sessions = await ctx.db
      .query("displayAnalytics")
      .withIndex("by_date")
      .filter((q) => q.gte(q.field("startedAt"), oneWeekAgo))
      .collect();

    // Calculate stats
    const today = sessions.filter((s) => s.startedAt >= oneDayAgo);
    const mobileToday = today.filter((s) => s.displayType === "mobile");
    const tvToday = today.filter((s) => s.displayType === "tv");

    const totalDurationToday = today.reduce((acc, s) => {
      const duration = s.endedAt ? s.endedAt - s.startedAt : now - s.startedAt;
      return acc + duration;
    }, 0);

    const totalDurationWeek = sessions.reduce((acc, s) => {
      const duration = s.endedAt ? s.endedAt - s.startedAt : now - s.startedAt;
      return acc + duration;
    }, 0);

    // Get active sessions (started but not ended)
    const activeSessions = sessions.filter(
      (s) => !s.endedAt && now - s.startedAt < 30 * 60 * 1000 // Consider active if started within 30 min and not ended
    );

    return {
      today: {
        total: today.length,
        mobile: mobileToday.length,
        tv: tvToday.length,
        avgDurationMs:
          today.length > 0 ? Math.round(totalDurationToday / today.length) : 0,
      },
      week: {
        total: sessions.length,
        avgDurationMs:
          sessions.length > 0
            ? Math.round(totalDurationWeek / sessions.length)
            : 0,
      },
      active: {
        total: activeSessions.length,
        mobile: activeSessions.filter((s) => s.displayType === "mobile").length,
        tv: activeSessions.filter((s) => s.displayType === "tv").length,
      },
    };
  },
});

// Internal mutation for daily aggregation (called by cron)
export const aggregateDaily = internalMutation({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const dateStart = new Date(args.date).getTime();
    const dateEnd = dateStart + 24 * 60 * 60 * 1000;

    // Get all sessions for the date
    const sessions = await ctx.db
      .query("displayAnalytics")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("startedAt"), dateStart),
          q.lt(q.field("startedAt"), dateEnd)
        )
      )
      .collect();

    // Group by display type
    const byType: Record<string, typeof sessions> = {};
    for (const session of sessions) {
      if (!byType[session.displayType]) {
        byType[session.displayType] = [];
      }
      byType[session.displayType].push(session);
    }

    // Create aggregates for each type
    for (const [displayType, typeSessions] of Object.entries(byType)) {
      const totalDuration = typeSessions.reduce((acc, s) => {
        const duration = s.endedAt
          ? s.endedAt - s.startedAt
          : dateEnd - s.startedAt;
        return acc + duration;
      }, 0);

      // Find peak hour
      const hourCounts: Record<number, number> = {};
      for (const session of typeSessions) {
        const hour = new Date(session.startedAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
      const peakHour = Object.entries(hourCounts).reduce(
        (max, [hour, count]) =>
          count > (max.count || 0) ? { hour: parseInt(hour), count } : max,
        { hour: 0, count: 0 }
      ).hour;

      // Check if aggregate already exists
      const existing = await ctx.db
        .query("analyticsAggregates")
        .withIndex("by_date_type", (q) =>
          q.eq("date", args.date).eq("displayType", displayType)
        )
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          totalSessions: typeSessions.length,
          totalDurationMs: totalDuration,
          peakHour,
        });
      } else {
        await ctx.db.insert("analyticsAggregates", {
          date: args.date,
          displayType,
          totalSessions: typeSessions.length,
          totalDurationMs: totalDuration,
          peakHour,
        });
      }
    }
  },
});

// Get hourly distribution for a date range
export const getHourlyDistribution = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const endDate = args.endDate ?? new Date().toISOString().split("T")[0];
    const startDate =
      args.startDate ??
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime() + 24 * 60 * 60 * 1000;

    const sessions = await ctx.db
      .query("displayAnalytics")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("startedAt"), startTime),
          q.lt(q.field("startedAt"), endTime)
        )
      )
      .collect();

    // Count sessions by hour
    const hourlyData: { hour: number; mobile: number; tv: number }[] = [];
    for (let i = 0; i < 24; i++) {
      hourlyData.push({ hour: i, mobile: 0, tv: 0 });
    }

    for (const session of sessions) {
      const hour = new Date(session.startedAt).getHours();
      if (session.displayType === "mobile") {
        hourlyData[hour].mobile++;
      } else if (session.displayType === "tv") {
        hourlyData[hour].tv++;
      }
    }

    return hourlyData;
  },
});
