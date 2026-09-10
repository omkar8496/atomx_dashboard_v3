# AtomX Dashboard — Design System

A single-file handoff spec for building a **new** dashboard that looks and behaves like
the AtomX Portal dashboard. Every value here is copied from the shipping code, not
idealised — if you follow this file, the result will match.

**Audience:** a developer or an AI coding tool starting a fresh dashboard.
**Stack it assumes:** Tailwind CSS v4 + CSS custom properties. No `tailwind.config.js`
is needed — v4 reads arbitrary values and `bg-(--token)` shorthand directly.
Works with any React framework; nothing here is Next-specific except the boot script.

---

## 1. The one rule that matters

**Never hardcode a colour.** Every surface, text and border colour comes from a token,
so light/dark works for free. The only hex literals allowed in components are:

- the **brand gradients** (§4.4) — they are the same in both themes on purpose
- the three **status accents** (§4.5) — `#0e8f62`, `#0284c7`, `#e08a20`

Anything else must be `--bg`, `--surface`, `--surface2`, `--text`, `--muted`, `--faint`,
`--line`, `--line2`, `--chip`, `--orange`, `--blue`, `--lblue`, `--purple`.

---

## 2. Foundations — copy this CSS verbatim

```css
@import "tailwindcss";

/* ---------- Fonts ---------- */
/* Chillax = headings/display. Poppins = body/UI. VCR = data, labels, counts. */
@font-face { font-family: "Chillax"; src: url("/fonts/Chillax-Regular.woff2")  format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Chillax"; src: url("/fonts/Chillax-Medium.woff2")   format("woff2"); font-weight: 500; font-display: swap; }
@font-face { font-family: "Chillax"; src: url("/fonts/Chillax-Semibold.woff2") format("woff2"); font-weight: 600; font-display: swap; }
@font-face { font-family: "Chillax"; src: url("/fonts/Chillax-Bold.woff2")     format("woff2"); font-weight: 700; font-display: swap; }

@font-face { font-family: "Poppins"; src: url("/fonts/Poppins-Light.ttf")    format("truetype"); font-weight: 300; font-display: swap; }
@font-face { font-family: "Poppins"; src: url("/fonts/Poppins-Regular.ttf")  format("truetype"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Poppins"; src: url("/fonts/Poppins-SemiBold.ttf") format("truetype"); font-weight: 600; font-display: swap; }
@font-face { font-family: "Poppins"; src: url("/fonts/Poppins-Bold.ttf")     format("truetype"); font-weight: 700; font-display: swap; }

@font-face { font-family: "VCR"; src: url("/fonts/VCR_OSD_MONO_1.001.ttf") format("truetype"); font-weight: 400; font-display: swap; }

/* ---------- Light theme (default) ---------- */
:root {
  --bg:       #f2f1ee;   /* page canvas — warm off-white, never pure white */
  --surface:  #ffffff;   /* cards, panels, inputs */
  --surface2: #f8f7f5;   /* nested panels, table headers, footers */
  --text:     #1c1c1c;   /* primary text AND primary button fill */
  --muted:    #71706e;   /* secondary text, inactive controls */
  --faint:    #9b9a97;   /* micro-labels, placeholders */
  --line:     rgba(28, 28, 28, 0.12);   /* borders */
  --line2:    rgba(28, 28, 28, 0.06);   /* inner dividers, table row lines */
  --chip:     rgba(28, 28, 28, 0.045);  /* count chips, hover fills */

  --orange:   #e04420;   /* brand primary — accents, active, CTA hover */
  --blue:     #341cd6;   /* brand secondary */
  --lblue:    #00a9f2;   /* info */
  --purple:   #8b5cf6;   /* gradient partner */
  --egg:      #ebebeb;

  --rail:     #d03f20;   /* side navigation background */
  --railText: #ffffff;
  --railActive:     #ffffff;   /* active nav item fill */
  --railActiveText: #1c1c1c;

  --shadow:   0 1px 2px rgba(28, 28, 28, 0.04), 0 10px 30px -18px rgba(28, 28, 28, 0.25);
  --shadowUp: 0 2px 4px rgba(28, 28, 28, 0.05), 0 18px 40px -20px rgba(28, 28, 28, 0.35);

  color-scheme: light;
}

/* ---------- Dark theme ---------- */
html[data-atx="dark"] {
  --bg:       #0c0c0c;
  --surface:  #181818;
  --surface2: #212120;
  --text:     #ebebeb;
  --muted:    #8e8d8a;
  --faint:    #6b6a67;
  --line:     rgba(235, 235, 235, 0.14);
  --line2:    rgba(235, 235, 235, 0.07);
  --chip:     rgba(235, 235, 235, 0.06);

  --purple:   #d5b7ff;   /* lifted for contrast on dark */
  --rail:           #992f16;   /* dark orange - same hue as light, dropped in luminance */

  --shadow:   0 1px 2px rgba(0, 0, 0, 0.5), 0 10px 30px -18px rgba(0, 0, 0, 0.9);
  --shadowUp: 0 2px 6px rgba(0, 0, 0, 0.6), 0 18px 40px -20px rgba(0, 0, 0, 1);

  color-scheme: dark;
}

/* ---------- Font helpers ---------- */
.font-chillax { font-family: "Chillax", "Poppins", "Segoe UI", system-ui, sans-serif; }
.font-vcr     { font-family: "VCR", "VCR OSD Mono", ui-monospace, "SFMono-Regular", monospace; }

body { background: var(--bg); color: var(--text); font-family: "Poppins", system-ui, sans-serif; }
```

### Theme switching

Dark mode is an attribute on `<html>`, persisted in `localStorage` under `atomx.theme`.
Put this **inline in `<head>`** so the saved theme applies before first paint — without it
you get a white flash on every load:

```html
<script>
try {
  var t = localStorage.getItem('atomx.theme');
  if (t === 'dark') document.documentElement.setAttribute('data-atx', 'dark');
} catch (e) {}
</script>
```

Toggle:

```js
const next = isDark ? "light" : "dark";
next === "dark"
  ? document.documentElement.setAttribute("data-atx", "dark")
  : document.documentElement.removeAttribute("data-atx");
localStorage.setItem("atomx.theme", next);
```

---

## 3. Typography

Three faces, each with one job. Mixing them up is the fastest way to break the look.

| Face | Class | Used for |
|---|---|---|
| **Chillax** | `font-chillax` | Page titles, panel titles, card names, numbers that matter |
| **Poppins** | (default on body) | All body copy, buttons, inputs, table cells |
| **VCR** (mono) | `font-vcr` | Micro-labels, counts, IDs, timestamps, status text, kickers |

**Type scale actually in use:**

| Role | Classes |
|---|---|
| Page title | `font-chillax text-[clamp(24px,3vw,32px)] font-semibold leading-[1.05] tracking-[-0.02em]` |
| Page subtitle | `text-[13.5px] font-light text-(--muted)` |
| Panel title | `font-chillax text-[18px] font-semibold` (section: `text-[17px]`) |
| Card title | `font-chillax text-[14.5px] font-semibold tracking-[-0.01em]` |
| Body / control | `text-[13px] font-medium` |
| Small body | `text-[12.5px]` |
| Micro-label | `font-vcr text-[8.5px] uppercase tracking-[0.16em] text-(--muted)` |
| Table micro-label | `font-vcr text-[7.5px] tracking-[0.15em] text-(--faint)` |
| Count / kicker | `font-vcr text-[9px] tracking-[0.14em]` |

VCR text is **always uppercase with wide tracking** (`0.1em`–`0.2em`) and small (7.5–9.5px).
That contrast — tiny wide mono labels against Chillax headings — is the signature of the system.

---

## 4. Colour usage

### 4.1 Semantic roles
- **Page** `bg-(--bg)` → **panel** `bg-(--surface)` → **nested panel / header / footer** `bg-(--surface2)`
- Text ladder: `text-(--text)` → `text-(--muted)` → `text-(--faint)`
- Borders: outer `border-(--line)`, inner dividers `border-(--line2)`

### 4.2 What orange means
`--orange` is **accent, not decoration**: active tab, active nav item, focus ring, left
accent bar on panels, primary-button hover, links, error text. Never a large fill.

### 4.3 Orange tint scale (exact values, most-used first)
| Tint | Use |
|---|---|
| `rgba(224,68,32,0.06)` | selected/hover fill, error box background |
| `rgba(224,68,32,0.12)` | focus ring, date-range in-between fill |
| `rgba(224,68,32,0.25)` | error box border |
| `rgba(224,68,32,0.4)` | dashed dropzone border |

### 4.4 Brand gradients (identical in both themes)
```css
/* Icon / count tiles — 140deg */
linear-gradient(140deg,#e04420,#8b5cf6)   /* default */
linear-gradient(140deg,#00a9f2,#341cd6)   /* info variant */
linear-gradient(140deg,#8b5cf6,#341cd6)   /* analytics variant */

/* Interactive controls (toggles, dropdown buttons) — 135deg */
linear-gradient(135deg,#E04420,#341CD6)

/* Dark banner (modal headers) — 135deg, three stops */
linear-gradient(135deg,#1C1C1C 0%,#241C4A 74%,#341CD6 155%)

/* Gradient border on a card: padding-box + border-box trick */
background:
  linear-gradient(var(--surface),var(--surface)) padding-box,
  linear-gradient(135deg,rgba(224,68,32,.34),rgba(139,92,246,.26) 52%,rgba(0,169,242,.22)) border-box;
border: 1px solid transparent;
```

### 4.5 Status accents
| State | Colour | Background |
|---|---|---|
| Success / completed | `#0e8f62` (or `#177657`) | `rgba(14,143,98,0.08)` |
| Info / active | `#0284c7` | `rgba(0,169,242,0.1)` |
| Warning / pending | `#e08a20` | — |
| Error / void | `var(--orange)` | `rgba(224,68,32,0.06)` |

---

## 5. Shape, spacing, motion

**Radii** — pick by element size, don't improvise:

| Radius | Element |
|---|---|
| `rounded-[6px]` | count chips |
| `rounded-[8px]` / `[9px]` | icon buttons, small pills, day cells |
| `rounded-[10px]` | **inputs, buttons, dropdowns** (most common by far) |
| `rounded-[11px]` / `[12px]` | nav items, nested panels |
| `rounded-[14px]` / `[15px]` | cards, panels |
| `rounded-[16px]` | modals |
| `rounded-full` | toggles, avatars, status dots |

**Fluid spacing** — sections use `clamp()` so density scales with the viewport:
`gap-[clamp(12px,1.4vw,18px)]`, `mt-[clamp(16px,2vw,22px)]`, `p-[clamp(16px,2vw,24px)]`.

**Motion** — `transition` (colours) or `transition-colors duration-200`; hover elevation
`hover:-translate-y-[3px]` with `hover:shadow-(--shadowUp)`. Spinners: `animate-spin`.
Nothing bounces, nothing exceeds ~300 ms.

---

## 6. Components — exact classes

### 6.1 Panel (the workhorse)
```html
<section class="rounded-[15px] border border-(--line) border-l-[3px] border-l-(--orange)
                bg-(--surface) p-4 shadow-(--shadow)">
```
The **3px orange left bar** marks a primary content panel. Drop it for secondary/nested panels.

Panel header with count tile:
```html
<div class="mb-3 flex items-center gap-2.5 border-b border-(--line2) pb-3">
  <span class="font-vcr grid h-9 w-9 place-items-center rounded-[10px]
               bg-[linear-gradient(140deg,#e04420,#8b5cf6)] text-[12px] text-white">04</span>
  <div>
    <h2 class="font-chillax text-[18px] font-semibold text-(--text)">Title</h2>
    <p class="mt-0.5 text-[12.5px] font-light text-(--muted)">Hint</p>
  </div>
</div>
```
Counts are **zero-padded to 2 digits** in VCR: `String(n).padStart(2, "0")`.

### 6.2 Buttons
```html
<!-- Primary: dark fill, orange on hover (NOT orange by default) -->
<button class="h-11 cursor-pointer rounded-[10px] bg-(--text) px-5 text-[13.5px] font-semibold
               text-(--bg) transition hover:bg-(--orange)
               disabled:cursor-not-allowed disabled:opacity-55">

<!-- Secondary -->
<button class="h-11 cursor-pointer rounded-[10px] border border-(--line) bg-(--surface) px-4
               text-[13px] font-semibold text-(--muted) transition
               hover:border-(--orange) hover:text-(--orange)">

<!-- Destructive / warning -->
<button class="h-11 cursor-pointer rounded-[10px] bg-(--orange) px-5 text-[13.5px]
               font-semibold text-white transition hover:bg-(--text) hover:text-(--bg)">

<!-- Icon-only: ALWAYS needs aria-label + title -->
<button aria-label="Edit" title="Edit"
        class="grid h-8 w-8 cursor-pointer place-items-center rounded-[9px] border
               border-(--line) text-(--muted) transition
               hover:border-(--orange) hover:text-(--orange)">
```
`<button>` does not get a pointer cursor from the browser — **add `cursor-pointer` every time**.

### 6.3 Inputs
```html
<!-- Text input (h-11 desktop, h-10 mobile) -->
<input class="h-11 w-full rounded-[10px] border border-(--line) bg-(--surface) px-3.5
              text-[13px] font-medium text-(--text) outline-none transition
              placeholder:text-(--faint)
              focus:border-(--orange) focus:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]
              max-[640px]:h-10" />

<!-- Field label above it -->
<span class="font-vcr mb-1.5 block text-[8.5px] uppercase tracking-[0.16em] text-(--muted)">LABEL</span>

<!-- Select: same class + appearance-none pr-9, with an absolute chevron -->
<select class="... cursor-pointer appearance-none pr-9">
<span class="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 opacity-50">▾</span>

<!-- Search -->
<label class="flex h-11 items-center gap-2.5 rounded-[10px] border border-(--line) bg-(--surface)
              px-3.5 focus-within:border-(--orange)
              focus-within:shadow-[0_0_0_3px_rgba(224,68,32,0.12)]">
```
`shadow-[0_0_0_3px_rgba(224,68,32,0.12)]` is **the** focus ring. Use it everywhere.

### 6.4 Toggle, checkbox, radio
```html
<!-- Toggle: gradient when on, --line when off -->
<button class="flex h-7 w-[54px] cursor-pointer items-center rounded-full p-1
               transition-all duration-200
               [&.on]:bg-[linear-gradient(135deg,#E04420,#341CD6)] bg-(--line)">
  <span class="h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200
               translate-x-0 /* on: translate-x-[26px] */"></span>
</button>

<!-- Checkbox: orange fill + white tick when checked -->
<span class="grid h-4 w-4 place-items-center rounded-[4px] border
             border-(--orange) bg-(--orange) text-white"> ✓ </span>
```

### 6.5 Chips and badges
```html
<!-- Count chip -->
<span class="font-vcr rounded-[6px] bg-(--chip) px-1.5 py-0.5 text-[9.5px] text-(--faint)">07</span>
<!-- Active count chip -->
<span class="font-vcr rounded-[6px] bg-(--text) px-1.5 py-0.5 text-[9.5px] text-(--bg)">07</span>
<!-- Status badge -->
<span class="font-vcr rounded-[6px] px-2 py-1 text-[8.5px] uppercase tracking-[0.1em]
             bg-[rgba(14,143,98,0.08)] text-[#0e8f62]">completed</span>
```

### 6.6 Tabs (horizontal) — the standard page-level nav
```html
<div class="flex gap-1 border-b border-(--line)">
  <button class="flex cursor-pointer items-center gap-2 border-b-2 px-3.5 pb-2.5 pt-2
                 text-[13px] transition
                 border-(--orange) font-semibold text-(--text)"><!-- active -->
    Overview
  </button>
  <button class="... border-transparent font-normal text-(--muted) hover:text-(--text)">
    Downloads <span class="font-vcr ...">12</span>
  </button>
</div>
```

### 6.7 Left section rail (for pages with many groups)
```html
<nav class="lg:sticky lg:top-[74px] lg:w-[232px] lg:shrink-0">
  <div class="font-vcr mb-2 px-1 text-[8.5px] uppercase tracking-[0.18em] text-(--faint)">SECTIONS</div>
  <button class="flex w-full cursor-pointer items-center gap-3 rounded-[11px] border border-l-[3px]
                 px-3 py-2.5 text-left transition
                 border-(--line) border-l-(--orange) bg-(--surface) shadow-(--shadow)"><!-- active -->
    <span class="flex-1">
      <span class="block text-[13px] font-semibold text-(--text)">Vendors</span>
      <span class="font-vcr mt-0.5 block text-[8px] uppercase tracking-[0.14em] text-(--faint)">Accounts</span>
    </span>
    <span class="font-vcr rounded-[6px] bg-(--text) px-1.5 py-1 text-[9.5px] text-(--bg)">12</span>
  </button>
  <!-- inactive: border-transparent hover:bg-(--chip), label text-(--muted) -->
</nav>
```
Below `lg` this becomes a horizontal scroll strip (`flex gap-2 overflow-x-auto` + hidden scrollbar).

### 6.8 Tables
```html
<div class="overflow-x-auto">                       <!-- scroll belongs to the table container -->
  <table class="w-full min-w-[940px] border-collapse text-left">
    <thead class="bg-(--surface2)">
      <tr class="border-b border-(--line2)">
        <th class="font-vcr px-4 py-3 text-[9px] font-normal uppercase tracking-[0.14em] text-(--faint)">ID</th>
    <tbody>
      <tr class="border-b border-(--line2) transition last:border-b-0 hover:bg-(--surface2)">
        <td class="px-4 py-3 text-[12.5px] text-(--text)">…</td>
```
Row lists that scroll vertically: `max-h-[min(600px,calc(100dvh-300px))] overflow-y-auto`.
Operational tables stay **dense** — designed to scan 50+ rows.

### 6.9 Modal
```html
<!-- Scrim -->
<div class="fixed inset-0 z-[240] flex items-center justify-center bg-[rgba(12,12,12,0.5)]
            px-4 py-6 backdrop-blur-[3px] max-[820px]:p-0">
  <!-- Panel: full-screen on mobile -->
  <div role="dialog" aria-modal="true"
       class="flex max-h-[calc(100dvh-48px)] w-[820px] max-w-full flex-col overflow-hidden
              rounded-[16px] border border-(--line) bg-(--surface) shadow-(--shadowUp)
              max-[820px]:h-full max-[820px]:max-h-full max-[820px]:rounded-none">
    <!-- Banner: dark gradient + VCR kicker + Chillax title -->
    <div class="relative flex shrink-0 items-start gap-3 px-6 py-5 text-[#ebebeb]"
         style="background:linear-gradient(135deg,#1C1C1C 0%,#241C4A 74%,#341CD6 155%)">
      <div class="font-vcr text-[9px] tracking-[0.2em] text-(--purple)">KICKER</div>
      <h2 class="font-chillax text-[clamp(20px,2.4vw,26px)] font-semibold text-white">Title</h2>
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">…</div>
    <!-- Sticky footer: Cancel + primary; 2-col grid on mobile -->
    <div class="flex shrink-0 items-center gap-2.5 border-t border-(--line) bg-(--surface2) px-6 py-3">
  </div>
</div>
```
Also: lock `body` scroll while open, close on **Escape** and on scrim click.
Optional 1px scan-line texture over the banner:
`background:repeating-linear-gradient(90deg,#fff 0 1px,transparent 1px 34px); opacity:.12`

### 6.10 States — every async surface needs all four
```html
<!-- Loading -->
<div class="grid min-h-[150px] place-items-center text-[13px] font-medium text-(--muted)">Loading…</div>
<span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-(--orange) border-t-transparent"></span>

<!-- Empty -->
<div class="rounded-[11px] border border-dashed border-(--line) px-4 py-8 text-center
            text-[13px] font-medium text-(--muted)">No records found.</div>

<!-- Error -->
<div class="rounded-[10px] border border-[rgba(224,68,32,0.25)] bg-[rgba(224,68,32,0.06)]
            px-3.5 py-2.5 text-[12.5px] font-semibold text-(--orange)">Unable to load.</div>

<!-- Success -->
<div class="rounded-[10px] border border-[rgba(0,169,242,0.28)] bg-[rgba(0,169,242,0.08)]
            px-3.5 py-2.5 text-[12.5px] font-semibold text-[#0284c7]">Saved.</div>
```

### 6.11 Card grid
```html
<div class="grid gap-[clamp(12px,1.2vw,16px)]"
     style="grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))">
```
Never a fixed column count — always `auto-fill` + `minmax(min(100%,Npx),1fr)` so it
reflows without breakpoints. Use 250px for dense card walls, 300px for content cards.

---

## 7. App shell

```
┌──────────────────────────────────────────────────────────┐
│ Header — fixed, 58px, bg-(--surface), border-b           │
├───┬──────────────────────────────────────────────────────┤
│ R │  Page content                                        │
│ a │  max-w-[1780px], pl-[72px] md:pl-[88px], pr-4 md:pr-7│
│ i │                                                      │
│ l │  60px collapsed → 248px on hover, bg-(--rail)        │
└───┴──────────────────────────────────────────────────────┘
```

- **Header**: `fixed left-0 right-0 top-0 z-40`, height 58px, `border-b border-(--line) bg-(--surface) shadow-(--shadow)`. Contains logo, `Portal / <Area>` breadcrumb (Chillax, area in `--orange`), context id in VCR, theme toggle, profile menu.
- **Rail** also carries a `border-r border-white/10` hairline: every dark rail candidate
  sits within ~1.2:1 of the page canvas, so the edge needs defining.
- **Rail**: `w-[60px] group-hover:w-[248px] transition-[width] duration-300`, `bg-(--rail) text-(--railText)`. Active item = `bg-(--railActive) text-(--railActiveText)`; hover = `bg-white/[0.09]`. Icons always visible, labels fade in.
- **Page padding**: `pl-[72px] md:pl-[88px]` clears the collapsed rail. Below 900px the rail becomes a drawer and pages switch to `px-3`.
- **Page header block**: title + subtitle + `<div class="mt-[clamp(16px,2vw,22px)] h-px w-full bg-(--line)" />` divider. Primary page action sits on the same row, right-aligned.

---

## 8. Accessibility (verified, not aspirational)

- Light rail `#d03f20` vs `--railText #ffffff` = **4.76:1** (passes AA; it is **3.99:1**
  against `#ebebeb`, which is why railText is pure white). Dark rail `#992f16` vs white =
  **7.57:1**.
- The active nav item is tokenised (`--railActive` / `--railActiveText`) so a re-coloured
  rail can change it without touching components. Both themes currently use the white
  pill: **4.76:1** on the light rail, **7.57:1** on the dark one. Note an orange active
  fill would NOT work on a dark-orange rail (1.8:1) — if the rail ever goes near-black,
  switch the active fill to orange instead. Re-check both pairs after any rail change.
- Icon-only buttons **must** have `aria-label` **and** `title`.
- Tabs: `role="tablist"` / `role="tab"` / `aria-selected`. Nav: `aria-current="page"`.
- Toggles: `aria-pressed`. Radio-like choices: `role="radio"` + `aria-checked`.
- Live regions for async status: `role="status"` + `aria-live="polite"`.
- Disabled = `disabled:cursor-not-allowed disabled:opacity-55` **plus** a `title` saying why.

---

## 9. Do / Don't

| Do | Don't |
|---|---|
| `bg-(--surface)` | `bg-white` |
| `text-(--muted)` | `text-slate-500` |
| One accent (orange) per view | Rainbow status colours |
| `cursor-pointer` on every button | Rely on browser default |
| Zero-pad counts in VCR | Plain numbers in body font |
| `h-11 rounded-[10px]` controls | Mixed heights per screen |
| Panels on `--bg`, nested on `--surface2` | Same colour stacked on itself |
| Dense operational tables | Airy padding that shows 6 rows |
| All four async states | Only the happy path |

---

## 10. New-screen checklist

1. Page shell: `bg-(--bg)`, `max-w-[1780px]`, rail padding.
2. Header block: Chillax title + `--muted` subtitle + `--line` divider; primary action right-aligned same row.
3. Content in panels (`rounded-[15px]`, orange left bar for primary ones).
4. Group with tabs (§6.6) or a left rail (§6.7) if there is more than one table.
5. Every control `h-11 rounded-[10px]` with the standard focus ring.
6. Loading + empty + error + success states wired.
7. Icon buttons labelled; counts zero-padded in VCR.
8. **Check dark mode** — if anything is hardcoded hex, it will show here.
9. Check ~360px and ~1920px widths; tables scroll inside their own container.
