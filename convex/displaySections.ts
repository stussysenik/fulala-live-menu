import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  validateSectionConfig,
  type DisplaySectionConfig,
} from "../src/lib/domain/sectionConfig";

// ---------------------------------------------------------------------------
// Display section composition — storage and publish pipeline.
//
// Published and draft configs follow the single-document siteSettings idiom
// from page-settings: one row holds a map of slug -> DisplaySectionConfig.
//   key "section-config"        -> what TVs render (published)
//   key "section-config:draft"  -> what the admin composer edits
//
// Every publish appends an immutable row to `displayVersions` (the black
// box): "what did the screen show in week 23?" always has a true answer.
// The table shape is shared with add-displays-control-center, so when that
// change ships its draft/publish pipeline, composition history and settings
// history live side by side.
//
// Validation happens here, at the write boundary, using the same pure
// domain module the composer UI uses — a TV can trust whatever is stored.
// ---------------------------------------------------------------------------

const PUBLISHED_KEY = "section-config";
const DRAFT_KEY = "section-config:draft";

type ConfigMap = Record<string, DisplaySectionConfig>;

async function readMap(
  ctx: { db: any },
  key: string,
): Promise<{ row: any | null; map: ConfigMap }> {
  const row = await ctx.db
    .query("siteSettings")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .first();
  return { row, map: (row?.value as ConfigMap) ?? {} };
}

async function writeMap(ctx: { db: any }, key: string, map: ConfigMap) {
  const { row } = await readMap(ctx, key);
  if (row) {
    await ctx.db.patch(row._id, { value: map, updatedAt: Date.now() });
  } else {
    await ctx.db.insert("siteSettings", {
      key,
      value: map,
      updatedAt: Date.now(),
    });
  }
}

// Published config for one page; null = caller renders its built-in default.
export const getPublishedConfig = query({
  args: { slug: v.string() },
  handler: async (ctx, args): Promise<DisplaySectionConfig | null> => {
    const { map } = await readMap(ctx, PUBLISHED_KEY);
    return map[args.slug] ?? null;
  },
});

// Draft for one page, falling back to published (editing starts from live).
export const getDraftConfig = query({
  args: { slug: v.string() },
  handler: async (ctx, args): Promise<DisplaySectionConfig | null> => {
    const { map: drafts } = await readMap(ctx, DRAFT_KEY);
    if (drafts[args.slug]) return drafts[args.slug] ?? null;
    const { map: published } = await readMap(ctx, PUBLISHED_KEY);
    return published[args.slug] ?? null;
  },
});

// Admin overview: both maps at once so the composer can show dirty badges.
export const getAllConfigs = query({
  args: {},
  handler: async (ctx) => {
    const { map: published } = await readMap(ctx, PUBLISHED_KEY);
    const { map: drafts } = await readMap(ctx, DRAFT_KEY);
    return { published, drafts };
  },
});

// Save a draft. Rejects malformed configs — truth at the boundary.
export const saveDraft = mutation({
  args: { slug: v.string(), config: v.any() },
  handler: async (ctx, args) => {
    const errors = validateSectionConfig(args.config);
    if (errors.length > 0) {
      throw new Error(`Invalid section config: ${errors.join("; ")}`);
    }
    const { map } = await readMap(ctx, DRAFT_KEY);
    await writeMap(ctx, DRAFT_KEY, {
      ...map,
      [args.slug]: args.config as DisplaySectionConfig,
    });
  },
});

// Publish a page's draft: copy draft -> published, append a version row.
export const publish = mutation({
  args: { slug: v.string(), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { map: drafts } = await readMap(ctx, DRAFT_KEY);
    const config = drafts[args.slug];
    if (!config) throw new Error(`No draft to publish for "${args.slug}"`);

    const errors = validateSectionConfig(config);
    if (errors.length > 0) {
      throw new Error(`Draft is invalid: ${errors.join("; ")}`);
    }

    const { map: published } = await readMap(ctx, PUBLISHED_KEY);
    await writeMap(ctx, PUBLISHED_KEY, { ...published, [args.slug]: config });

    // Append-only version row; version numbers are per slug and dense.
    const versions = await ctx.db
      .query("displayVersions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();
    const sectionVersions = versions.filter((row) => row.kind === "sections");
    const nextVersion =
      sectionVersions.reduce((max, row) => Math.max(max, row.version), 0) + 1;

    await ctx.db.insert("displayVersions", {
      slug: args.slug,
      settings: config,
      version: nextVersion,
      publishedAt: Date.now(),
      note: args.note,
      kind: "sections",
    });

    return { version: nextVersion };
  },
});

// Composition history for a page, newest first.
export const getVersions = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const versions = await ctx.db
      .query("displayVersions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();
    return versions
      .filter((row) => row.kind === "sections")
      .sort((a, b) => b.version - a.version);
  },
});

// Restore: re-publish an old composition as a NEW version (append-only,
// history is never rewritten). Also syncs the draft so the composer shows
// what is now live.
export const restoreVersion = mutation({
  args: { versionId: v.id("displayVersions") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.versionId);
    if (!row || row.kind !== "sections") {
      throw new Error("Version not found");
    }
    const config = row.settings as DisplaySectionConfig;
    const errors = validateSectionConfig(config);
    if (errors.length > 0) {
      throw new Error(
        `Stored version no longer valid on this deployment: ${errors.join("; ")}`,
      );
    }

    const { map: drafts } = await readMap(ctx, DRAFT_KEY);
    await writeMap(ctx, DRAFT_KEY, { ...drafts, [row.slug]: config });

    const { map: published } = await readMap(ctx, PUBLISHED_KEY);
    await writeMap(ctx, PUBLISHED_KEY, { ...published, [row.slug]: config });

    const versions = await ctx.db
      .query("displayVersions")
      .withIndex("by_slug", (q) => q.eq("slug", row.slug))
      .collect();
    const nextVersion =
      versions
        .filter((r) => r.kind === "sections")
        .reduce((max, r) => Math.max(max, r.version), 0) + 1;

    await ctx.db.insert("displayVersions", {
      slug: row.slug,
      settings: config,
      version: nextVersion,
      publishedAt: Date.now(),
      note: `Restored from version ${row.version}`,
      kind: "sections",
    });

    return { version: nextVersion };
  },
});
