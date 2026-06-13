# Lessons

## Builder: "editable" means the content, not just the container (2026-06-13)
**Mistake:** When asked to make displays "editable including pictures," I first only made
the *section composition* editable (which category a block shows) and called it done.
**Correction (owner):** The point is *detail specificity* — edit the individual dumpling's
text, price, and picture, and create new items, inline in the composer. "One or two layers
down." Isolated views (separate /admin/menu) defeat the purpose; the dashboard composer
must be the one pre-solved place.
**Rule:** For an editor, push editing to the smallest meaningful unit the user names. A
"customizer" edits content, not just layout. Wire the composer to the item mutations
(updateMenuItem / createMenuItem / image upload), don't send the user to another screen.

## Builder craft: design quality is part of the task, not a follow-up (2026-06-13)
**Correction (owner):** "our sections and spacing looks vibe-coded... imagine Pentagram
designed the tool with iA Writer." Also: sections must be collapsible to save space, and a
preview that matters must be *constrained to always show fully*, never clipped.
**Rule:** Hold an explicit aesthetic bar (here: iA-Writer editorial restraint — DM Mono
labels, Cormorant display, paper/ink, one accent, 8px rhythm). Reuse the product's own
fonts/tokens for cohesion. Use established headless primitives (bits-ui/melt-ui Collapsible)
instead of hand-rolling. A "live preview" must be fit-to-box (scale to width AND height) so
it is always fully visible.
