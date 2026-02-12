import { mutation } from "./_generated/server";

// Seed the database with real Fulala menu data
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
      {
        name: "steamed-dumplings",
        displayName: "STEAMED DUMPLINGS",
        displayNameLocal: "PARNÍ KNEDLÍČKY",
        subtitle: "Starters / Předkrmy",
        sortOrder: 1,
        isActive: true,
      },
      {
        name: "noodle-soups",
        displayName: "NOODLE SOUPS",
        displayNameLocal: "POLÉVKY S NUDLEMI",
        subtitle: "Mains / Hlavní jídla",
        sortOrder: 2,
        isActive: true,
      },
    ];

    const categoryIds: Record<string, any> = {};
    for (const category of categories) {
      const id = await ctx.db.insert("categories", category);
      categoryIds[category.name] = id;
    }

    // Create menu items with real photos
    const menuItems = [
      // === STEAMED DUMPLINGS ===
      {
        name: "Har Gow s krevetami",
        nameLocal: "Har Gow s krevetami",
        nameChinese: "虾饺",
        description: "Crystal shrimp dumplings",
        price: 189,
        categoryName: "steamed-dumplings",
        isAvailable: true,
        sortOrder: 1,
        imageUrl: "/images/menu/0759_MQ.webp",
        allergenCodes: ["1a", "2", "6", "11"],
        allergenNumbers: [1, 2, 6, 11],
        quantity: "6ks",
        isFeatured: false,
        isSweet: false,
        isGlutenFree: false,
      },
      {
        name: "Steamed Pork & Chinese Cabbage Dumplings",
        nameLocal: "Vepřové knedlíčky s čínským zelím",
        nameChinese: "猪肉蒸饺",
        description: "Steamed pork dumplings with napa cabbage",
        price: 179,
        categoryName: "steamed-dumplings",
        isAvailable: true,
        sortOrder: 2,
        imageUrl: "/images/menu/0560_MQ.webp",
        allergenCodes: ["1", "6"],
        allergenNumbers: [1, 6],
        quantity: "6ks",
        isFeatured: true,
        isSweet: false,
        isGlutenFree: false,
      },
      {
        name: "Steamed Beef & Onion Dumplings",
        nameLocal: "Hovězí knedlíčky s cibulí",
        nameChinese: "牛肉蒸饺",
        description: "Steamed beef dumplings with onion",
        price: 209,
        categoryName: "steamed-dumplings",
        isAvailable: true,
        sortOrder: 3,
        imageUrl: "/images/menu/0579_MQ.webp",
        allergenCodes: ["1", "6"],
        allergenNumbers: [1, 6],
        quantity: "6ks",
        isFeatured: true,
        isSweet: false,
        isGlutenFree: false,
      },
      {
        name: "Chicken, Spinach & Corn Dumplings w/ Cheese",
        nameLocal: "Kuřecí knedlíčky se špenátem, kukuřicí a sýrem",
        nameChinese: "鸡肉奶酪",
        description: "Chicken dumplings with spinach, corn and cheese",
        price: 199,
        categoryName: "steamed-dumplings",
        isAvailable: true,
        sortOrder: 4,
        imageUrl: "/images/menu/0779_MQ.webp",
        allergenCodes: ["1", "3", "7"],
        allergenNumbers: [1, 3, 7],
        quantity: "6ks",
        isFeatured: false,
        isSweet: false,
        isGlutenFree: false,
      },
      {
        name: "Steamed Custard Bun",
        nameLocal: "Parní buchta s vanilkovým krémem",
        nameChinese: "玉兔奶黄包",
        description: "Sweet steamed bun with custard filling",
        price: 89,
        categoryName: "steamed-dumplings",
        isAvailable: true,
        sortOrder: 5,
        imageUrl: "/images/menu/0697_MQ.webp",
        allergenCodes: ["1", "3", "7"],
        allergenNumbers: [1, 3, 7],
        quantity: "3ks",
        isFeatured: false,
        isSweet: true,
        isGlutenFree: false,
      },
      {
        name: "Peach-Shaped Steamed Bun w/ Red Bean Paste",
        nameLocal: "Broskvičky s pastou z červených fazolí",
        nameChinese: "寿桃豆沙包",
        description: "Sweet peach-shaped buns with red bean paste",
        price: 89,
        categoryName: "steamed-dumplings",
        isAvailable: true,
        sortOrder: 6,
        imageUrl: "/images/menu/0795_MQ.webp",
        allergenCodes: ["1", "6"],
        allergenNumbers: [1, 6],
        quantity: "3ks",
        isFeatured: false,
        isSweet: true,
        isGlutenFree: false,
      },

      // === NOODLE SOUPS ===
      {
        name: "Fresh Noodles with Braised Beef Brisket",
        nameLocal: "Čerstvé nudle s dušeným hovězím",
        nameChinese: "牛腩面",
        description: "Hand-pulled noodles in rich beef broth with braised brisket",
        price: 319,
        categoryName: "noodle-soups",
        isAvailable: true,
        sortOrder: 1,
        imageUrl: "/images/menu/0622_MQ.webp",
        allergenCodes: ["1", "6"],
        allergenNumbers: [1, 6],
        isFeatured: true,
        isSweet: false,
        isGlutenFree: false,
      },
      {
        name: "Fresh Noodles with Minced Pork & Seasonal Vegetables",
        nameLocal: "Čerstvé nudle s mletým vepřovým a zeleninou",
        nameChinese: "猪肉面",
        description: "Fresh noodles topped with minced pork and seasonal vegetables",
        price: 289,
        categoryName: "noodle-soups",
        isAvailable: true,
        sortOrder: 2,
        imageUrl: "/images/menu/0642_MQ.webp",
        allergenCodes: ["1", "6"],
        allergenNumbers: [1, 6],
        isFeatured: false,
        isSweet: false,
        isGlutenFree: false,
      },
      {
        name: "Fresh Noodles with Eggplant (Vegetarian)",
        nameLocal: "Čerstvé nudle s lilkem (vegetariánské)",
        nameChinese: "茄子素面",
        description: "Fresh noodles with braised eggplant, vegetarian",
        price: 269,
        categoryName: "noodle-soups",
        isAvailable: true,
        sortOrder: 3,
        imageUrl: "/images/menu/0704_MQ.webp",
        allergenCodes: ["1", "6"],
        allergenNumbers: [1, 6],
        isFeatured: false,
        isSweet: false,
        isGlutenFree: false,
      },
      {
        name: "Diced Chicken with Red & Green Peppers Noodles",
        nameLocal: "Nudle s kuřecím masem a paprikami",
        description: "Fresh noodles with diced chicken, red and green peppers",
        price: 279,
        categoryName: "noodle-soups",
        isAvailable: true,
        sortOrder: 4,
        imageUrl: "/images/menu/0723_MQ.webp",
        allergenCodes: ["1", "6"],
        allergenNumbers: [1, 6],
        isFeatured: false,
        isSweet: false,
        isGlutenFree: false,
      },
      {
        name: "Gluten-Free Thick Rice Noodles with Minced Pork",
        nameLocal: "Bezlepkové rýžové nudle s mletým vepřovým",
        nameChinese: "猪肉米线",
        description: "Thick rice noodles with minced pork, gluten-free",
        price: 289,
        categoryName: "noodle-soups",
        isAvailable: true,
        sortOrder: 5,
        imageUrl: "/images/menu/0659_MQ.webp",
        allergenCodes: ["6"],
        allergenNumbers: [6],
        isFeatured: false,
        isSweet: false,
        isGlutenFree: true,
      },
    ];

    for (const item of menuItems) {
      const categoryId = categoryIds[item.categoryName];
      if (!categoryId) continue;

      const { categoryName, ...itemData } = item;
      const id = await ctx.db.insert("menuItems", {
        ...itemData,
        categoryId,
        addedAt: now,
        lastModifiedAt: now,
        modificationCount: 0,
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

    // Seed siteSettings
    await ctx.db.insert("siteSettings", {
      key: "menu-schedule",
      value: {
        weekNumber: 2,
        monthLabel: "February",
        year: 2026,
        startDate: "2026-02-09",
        endDate: "2026-02-15",
      },
      updatedAt: now,
    });

    await ctx.db.insert("siteSettings", {
      key: "customer-info",
      value: {
        sections: [
          {
            title: "Kids & Family",
            titleLocal: "Děti a rodina",
            description: "Kids/family portions available on request",
            descriptionLocal: "Dětské / rodinné porce na vyžádání",
          },
          {
            title: "Students -10%",
            titleLocal: "Studenti -10%",
            description: "10% off with valid ISIC card",
            descriptionLocal: "10% sleva s platnou ISIC kartou",
          },
          {
            title: "Seniors -10%",
            titleLocal: "Senioři -10%",
            description: "10% off for guests aged 65+",
            descriptionLocal: "10% sleva pro hosty 65+",
          },
        ],
      },
      updatedAt: now,
    });

    await ctx.db.insert("siteSettings", {
      key: "animations-enabled",
      value: true,
      updatedAt: now,
    });

    return {
      message: "Database seeded with Fulala menu",
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
    const settings = await ctx.db.query("siteSettings").collect();

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
    for (const setting of settings) {
      await ctx.db.delete(setting._id);
    }

    return { message: "All data cleared" };
  },
});
