CONVERSATION 1:
You’ll get the consistency you want by treating your menu like a tiny design system: a few strict visual rules (tokens) plus a small set of reusable components, all driven from one data source. Then every new screen or prototype is just a different layout of the same pieces, so it stays legible and simple even as you move fast.

## 1. Decide the rules of the menu

For ordering screens, the main levers are legibility, info density, and hierarchy: large fonts with strong contrast, limited items per screen, and clear grouping by category all measurably improve how quickly people can choose.  On TVs in bright spaces you want thick-stroke fonts and high-contrast color pairs so text stays readable even with glare.  Limit how many dishes appear in each column or panel (e.g., 5–8 items) and use the third screen for “featured” or rotating items instead of cramming everything everywhere.  Decide these constraints once and treat them as non‑negotiable, so you’re never “re‑designing” on a random page. [intuiface](https://www.intuiface.com/blog/how-to-design-the-perfect-digital-menu-board-for-your-restaurant)

## 2. Define design tokens in code

Create a tiny tokens file and never hard‑code styles elsewhere. Design tokens are just named values for things like colors, typography, and spacing that act as a single source of truth for the UI.  In your stack this can be a `tokens.ts` (or `.js`) exporting things like `fontSizes`, `lineHeights`, `space`, `colors`, and `radius`, plus matching CSS variables. When you need to tweak legibility (e.g., bump up base font size for seniors in the restaurant), you change one token and every board updates consistently instead of hunting through components. [erikfiala](https://erikfiala.com/blog/design-tokens-ui-consistency)

Example (pseudo‑Svelte):

```ts
// src/lib/tokens.ts
export const fontSizes = {
  xs: '14px',
  sm: '18px',
  md: '22px',
  lg: '28px',
  xl: '36px'
};

export const space = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px'
};

export const colors = {
  bg: '#fdf7f0',
  text: '#222222',
  accent: '#b4332b',
  subdued: '#777777'
};
```

## 3. Build a minimal component library

Take what’s on your boards now and standardize the pieces: screen layout, section header, menu item row, price, tags (spicy, vegan, “recommended”), allergen row. Each component should only consume tokens and layout props, never raw values. A separate library of reusable components is a core recommendation in design-system best practices because it keeps visual and behavioral patterns consistent as you add new screens.  For example: [blog.pixelfreestudio](https://blog.pixelfreestudio.com/how-to-use-design-systems-for-rapid-prototyping/)

- `MenuScreen` – handles padding, column width, overall background.
- `SectionHeading` – always same font size, weight, spacing above/below.
- `MenuItemRow` – title, subtitle, price, optional icon list, with fixed vertical rhythm.
- `InfoPanel` – for “Students -10%”, allergens, etc., reusing the same text styles.

Once these exist, any new prototype (e.g., a kiosk, mobile menu, or “today’s specials” layout) is just composition of the same component set, so it automatically looks like the same product.

## 4. Use a single menu data model

Put all the restaurant content in a structured data file or small CMS and render every surface from that. Digital menu guidelines emphasize structuring items by category and highlighting specific products rather than manually designing each board independently.  For you, that might be `menu.json` with categories (`dumplings`, `soups`, `drinks`), each item including flags for “featured”, “spicy”, “vegetarian”, allergens, and which panel it appears on. [dotsignage](https://www.dotsignage.com/blog/menu-board-design-tips/)

Then:

- `/tv-left`, `/tv-middle`, `/tv-right` simply filter and map the same data.
- A mobile or web ordering UI uses the same data with a different layout.
- If you rename a dish or change a price, it’s correct everywhere instantly.

This “one source of truth” is what makes design systems scale and keeps copy, prices, and categories consistent while you iterate visually. [figr](https://figr.design/blog/7-design-system-best-practices-for-consistent-ui-development)

## 5. A rapid‑prototyping workflow that stays consistent

You can still move very fast as a solo dev if you lock the system and only experiment inside it. A common pattern in rapid prototyping with design systems is to assemble new screens by dragging and dropping existing components instead of designing from scratch each time.  Concretely, you can: [blog.pixelfreestudio](https://blog.pixelfreestudio.com/how-to-use-design-systems-for-rapid-prototyping/)

1. Start with a text‑only prototype route (no images, just components and tokens) so you can test information hierarchy and legibility on the TVs in situ.
2. Once the layout feels right, add images and small accents, but cap animations and colors so they don’t compete with core text; digital menu advice is to avoid clutter and excessive motion because it slows ordering decisions. [intuiface](https://www.intuiface.com/blog/how-to-design-the-perfect-digital-menu-board-for-your-restaurant)
3. Before shipping, do a quick “design lint”: check type hierarchy (only 2–3 sizes per screen), consistent padding multiples of your base spacing token, contrast passing WCAG where possible, and a hard limit on items per panel.

If you want, next step I can help you define an exact `tokens.ts`, `MenuItemRow.svelte` API, and a `menu.json` shape tailored to your restaurant so you can lock this system in and keep every future idea consistent by default.

CONVERSATION 2;
You make that tokens file unavoidable by turning it into the **only** legal and convenient way to style anything: architecturally, via tooling, and via your own rituals.

## 1. Make a single source of truth

Have one `src/design` (or `src/ui`) folder that owns `tokens.ts` and the core components; everything visible on any menu screen must import from there, never from scattered files. This is exactly what “single source of truth” means in design‑system land: one central repo for tokens and components that all surfaces depend on. [designsystems](https://designsystems.surf/guides/single-source-of-truth)

Practical pattern:

- `src/design/tokens.ts`
- `src/design/components/MenuItemRow.svelte`
- `src/design/index.ts` (barrel that re‑exports everything)

Then in the rest of the app, you only ever import from `'$lib/design'` (or similar), so any change naturally flows through that gate.

## 2. Use lint rules to forbid bypassing it

Add ESLint rules that literally block hex colors, raw `rgb(...)`, or arbitrary spacing in your code and styles. Plugins and examples show how to enforce “no hardcoded colors, you must use tokens”, e.g. `color-no-hex` or `no-hardcoded-color` rules and `no-restricted-syntax` patterns. [github](https://github.com/gajus/eslint-plugin-panda/blob/main/docs/rules/no-hardcoded-color.md)

For your stack you can:

- Define a custom ESLint rule config that errors on `/#([0-9a-fA-F]{3,6})/` and similar in Svelte/TS.
- Optionally add a Stylelint rule for CSS that does the same.
- Treat these as errors so `bun test` / `lint` fails if you “cheat”.

## 3. Make the “right way” the easiest way

Wrap common patterns so you don’t even think about tokens most of the time. Design‑system practice is to expose tokens and components together so you always reach for a pre‑made building block, not raw values. [uxpin](https://www.uxpin.com/studio/blog/single-source-truth-benefits/)

Concrete ideas:

- Export small helpers like `textBody`, `textHeading`, `panelCard` classes that are already wired to tokens.
- Add editor snippets for `MenuItemRow`, `SectionHeading`, etc., so new UI almost always starts from these.
- Keep tokens incredibly small and memorable (e.g., `space.sm`, `space.md`, `space.lg`) so they’re faster to type than guessing `14px`.

## 4. Add a tiny personal “design gate” before deploy

Because you’re solo, your “design review” is a quick checklist you always run before merging or deploying. Single‑source‑of‑truth setups still recommend governance: a simple process to keep drift from creeping in. [docs.leandesignsystem](https://docs.leandesignsystem.org/tactics/infrastructure/steady-flow-of-truth)

For you, that could be:

- `npm run lint` (tokens rules) must be clean.
- Scan diff: no new hex codes, no ad‑hoc font sizes.
- Open the three TV routes on your laptop in a fixed viewport; confirm headings, item rows, and info blocks still line up with the same rhythm.

If you want, I can sketch an actual ESLint + Svelte config snippet that bans raw colors/sizes and a minimal `src/design` structure you can drop into this menu repo.
