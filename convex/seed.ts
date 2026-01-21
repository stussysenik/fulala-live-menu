import { mutation } from "./_generated/server";

// Seed the database with example menu data
export const seedMenu = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingCategories = await ctx.db.query("categories").collect();
    if (existingCategories.length > 0) {
      return { message: "Database already has data. Skipping seed." };
    }

    const now = Date.now();

    // Create categories
    const categories = [
      { name: "dumplings", displayName: "Dumplings", sortOrder: 1, isActive: true },
      { name: "noodles", displayName: "Noodles", sortOrder: 2, isActive: true },
      { name: "rice", displayName: "Rice Dishes", sortOrder: 3, isActive: true },
      { name: "snacks", displayName: "Snacks", sortOrder: 4, isActive: true },
      { name: "drinks", displayName: "Drinks", sortOrder: 5, isActive: true },
      { name: "juices", displayName: "Fresh Juices", sortOrder: 6, isActive: true },
    ];

    const categoryIds: Record<string, any> = {};
    for (const category of categories) {
      const id = await ctx.db.insert("categories", category);
      categoryIds[category.name] = id;
    }

    // Create menu items with Unsplash images
    const menuItems = [
      // Dumplings
      {
        name: "Pork Gyoza (6pc)",
        description: "Pan-fried with ginger soy",
        price: 850, // $8.50
        categoryName: "dumplings",
        isAvailable: true,
        sortOrder: 1,
        imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Veggie Dumplings (6pc)",
        description: "Steamed cabbage & mushroom",
        price: 750,
        categoryName: "dumplings",
        isAvailable: true,
        sortOrder: 2,
        imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Soup Dumplings (4pc)",
        description: "Shanghai-style xiaolongbao",
        price: 950,
        categoryName: "dumplings",
        isAvailable: true,
        sortOrder: 3,
        imageUrl: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Shrimp Har Gow (4pc)",
        description: "Crystal shrimp dumplings",
        price: 900,
        categoryName: "dumplings",
        isAvailable: false,
        sortOrder: 4,
        imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop&q=80",
      },

      // Noodles
      {
        name: "Dan Dan Noodles",
        description: "Spicy sesame pork",
        price: 1200,
        categoryName: "noodles",
        isAvailable: true,
        sortOrder: 1,
        imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Cold Sesame Noodles",
        description: "Chilled with cucumber",
        price: 1000,
        categoryName: "noodles",
        isAvailable: true,
        sortOrder: 2,
        imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Beef Noodle Soup",
        description: "Slow-braised beef, hand-pulled noodles",
        price: 1450,
        categoryName: "noodles",
        isAvailable: true,
        sortOrder: 3,
        imageUrl: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Wonton Noodle Soup",
        description: "Pork & shrimp wontons",
        price: 1100,
        categoryName: "noodles",
        isAvailable: true,
        sortOrder: 4,
        imageUrl: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop&q=80",
      },

      // Rice Dishes
      {
        name: "Mapo Tofu Rice",
        description: "Sichuan-style silken tofu",
        price: 1100,
        categoryName: "rice",
        isAvailable: true,
        sortOrder: 1,
        imageUrl: "https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Curry Chicken Rice",
        description: "Yellow curry with vegetables",
        price: 1250,
        categoryName: "rice",
        isAvailable: true,
        sortOrder: 2,
        imageUrl: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Teriyaki Salmon Bowl",
        description: "Grilled salmon, steamed rice, pickles",
        price: 1550,
        categoryName: "rice",
        isAvailable: true,
        sortOrder: 3,
        imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&q=80",
      },

      // Snacks
      {
        name: "Scallion Pancakes",
        description: "Crispy layers with dipping sauce",
        price: 600,
        categoryName: "snacks",
        isAvailable: true,
        sortOrder: 1,
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Cucumber Salad",
        description: "Smashed cucumbers, garlic, chili",
        price: 500,
        categoryName: "snacks",
        isAvailable: true,
        sortOrder: 2,
        imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Edamame",
        description: "Sea salt",
        price: 450,
        categoryName: "snacks",
        isAvailable: true,
        sortOrder: 3,
        imageUrl: "https://images.unsplash.com/photo-1564894809611-1742fc40ed80?w=400&h=300&fit=crop&q=80",
      },

      // Drinks
      {
        name: "Jasmine Tea",
        description: "Hot or iced",
        price: 300,
        categoryName: "drinks",
        isAvailable: true,
        sortOrder: 1,
        imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Oolong Tea",
        description: "Hot or iced",
        price: 350,
        categoryName: "drinks",
        isAvailable: true,
        sortOrder: 2,
        imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Thai Iced Tea",
        description: "Sweet & creamy",
        price: 450,
        categoryName: "drinks",
        isAvailable: true,
        sortOrder: 3,
        imageUrl: "https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Sparkling Water",
        description: "Topo Chico",
        price: 350,
        categoryName: "drinks",
        isAvailable: true,
        sortOrder: 4,
        imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=300&fit=crop&q=80",
      },

      // Juices
      {
        name: "Fresh Orange",
        description: "Squeezed to order",
        price: 500,
        categoryName: "juices",
        isAvailable: true,
        sortOrder: 1,
        imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Watermelon",
        description: "Refreshing & sweet",
        price: 550,
        categoryName: "juices",
        isAvailable: true,
        sortOrder: 2,
        imageUrl: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400&h=300&fit=crop&q=80",
      },
      {
        name: "Green Juice",
        description: "Cucumber, celery, apple, ginger",
        price: 650,
        categoryName: "juices",
        isAvailable: true,
        sortOrder: 3,
        imageUrl: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&q=80",
      },
    ];

    for (const item of menuItems) {
      const categoryId = categoryIds[item.categoryName];
      if (!categoryId) continue;

      const id = await ctx.db.insert("menuItems", {
        name: item.name,
        description: item.description,
        price: item.price,
        categoryId,
        isAvailable: item.isAvailable,
        sortOrder: item.sortOrder,
        addedAt: now,
        lastModifiedAt: now,
        modificationCount: 0,
        imageUrl: item.imageUrl,
      });

      // Archive the creation
      const created = await ctx.db.get(id);
      await ctx.db.insert("menuArchive", {
        menuItemId: id,
        snapshot: created,
        changeType: "created",
        changedAt: now,
      });
    }

    return {
      message: "Database seeded successfully",
      categories: categories.length,
      items: menuItems.length,
    };
  },
});

// Clear all data (for testing)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    const menuItems = await ctx.db.query("menuItems").collect();
    const archives = await ctx.db.query("menuArchive").collect();
    const snapshots = await ctx.db.query("dailySnapshots").collect();
    const syncStates = await ctx.db.query("syncState").collect();

    for (const item of menuItems) {
      await ctx.db.delete(item._id);
    }
    for (const category of categories) {
      await ctx.db.delete(category._id);
    }
    for (const archive of archives) {
      await ctx.db.delete(archive._id);
    }
    for (const snapshot of snapshots) {
      await ctx.db.delete(snapshot._id);
    }
    for (const state of syncStates) {
      await ctx.db.delete(state._id);
    }

    return { message: "All data cleared" };
  },
});
