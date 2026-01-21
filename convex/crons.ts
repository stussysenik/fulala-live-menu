import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Create daily snapshot at midnight UTC
crons.daily(
  "daily-snapshot",
  { hourUTC: 0, minuteUTC: 0 },
  internal.archive.createDailySnapshot
);

// Aggregate analytics daily at 1 AM UTC (after snapshot)
crons.daily(
  "analytics-aggregation",
  { hourUTC: 1, minuteUTC: 0 },
  internal.analytics.aggregateDaily,
  { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0] }
);

// Refresh exchange rates daily at 6 AM UTC
crons.daily(
  "refresh-exchange-rates",
  { hourUTC: 6, minuteUTC: 0 },
  internal.exchangeRates.cronRefreshRates
);

// Optional: Backup sync from Google Sheets every 60 seconds
// Uncomment when Google Sheets is configured
// crons.interval(
//   "backup-sync",
//   { seconds: 60 },
//   internal.sync.scheduledSync,
//   { spreadsheetId: process.env.GOOGLE_SHEETS_ID ?? "" }
// );

export default crons;
