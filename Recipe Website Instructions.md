# Recipy Website — Build Instructions

## Project Overview

Build a recipe discovery website called **Recipy** based on the provided design mockups. The site features a recipes listing page with filtering, a hero banner, recipe cards, and a footer. Use the two provided food photos as recipe card images throughout the page.

---

## Brand & Style Guide

### Colors
| Role | Hex |
|---|---|
| Primary Green | `#3BB812` |
| Dark Green | `#005512` |
| Orange Accent | `#FF7A00` |
| Cream / Background | `#FFF6E5` |
| Near-Black / Text | `#170805` |
| Medium Gray | `#555555` |
| Light Blue | `#E6F1FC` |
| Yellow | `#FFC222` |
| White | `#FFFFFF` |

### Typography
- **Heading Font**: Canela Text Trial (serif, elegant) — load via `@font-face` or substitute with **Playfair Display** from Google Fonts as the closest available alternative
- **Body Font**: A clean sans-serif such as **DM Sans** or **Lato**
- Use Medium, Semi-Bold, and Bold weights

### Logo
Text logo: **RECIPY** in bold `#3BB812` green, all caps, serif or display font

---

## Available Images

Use these two uploaded photos as the recipe card images throughout the page. Alternate or repeat them across cards:

- `photo-1.jpg` — *(first food photo)*
- `photo-2.jpg` — *(second food photo)*

Since there are only 2 images for 20 recipe cards, **repeat them** in a varied pattern (e.g., odd cards use photo-1, even cards use photo-2, or shuffle the order). Apply `object-fit: cover` so they always fill the card image area attractively.

---

## Page Structure

### 1. Top Announcement Bar
A slim bar above the navbar with 3 promotional links:
- 🎁 Shop the Gift Edit
- 🍪 Tap for Holiday Cookies
- 🍽️ Our Best Hosting Hacks

Style: cream/beige background (`#FFF6E5`), small centered text, icon emojis or SVG icons

---

### 2. Navigation Bar
- **Left**: RECIPY logo in green
- **Center**: Nav links — `Recipes ▾`, `Bundles`, `Blog`
- **Right**: Search bar (rounded pill input), Cart icon, Bookmark icon
- Background: white, sticky on scroll

---

### 3. Hero Banner
- Full-width image banner (dark food photography overlay)
- Use a dark overlay (`rgba(0,0,0,0.45)`) on a background gradient or solid dark color if no hero image is available
- Centered large white heading: **"Recipes"** in the heading serif font (~72px)
- Minimum height: `420px`

---

### 4. Filter / Category Bar
Below the hero, a sticky white bar containing:

**Left side — category pills** (plain text buttons, not filled):
- Uncooked Vegetarian food
- Light Cuisine
- High Proteins
- Vegetarian
- Fish
- Vegan

**Right side — sorting controls:**
- `Popular ▾` dropdown
- `⚙ More Filter` button

Style: light border-bottom on the bar, hover state underlines the active pill in green

---

### 5. Recipe Card Grid

Display **20 recipe cards** in a **4-column grid** (responsive: 2 cols on tablet, 1 col on mobile).

#### Each Card Contains:
- **Image** (tall, ~260px): food photo with `object-fit: cover`, slightly rounded corners (`border-radius: 12px`)
- **Gradient overlay** at the bottom of the image fading from transparent → `rgba(0,0,0,0.75)`
- **Recipe title** in white serif font, overlaid on the bottom of the image
- **Author row** overlaid at the very bottom: small circular avatar (placeholder initial or icon), author name, and subtitle (e.g., "Cookbook Author, Little" or "Food Couch")

#### Recipe Names to Use (cycle through these):
1. Winter tarte flambée — Michaela Titz
2. Winter rice pudding — Anna Mahlodji
3. Cauliflower & carrot soup — Jane Cooper
4. Barbary duck breast — Wade Warren
5. Paprika chicken with spaetzle — Leslie Alexander
6. Creamy pasta casserole with tomatoes & mozzarella — Eleanor Pena
7. Hummus with naan bread — Arlene McCoy
8. Veggie Moussaka — Theresa Webb
9. Winter tarte flambée — Courtney Henry
10. Risotto with shiitake mushrooms — Jerome Bell
11. Sweet potato curry with sugar snap — Dianne Russell
12. Vegetarian lentil curry — Dianne Russell
13. Pasta Al Limone — Darlene Robertson
14. Winter rice pudding — Ralph Edwards
15. Vegan Oatmeal Egg — Bessie Cooper
16. Barbary duck breast — Cody Fisher
17. Winter tarte flambée — Michaela Titz
18. Oriental stew with roasted cauliflower and beetroot — Jenny Wilson
19. Breakfast tart — Brooklyn Simmons
20. Barbary duck breast — Cameron Williamson

Author subtitles alternate between **"Cookbook Author, Little"** and **"Food Couch"**.

---

### 6. Pagination
Centered below the grid:
`‹ Previous   1   2   3   …   10   Next ›`

Active page (`1`) has a filled green circle background. Style as a clean row of page number buttons.

---

### 7. Footer

**Top section** — 4 columns:
- **Col 1**: RECIPY logo + tagline text + social icons (LinkedIn, Facebook, Twitter)
- **Col 2**: Enterprise links — About us, Jobs, Press, Privacy, Terms, Imprint
- **Col 3**: Learn links — How it works, Become a Creator, FAQ, Info and Guides, Blog, Contact
- **Col 4**: Subscribe form — email input + green arrow submit button + short blurb text

**Bottom bar**: `© Recipy 2023` on left · `Terms · Privacy · Cookies` in center · `Site map` on right

Footer background: light cream (`#FFF6E5`) or white; text in `#555555`

---

## Interactions & Polish

- **Hover on recipe cards**: subtle scale-up (`transform: scale(1.02)`) with a smooth transition
- **Category pills**: clicking one highlights it in green with white text
- **Search bar**: focus state shows green border
- **Nav**: becomes slightly shadowed on scroll (use scroll event listener)
- **Cards animate in** on page load: staggered fade-up using CSS `animation-delay` (20 cards, delay increments of ~50ms)

---

## Technical Requirements

- **Framework**: Plain HTML + CSS + vanilla JS (or React if preferred)
- Use **CSS custom properties** for all brand colors
- Fully **responsive**: 4-col → 2-col → 1-col grid breakpoints at 1024px and 640px
- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- Images use `loading="lazy"` and `alt` text
- No external UI libraries; only Google Fonts for typography

---

## File Deliverable

Produce a single `index.html` file with all CSS in a `<style>` block and all JS in a `<script>` block at the bottom. The two food photos should be referenced by their filenames (`photo-1.jpg` and `photo-2.jpg`) and assumed to be in the same directory.
