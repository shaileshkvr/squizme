# AI Quiz Builder — Color Palette

A warm **coffee / walnut / chocolate-cream** palette with a restrained dusty blue accent for AI and trust-related UI.

The design principle is simple:

- **Brown / walnut** = primary application identity and actions
- **Cream / off-white** = comfortable surfaces and backgrounds
- **Dusty blue** = AI, focus, links, and information states
- **Earthy green / amber / red** = status feedback
- Avoid pure black and harsh white wherever possible

---

## 1. Core Palette

| Role | Light Theme | Dark Theme |
|---|---|---|
| **App background** | `#F8F4EB` | `#1D0D00` |
| **Surface / cards** | `#FFFDF8` | `#2A160B` |
| **Elevated surface** | `#F1EADF` | `#3B1E11` |
| **Primary text** | `#24150E` | `#F8F4EB` |
| **Secondary text** | `#69594D` | `#CFC0B1` |
| **Muted / faded text** | `#918276` | `#A99584` |
| **Border** | `#DDD1C2` | `#51372A` |
| **Primary accent** | `#5A301D` | `#C28A69` |
| **Primary hover** | `#472313` | `#D09A78` |
| **AI / Trust blue** | `#416A7A` | `#79AFC2` |
| **AI-soft background** | `#E3EEF1` | `#1F343B` |
| **Success** | `#47705B` | `#82B99A` |
| **Warning** | `#96733B` | `#D2AE69` |
| **Error** | `#9A4D3F` | `#D98678` |

---

## 2. Original Colors

These were the starting colors that inspired the palette:

| Color | Hex | Intended character |
|---|---|---|
| Espresso | `#1D0D00` | Deep coffee / dark background |
| Walnut | `#3B1E11` | Rich brown / elevated surfaces |
| Soft cream | `#F8F4EB` | Warm off-white |
| Muted beige | `#C1B098` | Warm secondary neutral |

The palette keeps these colors close to their original character while adding intermediate shades for usable UI hierarchy and contrast.

---

# Light Theme

## Background Hierarchy

```text
#F8F4EB  →  App background
#FFFDF8  →  Cards / panels
#F1EADF  →  Hover / selected / subtle sections
```

### Recommended usage

- `#F8F4EB`: page background
- `#FFFDF8`: quiz cards, editor panels, sidebars, modals
- `#F1EADF`: hover states, selected navigation, secondary sections

The result should feel like warm paper rather than sterile white.

---

## Text

```text
#24150E  →  Primary text
#69594D  →  Secondary text
#918276  →  Muted text
```

### Example hierarchy

```text
Question 12 of 20       → #24150E
Science · Biology      → #69594D
Generated 2 min ago    → #918276
```

Use muted text only for information that does not need strong readability.

---

## Primary Actions

### Button

```text
Background: #5A301D
Text:       #FFFDF8
Hover:      #472313
```

Example:

```text
[ Generate Quiz ]
```

The primary CTA stays within the coffee/walnut identity instead of using the blue accent.

---

# Dark Theme

## Background Hierarchy

```text
#1D0D00  →  App background
#2A160B  →  Cards / panels
#3B1E11  →  Elevated / hover surfaces
```

Avoid using the same dark brown for every layer.

The three levels create visual elevation without needing shadows everywhere.

### Recommended usage

- `#1D0D00`: page background
- `#2A160B`: normal cards and panels
- `#3B1E11`: hover states, elevated panels, selected navigation

---

## Text

```text
#F8F4EB  →  Primary text
#CFC0B1  →  Secondary text
#A99584  →  Muted text
```

The warm cream is intentionally used instead of pure white to reduce the harshness of the dark theme.

---

## Primary Actions

```text
Background: #C28A69
Text:       #1D0D00
Hover:      #D09A78
```

This produces a warm caramel-on-espresso appearance.

---

# AI / Trust Accent

The blue should **not** dominate the interface.

Use it as a functional visual language:

```text
Brown / Walnut → Application identity
Blue           → AI / intelligence / information / focus
```

## Light

```text
AI:       #416A7A
AI-soft:  #E3EEF1
```

## Dark

```text
AI:       #79AFC2
AI-soft:  #1F343B
```

### Recommended uses

- AI-generated indicators
- AI assistant icon
- "Generate with AI"
- Information states
- Links
- Focus rings
- Progress indicators
- AI suggestions
- Intelligent recommendations

### Example

```text
✨ Generate Quiz
```

Use the blue for the icon, indicator, or supporting UI rather than making the entire button blue.

---

# AI Controls

## Light

```text
Background: #E3EEF1
Text:       #315765
Icon:       #416A7A
```

## Dark

```text
Background: #1F343B
Text:       #B9D8E1
Icon:       #79AFC2
```

This makes AI-related controls visually distinct without breaking the coffee aesthetic.

---

# Inputs

The quiz builder will likely contain many inputs:

- Topic
- Difficulty
- Number of questions
- Question type
- Source material
- Instructions
- AI settings

## Light

```text
Input background: #FFFDF8
Border:           #CFC1B2
Focus border:     #416A7A
Placeholder:      #918276
Text:             #24150E
```

## Dark

```text
Input background: #241208
Border:           #51372A
Focus border:     #79AFC2
Placeholder:      #A99584
Text:             #F8F4EB
```

The blue focus border clearly communicates interactivity without introducing a harsh neon color.

---

# Hover & Selected States

## Light

```text
Normal surface:  #FFFDF8
Hover:           #F1EADF
Selected:        #EDE0D3
```

## Dark

```text
Normal surface:  #2A160B
Hover:           #3B1E11
Selected:        #432618
```

Prefer changing the surface color over adding heavy shadows or dramatically darkening elements.

---

# Borders

## Light

```text
Default: #DDD1C2
Strong:  #CFC1B2
```

## Dark

```text
Default: #51372A
Strong:  #624638
```

Avoid pure black borders in the dark theme. They tend to disappear against dark backgrounds.

---

# Status Colors

Keep status colors slightly earthy so they remain compatible with the overall palette.

## Success

```text
Light: #47705B
Dark:  #82B99A
```

## Warning

```text
Light: #96733B
Dark:  #D2AE69
```

## Error

```text
Light: #9A4D3F
Dark:  #D98678
```

## Info

```text
Light: #416A7A
Dark:  #79AFC2
```

Avoid extremely saturated colors such as pure `#FF0000`, `#00FF00`, or `#0000FF`.

---

# Recommended Design Tokens

A semantic token system is preferable to scattering raw hex values throughout the application.

```css
:root {
  --bg: #F8F4EB;
  --surface: #FFFDF8;
  --surface-elevated: #F1EADF;

  --text: #24150E;
  --text-secondary: #69594D;
  --text-muted: #918276;

  --border: #DDD1C2;

  --primary: #5A301D;
  --primary-hover: #472313;

  --ai: #416A7A;
  --ai-soft: #E3EEF1;

  --success: #47705B;
  --warning: #96733B;
  --error: #9A4D3F;
}

.dark {
  --bg: #1D0D00;
  --surface: #2A160B;
  --surface-elevated: #3B1E11;

  --text: #F8F4EB;
  --text-secondary: #CFC0B1;
  --text-muted: #A99584;

  --border: #51372A;

  --primary: #C28A69;
  --primary-hover: #D09A78;

  --ai: #79AFC2;
  --ai-soft: #1F343B;

  --success: #82B99A;
  --warning: #D2AE69;
  --error: #D98678;
}
```

---

# Tailwind-Friendly Token Mapping

If using Tailwind, map semantic names rather than using the hex values directly throughout components.

```js
colors: {
  background: "var(--bg)",
  surface: "var(--surface)",
  "surface-elevated": "var(--surface-elevated)",

  text: "var(--text)",
  "text-secondary": "var(--text-secondary)",
  "text-muted": "var(--text-muted)",

  border: "var(--border)",

  primary: "var(--primary)",
  "primary-hover": "var(--primary-hover)",

  ai: "var(--ai)",
  "ai-soft": "var(--ai-soft)",

  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
}
```

---

# Visual Identity

The intended visual balance is roughly:

```text
80–90%  →  Cream / walnut / brown neutrals
10–20%  →  Blue + status colors
```

The blue should remain an **accent**, not become the main brand color.

The overall feel should be:

> **Warm · Calm · Scholarly · Technical · Intelligent · Refined**

Think of the interface as a modern study/workspace product with an AI layer, rather than a generic blue/purple AI SaaS dashboard.

---

# Final Palette Cheat Sheet

```text
                    LIGHT              DARK
──────────────────────────────────────────────────
Background          #F8F4EB            #1D0D00
Surface             #FFFDF8            #2A160B
Elevated            #F1EADF            #3B1E11

Primary text        #24150E            #F8F4EB
Secondary text      #69594D            #CFC0B1
Muted text          #918276            #A99584

Primary             #5A301D            #C28A69
Primary hover       #472313            #D09A78

AI / Trust          #416A7A            #79AFC2
AI soft             #E3EEF1            #1F343B

Border              #DDD1C2            #51372A

Success             #47705B            #82B99A
Warning             #96733B            #D2AE69
Error               #9A4D3F            #D98678
──────────────────────────────────────────────────
```

## Design Rule

**Keep the application brown/cream first and AI blue second.**

That gives the product a recognizable identity instead of making it look like every other AI product that discovered gradients five minutes ago.
