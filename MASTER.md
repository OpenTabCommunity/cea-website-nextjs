# Design system: انجمن علمی مهندسی کامپیوتر دانشگاه تبریز

Single source of truth for the look and motion of the site. Tokens live in `app/globals.css`;
every colour, radius, duration and easing used in `app/(site)/site.css` comes from there.

## Idea

A Tabriz carpet cartoon is drawn on graph paper, one knot per cell. The site draws its one motif,
a lachak-toranj carpet, the same way: one knot per pixel cell (`lib/carpet.js`). The motif appears as
the opening scene, as the border strip between sections and as cover patterns where no photo exists.
The copy never talks about carpets or weaving; the idea stays visual.

## Visual thesis

Night-navy ground with full fields of carpet colour (madder red, turquoise, cream, cobalt), gold as the
single accent for actions; one family (Vazirmatn) with very heavy, very large headings against calm
body text; generous spacing on an 8px base; flat components with soft 22px corners and pill buttons,
separated by tone steps instead of lines or shadows.

## Interaction thesis

Interface feedback is quick (140ms press, 220ms hover) on a strong ease-out; scroll reveals are slower
(900 to 1000ms, expo ease-out, 90ms stagger) and "woven" blocks appear in 14 steps like rows of knots;
hover changes tone and nudges an arrow, team panels tilt at most 6 degrees; the opening carpet is
scroll-driven. No bounce or elastic, no parallax on text, nothing animates width, height or position
properties, and everything has a still version under `prefers-reduced-motion`.

## Colour

| Token | Hex | Use | Contrast |
| --- | --- | --- | --- |
| `--night` | `#060918` | page ground, ink on light fields | cream on night 16.7:1 |
| `--navy` | `#0D1440` | alternate sections, cards on night | cream on navy 14.9:1 |
| `--cobalt` | `#2B4FE0` | colour field, hover on member links | cream on cobalt 5.4:1 |
| `--laki` | `#A3182B` | colour field (marquee, join), row hover | cream on laki 6.5:1 |
| `--laki-deep` | `#5E0C19` | footer | cream 11.5:1, gold 7.6:1 |
| `--firoozeh` | `#19C7BD` | colour field (OpenTab), active states | night on firoozeh 9.4:1 |
| `--gold` | `#F2B83B` | the accent: buttons, dates, links, focus ring | night on gold 11.0:1, gold on night 11.0:1 |
| `--rose` | `#F08C7A` | carpet detail, one stat, avatar tint | night on rose 8.2:1 |
| `--cream` | `#F6EBD3` | main text, light colour field | night on cream 16.7:1, laki on cream 6.5:1 |
| `--mist` | `#B9C0E0` | secondary text | on night 11.0:1, on navy 9.8:1 |

Team cards and coloured page heads take one of: firoozeh, cream, laki, cobalt, gold (chosen per team in the admin panel).

## Type

Vazirmatn variable (self-hosted, `app/fonts/Vazirmatn.woff2`), weights 400 / 500 / 700 / 800 / 900.

| Role | Size | Weight | Line height |
| --- | --- | --- | --- |
| Hero title | `clamp(2.5rem, 7vw, 6.2rem)` | 900 | 1.25 |
| Page title | `clamp(2.6rem, 8vw, 6.8rem)` | 900 | 1.3 |
| Section heading | `clamp(2rem, 4.6vw, 4rem)` | 900 | 1.35 |
| Card heading | `clamp(1.15rem, 1.8vw, 1.45rem)` | 800 | 1.6 |
| Body | 18px | 400 | 1.9 |
| Long-form (prose) | 1.12rem, max 68ch | 400 | 2.1 |
| Meta | 0.9 to 0.95rem | 700 | 1.9 |

Persian text never gets letter-spacing. Latin names (OpenTab) are set `dir="ltr"`.

## Spacing, radius, elevation

- Spacing: 8, 12, 16, 24, 32, 48, 64, 96 (`--s1` to `--s8`); sections use `clamp(72px, 10vw, 150px)`.
- Radius: `--r-sm` 10px (admin inputs), `--r-md` 22px (cards, panels, rows), `--r-pill` for buttons and tags.
- Elevation: none at rest. Surfaces differ by one tone step (night ↔ navy). The only glow is the gold
  halo on a hovered primary button and the lamp over the carpet.

## Motion tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | press, hover, fades |
| `--ease-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | reveals, arrows, underline |
| `--t-press` | 140ms | button and row press (`scale(0.97)` / `0.99`) |
| `--t-hover` | 220ms | colour and tone changes |
| `--t-reveal` | 900ms | scroll reveals; "woven" reveal uses `steps(14)` |
| `--stagger` | 90ms | between siblings |

## Components (five states)

- **Button**: default gold pill; hover cream with gold halo; focus 3px gold outline, 4px offset; active `scale(0.97)`; disabled 55% opacity (admin).
- **Event row**: default tone surface; hover red field sweeps in from the right, arrow moves 12px; focus outline; active `scale(0.99)`.
- **Card**: cover (photo or woven pattern), meta, title; hover cover `scale(0.97)` and gold title; focus outline.
- **Team panel**: colour field, large name, tagline, pill link; hover tilt ≤ 6° and arrow nudge; focus outline; active `scale(0.99)`.
- **Nav link**: underline grows from the right on hover and stays on the current page.

## Admin panel

A quiet working surface in the same family: light ground `#F4F2EC`, white panels, ink `#10142E`,
teal action colour `#0C6F6A` (6.0:1 on white), navy sidebar. Thin borders and compact labels are
intentional there; no gradients, glows or decorative motion.

## Voice

Plain, direct, standard Persian. No slogans, no wordplay about carpets or weaving, no jokes in headings.
Say what the thing is: «رویدادهای پیش رو», «تیم‌های انجمن», «عضویت در انجمن».
