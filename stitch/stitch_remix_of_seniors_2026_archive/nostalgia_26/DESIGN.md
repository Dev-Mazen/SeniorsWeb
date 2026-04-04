# Design System: The Living Archive

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Curator."** 

We are moving away from the "app-like" rigidity of standard social platforms and toward the feel of a high-end, limited-edition editorial magazine. This system celebrates the transition of graduating seniors by blending nostalgia with a modern, premium aesthetic. It is "alive"—meaning the layout should feel like it's breathing through generous white space, intentional asymmetry, and elements that overlap as if scattered across a curator's desk. 

By utilizing high-contrast typography scales and layered surfaces, we create a digital experience that feels as permanent and precious as a physical yearbook, yet as fluid as a 2026 digital native's lifestyle.

---

## 2. Colors & Surface Philosophy
The palette is rooted in warm neutrals to evoke "Ivory" and "Sunlight," providing a sophisticated canvas for the emotional content of graduating seniors.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Structure must be defined through:
- **Tonal Shifts:** Placing a `surface-container-low` section against a `surface` background.
- **Negative Space:** Using the spacing scale to create clear mental models of grouping.
- **Glassmorphism:** Using depth and blur to define boundaries.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of vellum and fine paper.
- **Base Layer:** `surface` (#fcf9f4) — The foundation of the experience.
- **Secondary Sections:** `surface-container-low` (#f6f3ee) — Use for large grouped content areas.
- **Interactive Elements:** `surface-container-lowest` (#ffffff) — Use for cards or inputs that need to "pop" off the warm base.
- **Nesting:** To create focus, an inner container should always be one tier "brighter" or "dimmer" than its parent to establish a clear visual hierarchy without lines.

### The "Glass & Gradient" Rule
To inject "soul" into the UI, use gradients for high-impact moments:
- **CTAs:** Transition from `primary` (#9f402d) to `primary-container` (#e2725b).
- **Secondary Accents:** Transition from `secondary` (#5d54a4) to `secondary-container` (#b0a6fd).
- **Glassmorphism:** Use `surface-container-lowest` at 60-70% opacity with a `20px` backdrop-blur for floating navigation bars or modal overlays.

---

## 3. Typography
The type system is a dialogue between the past (Serif) and the future (Sans-Serif).

- **Display & Headlines (Noto Serif):** This is our "Editorial Voice." Large scales (`display-lg` at 3.5rem) should be used with tight letter-spacing to create a high-fashion, nostalgic impact.
- **Body & Titles (Manrope):** Our "Functional Voice." This Apple-like sans-serif provides clarity and a youthful, tech-forward feel.

**Hierarchy Strategy:** 
Headlines should never be just "labels"; they are moments of reflection. Use `headline-lg` for emotional prompts and `title-md` for structural navigation.

---

## 4. Elevation & Depth
We eschew heavy "material" shadows in favor of ambient light and tonal layering.

- **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card placed on a `surface-container` background creates a natural lift.
- **Ambient Shadows:** For floating elements (like a "Post Memory" FAB), use a shadow with a 32px-64px blur at 6% opacity. The shadow color must be a tinted version of `on-surface` (#1c1c19), never pure black.
- **The "Ghost Border" Fallback:** If a boundary is strictly required for accessibility, use `outline-variant` (#ddc0ba) at **15% opacity**.
- **Edge Softness:** All containers must use the `xl` (3rem) or `lg` (2rem) corner radius to maintain the "Soft Minimalism" feel.

---

## 5. Components

### Buttons
- **Primary:** Gradient fill (`primary` to `primary-container`), `full` roundedness, and a subtle white glow on hover.
- **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
- **Tertiary:** Text-only with an animated underline that expands from the center on hover.

### Cards & Lists
- **Cards:** Use `surface-container-lowest` with a `1.5rem` padding. Forbid dividers. Use `title-md` for the header and `body-md` for the content, separated by 1rem of white space.
- **Lists:** Separate items using a subtle shift to `surface-container-low` on hover. Never use horizontal lines.

### Input Fields
- **Styling:** Soft-filled containers using `surface-container-high` rather than outlined boxes.
- **Interaction:** On focus, the container should transition to `surface-container-lowest` with a delicate `primary` glow.

### Signature Components for "Seniors 2026"
- **The Memory Orb:** A floating, glassmorphic circular element used for story triggers, utilizing the indigo-to-violet gradient.
- **Editorial Grids:** Asymmetric image layouts where photos overlap and use varying corner radii (e.g., one corner at `xl`, others at `md`) to mimic a scrapbook.

---

## 6. Do's and Don'ts

### Do
- **Embrace Asymmetry:** Offset images and text blocks to create a rhythmic, magazine-like flow.
- **Use Micro-interactions:** Elements should "float" slightly on scroll (parallax) to feel alive.
- **Prioritize Breathing Room:** If a layout feels "busy," double the white space between sections.

### Don't
- **No Pure Black:** Never use `#000000` for text; use `on-surface` (#1c1c19) to maintain the warm, premium feel.
- **No Industrial Grids:** Avoid rigid, 12-column layouts that look like a corporate dashboard.
- **No Sharp Corners:** Avoid the `none` or `sm` roundedness tokens unless it's for a very specific functional utility.
- **No Default Shadows:** Never use the browser's default drop-shadow settings; they are too heavy for this "light as air" brand.