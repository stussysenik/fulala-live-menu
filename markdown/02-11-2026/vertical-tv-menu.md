CONVERSATION 1:
Design as **native vertical layouts**, and give them their own Svelte route(s); don’t rely on rotating a normal desktop layout.

***

## 1. Orientation & TV settings

- Set each LG TV itself to **Portrait (Rotated)** in Settings → Picture → Orientation / Rotating Screen, so webOS and the browser are natively vertical.  
- Then design each page as a **vertical 1080×1920 (or 2160×3840) viewport**—no CSS hacks like `transform: rotate()`.  

That way the browser, cursor, scroll, etc. all behave naturally and text renders sharply.

***

## 2. Site structure in Svelte

Given you already have a regular mobile/desktop menu:

- Keep your existing menu at `/menu` (responsive for phones/laptops).  
- Add **dedicated routes** for the TVs, e.g.:  
  - `/tv-left`  
  - `/tv-middle`  
  - `/tv-right`  

Each TV page:

- Uses a **different layout** (big type, no scrolling, high contrast).  
- Pulls from the **same data** (e.g. a shared `menu.ts` or JSON) so prices and items stay in sync with the main site.  

So you develop layout once, data once, but have two “skins”: normal site and TV wall.

***

## 3. Practical layout rules for the TV routes

- Treat each screen as **one column**: avoid designs that rely on precise alignment across bezels.  
- Fixed “viewport” design: assume ~1080×1920 CSS pixels, no scrolling; everything important must fit without interaction.  
- Use **large typography** and spacing: think 40–60px+ for item names, 70–90px for section titles, generous line height.  
- Keep JS and animation minimal; mostly static render from data.

***

## 4. How you’ll deploy & use it

- Deploy the Svelte app as usual (Vercel, Netlify).  
- On each TV browser, set its route (`/tv-left` etc.) as a **bookmark/home** so staff just open the browser and it’s there.  
- When you update prices, you only edit your shared data file → redeploy; the TVs show the new content on reload.

If you tell me whether you’re using SvelteKit or plain Svelte, I can sketch an exact `src/routes` + data file structure for `/tv-left|middle|right` that matches this setup.

CONVERSATION 2:
Looking at that photo, yes: the **TV panels themselves are already mounted vertically**, and webOS is clearly running in portrait (home screen and browser are upright relative to the bezel). [support.signagelive](https://support.signagelive.com/en/articles/138045-how-to-configure-native-portrait-on-lg-using-the-osd-or-remotely-via-support-ticket)

So for design purposes you can treat each screen as a **native vertical display** and ignore rotation tricks in CSS or the OS:

- Design each TV layout as a **portrait viewport** (e.g. 1080×1920 or 2160×3840), exactly like a phone held upright—but with much larger typography. [webostv.developer.lge](https://webostv.developer.lge.com/develop/guides/stanbyme-portrait-mode)
- In Svelte/SvelteKit, it’s clean to create **dedicated routes** just for the wall, e.g. `/tv/left`, `/tv/middle`, `/tv/right`, that use a special vertical layout but read from the same menu data as your normal desktop/mobile pages.  
- You *don’t* need `transform: rotate()` or any special handling for orientation—the TV/browser is already giving you a tall window, so you just build a normal responsive page that assumes a tall aspect ratio and no scrolling.

If you want, I can sketch a tiny SvelteKit route + layout structure that gives you `/menu` (normal site) and `/tv/*` (3 vertical panels) all powered from one shared `menu.ts` data file.
