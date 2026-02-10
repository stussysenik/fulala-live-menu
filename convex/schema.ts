import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Reusable validators for modifiers
const temperatureValidator = v.union(
  v.literal("hot"),
  v.literal("cold"),
  v.literal("room-temp")
);

const noodleTypeValidator = v.union(
  v.literal("thin"),        // 细面
  v.literal("flat"),        // 河粉 ho fun
  v.literal("thick"),       // 粗面 lo mein
  v.literal("hand-pulled"), // 拉面 la mian
  v.literal("rice"),        // 米粉 rice vermicelli
  v.literal("glass"),       // 粉丝 glass noodles
  v.literal("egg")          // 蛋面 egg noodles
);

const fryingDegreeValidator = v.union(
  v.literal("light"),       // Snowflake crisp
  v.literal("golden"),      // Standard
  v.literal("crispy")       // Extra crispy
);

const brothTypeValidator = v.union(
  v.literal("clear"),       // 清汤
  v.literal("bone"),        // 骨汤
  v.literal("spicy"),       // 麻辣
  v.literal("tomato"),      // 番茄
  v.literal("coconut")      // 椰子
);

const spiceLevelValidator = v.union(
  v.literal("mild"),
  v.literal("medium"),
  v.literal("hot"),
  v.literal("extra-hot")
);

const dietaryTagValidator = v.union(
  v.literal("vegetarian"),       // 🥬
  v.literal("vegan"),            // 🌱
  v.literal("contains-seafood"), // 🦐
  v.literal("contains-pork"),    // 🐷
  v.literal("contains-beef"),    // 🐄
  v.literal("contains-chicken"), // 🐔
  v.literal("contains-nuts"),    // 🥜
  v.literal("gluten-free"),      // GF
  v.literal("dairy-free"),       // DF
  v.literal("halal"),            // ☪️
  v.literal("kosher")            // ✡️
);

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    displayName: v.string(),
    displayNameLocal: v.optional(v.string()),   // Czech category name
    subtitle: v.optional(v.string()),           // e.g., "Starters / Předkrmy"
    sortOrder: v.number(),
    isActive: v.boolean(),
  }).index("by_sort", ["sortOrder"]),

  menuItems: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),              // whole currency units (CZK)
    categoryId: v.id("categories"),
    isAvailable: v.boolean(),
    sortOrder: v.number(),
    addedAt: v.number(),
    lastModifiedAt: v.number(),
    modificationCount: v.number(),
    imageUrl: v.optional(v.string()),
    allergens: v.optional(v.array(v.string())),

    // Fulala: Bilingual names
    nameLocal: v.optional(v.string()),              // Czech name
    nameChinese: v.optional(v.string()),            // Chinese characters

    // Fulala: EU allergen system
    allergenNumbers: v.optional(v.array(v.number())), // EU allergen numbers [1, 6, 11]
    allergenCodes: v.optional(v.array(v.string())),   // Display codes ["1a", "2", "6"]

    // Fulala: Item details
    quantity: v.optional(v.string()),               // e.g., "3ks", "6ks"
    isSweet: v.optional(v.boolean()),               // Sweet item flag
    isFeatured: v.optional(v.boolean()),            // Star/recommended item
    isGlutenFree: v.optional(v.boolean()),          // GF flag
    priceCZK: v.optional(v.number()),               // CZK price (backup)
    priceEUR: v.optional(v.number()),               // EUR price (backup)

    // Enhanced nutritional and portion information (luxury theme)
    portionGrams: v.optional(v.number()),           // Weight in grams (e.g., 250)
    servingSize: v.optional(v.string()),            // Serving description (e.g., "Serves 2-3 people")
    allergenDetails: v.optional(v.array(v.string())), // Detailed allergen list (e.g., ["peanuts", "tree nuts"])
    nutritionalHighlights: v.optional(v.array(v.string())), // Badges (e.g., ["High Protein", "Low Carb"])

    // Item code for dim sum numbering (e.g., "S1", "F2", "N3")
    itemCode: v.optional(v.string()),

    // Food modifiers (Phase 2)
    modifiers: v.optional(v.object({
      temperature: v.optional(v.array(temperatureValidator)),
      noodleType: v.optional(v.array(noodleTypeValidator)),
      fryingDegree: v.optional(v.array(fryingDegreeValidator)),
      brothType: v.optional(v.array(brothTypeValidator)),
      spiceLevel: v.optional(v.array(spiceLevelValidator)),
    })),

    // Dietary tags for quick identification
    dietaryTags: v.optional(v.array(dietaryTagValidator)),

    // Drink options (Phase 3)
    drinkOptions: v.optional(v.object({
      temperatures: v.array(v.union(v.literal("hot"), v.literal("iced"))),
      defaultTemp: v.optional(v.string()),
      sugarLevels: v.optional(v.array(v.string())), // ["0%", "30%", "50%", "100%"]
      addOns: v.optional(v.array(v.object({
        name: v.string(),      // "Honey", "Lemon", "Boba"
        price: v.number(),     // Additional cents
      }))),
    })),
  })
    .index("by_category", ["categoryId"])
    .index("by_available", ["isAvailable"]),

  // Display Layouts (Phase 1)
  displayLayouts: defineTable({
    layoutType: v.union(
      v.literal("standard-list"),
      v.literal("dim-sum-grid"),
      v.literal("card-grid"),
      v.literal("traditional-chinese")  // Classic dim sum order sheet style
    ),
    pageType: v.optional(v.union(   // Which page type this layout is for
      v.literal("display"),         // For / and /tv pages
      v.literal("order")            // For /order page
    )),
    config: v.object({
      columnsPerRow: v.optional(v.number()),      // 2 for dim sum
      showCheckboxes: v.optional(v.boolean()),   // dim sum style
      showItemNumbers: v.optional(v.boolean()),  // S1, S2, F1, F2
      showImages: v.optional(v.boolean()),
      categoryStyle: v.optional(v.union(
        v.literal("header"),    // Bold section headers
        v.literal("tabs"),      // Tab navigation
        v.literal("colored")    // Color-coded sections
      )),
      showQuantityInput: v.optional(v.boolean()),  // For traditional layout
      colorScheme: v.optional(v.union(             // For traditional layout
        v.literal("classic-red"),
        v.literal("jade-green"),
        v.literal("gold")
      )),
    }),
    isActive: v.boolean(),
  }).index("by_active", ["isActive"])
    .index("by_page_type", ["pageType", "isActive"]),

  // Customer Orders (Phase 4)
  customerOrders: defineTable({
    sessionId: v.string(),
    status: v.union(v.literal("active"), v.literal("submitted"), v.literal("completed")),
    items: v.array(v.object({
      menuItemId: v.id("menuItems"),
      name: v.string(),
      quantity: v.number(),
      unitPrice: v.number(),
      selectedModifiers: v.optional(v.object({
        noodleType: v.optional(v.string()),
        temperature: v.optional(v.string()),
        spiceLevel: v.optional(v.string()),
        brothType: v.optional(v.string()),
        fryingDegree: v.optional(v.string()),
        addOns: v.optional(v.array(v.string())),
      })),
    })),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    tableNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_session", ["sessionId"])
    .index("by_status", ["status"]),

  // Event Packages (Phase 5)
  eventPackages: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    minGuests: v.number(),
    maxGuests: v.number(),
    pricePerPerson: v.number(),  // cents
    depositRequired: v.number(), // cents
    includedItems: v.array(v.id("menuItems")),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_active", ["isActive"]),

  // Catering Menus (Phase 5)
  cateringMenus: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    minOrderAmount: v.number(),  // cents
    deliveryRadius: v.optional(v.number()), // km
    items: v.array(v.id("menuItems")),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_active", ["isActive"]),

  // School Meals (Phase 5)
  schoolMeals: defineTable({
    weekNumber: v.number(),
    year: v.number(),
    dayOfWeek: v.union(
      v.literal("monday"),
      v.literal("tuesday"),
      v.literal("wednesday"),
      v.literal("thursday"),
      v.literal("friday")
    ),
    items: v.array(v.id("menuItems")),
    pricePerMeal: v.number(), // cents
    isActive: v.boolean(),
  }).index("by_week", ["year", "weekNumber"]),

  menuArchive: defineTable({
    menuItemId: v.id("menuItems"),
    snapshot: v.any(),
    changeType: v.string(),         // "created" | "updated" | "deleted"
    changedAt: v.number(),
  }).index("by_item", ["menuItemId"]),

  syncState: defineTable({
    lastSyncAt: v.number(),
    status: v.string(),             // "idle" | "syncing" | "error"
    errorMessage: v.optional(v.string()),
  }),

  dailySnapshots: defineTable({
    date: v.string(),               // YYYY-MM-DD
    snapshot: v.any(),              // Full menu state
    createdAt: v.number(),
  }).index("by_date", ["date"]),

  // Theme and settings
  siteSettings: defineTable({
    key: v.string(),                // "theme" | "restaurant-info"
    value: v.any(),                 // JSON settings
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  themePresets: defineTable({
    name: v.string(),
    theme: v.any(),
    isDefault: v.boolean(),
    createdAt: v.number(),
  }).index("by_name", ["name"]),

  // Display analytics
  displayAnalytics: defineTable({
    sessionId: v.string(),
    displayType: v.string(),        // "mobile" | "tv"
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    viewportSize: v.optional(v.object({ width: v.number(), height: v.number() })),
  })
    .index("by_type", ["displayType"])
    .index("by_date", ["startedAt"]),

  analyticsAggregates: defineTable({
    date: v.string(),               // YYYY-MM-DD
    displayType: v.string(),
    totalSessions: v.number(),
    totalDurationMs: v.number(),
    peakHour: v.optional(v.number()),
  }).index("by_date_type", ["date", "displayType"]),
});
