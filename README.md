# سایت انجمن علمی مهندسی کامپیوتر دانشگاه تبریز

Persian (RTL) website with a built-in admin panel. One Next.js app, an SQLite file and a folder of
uploads. No external services: the font is self-hosted and nothing is loaded from a CDN, so it works
from inside Iran.

## Run it

Requires Node.js 22.13 or newer (it uses Node's built-in SQLite).

```bash
npm install
cp .env.example .env        # then set ADMIN_PASSWORD (10+ characters)
npm run dev                 # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin`. The first admin account is created on first start from
`ADMIN_USERNAME` / `ADMIN_PASSWORD`. If no password is set, a random one is printed in the server log
and written to `data/admin-initial-password.txt`.

Locked out? `npm run reset-admin -- <username> <new-password>`

## What the admin panel manages

| Section | What it is |
| --- | --- |
| رویدادها | workshops, contests, courses, talks, meetups (Jalali date and time, poster, sign-up link) |
| خبرها و مقاله‌ها | news and articles, written in simple Markdown |
| نشریه | magazine issues with cover and PDF |
| گالری | photo albums (multi-upload) |
| تیم‌ها | teams such as OpenTab and TabLog; add a new team and it gets its own page and card |
| اعضا | members, their role, team, photo; "شورای مرکزی" flag puts them on the home page |
| افتخارات، برنامه‌ها، آمار | achievements, the roadmap, and the four numbers on the home page |
| متن‌ها و تماس | site name, home page texts, address and social links |
| مدیران | admin accounts |

The content that ships with the project (members, events, news, numbers) is **sample content** so the
design can be seen full. Replace or delete it from the panel before launch.

## Deploy on a VPS

```bash
npm ci
npm run build
ADMIN_PASSWORD='...' PORT=3000 npm start
```

- Keep it running with systemd or pm2, and put nginx (or Caddy) in front with HTTPS.
- nginx must pass the original host, otherwise saving in the admin panel is refused:
  `proxy_set_header Host $host;` and `proxy_set_header X-Forwarded-Proto $scheme;`
- Also raise nginx's upload limit, e.g. `client_max_body_size 60m;`
- Login cookies are HTTPS-only in production. Only if you really serve over plain http, set `INSECURE_COOKIES=1`.
- **Back up the `data/` folder** (database + uploads). That folder is the whole site content.

## Project map

- `lib/resources.js`: every content type and its fields. Tables, admin lists and admin forms are generated from it; add a field there and it appears everywhere.
- `lib/db.js`: database setup and the sample content. `lib/auth.js`: sessions. `lib/uploads.js`: file checks.
- `app/(site)/`: public pages. `app/admin/`: admin panel. `components/site/HeroScene.jsx`: the opening carpet scene.
- `MASTER.md`: the design system (colours, type, motion, voice).

## Security notes

Passwords are stored as scrypt hashes; sessions are random tokens in an HttpOnly cookie; every admin
page and action checks the session; uploads are accepted by file signature (images and PDF only, no
SVG) and stored under random names; Markdown is rendered with raw HTML escaped.
