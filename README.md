# JPIC Website — jpeducation.net
**St. John Paul II International College** | Wennappuwa, Sri Lanka

---

## Tech Stack
- **HTML5 + CSS3 + Vanilla JS** — no build step required
- **Hosting**: Cloudflare Pages (free, global CDN)
- **CMS**: Decap CMS (for news/blog publishing)
- **Repo**: GitHub (auto-deploy on push)

---

## Project Structure
```
JPIC-Website/
├── index.html                  ← Home page
├── _headers                    ← Cloudflare security headers
├── _redirects                  ← Legacy URL redirects
├── robots.txt
│
├── assets/
│   ├── css/
│   │   ├── main.css            ← Design system + all tokens
│   │   ├── components.css      ← Nav + Footer styles
│   │   └── home.css            ← Home page specific styles
│   ├── js/
│   │   └── main.js             ← Component loader, nav, animations
│   ├── images/
│   │   ├── school-logo.png
│   │   ├── cambridge-logo.png
│   │   ├── favicon.png
│   │   ├── Hero_Image.jpg
│   │   ├── Banner_Image.jpg
│   │   └── news/               ← News post images
│   └── fonts/
│
├── components/
│   ├── nav.html                ← Shared navigation (loaded via fetch)
│   └── footer.html             ← Shared footer (loaded via fetch)
│
├── data/
│   └── news.json               ← News posts index
│
├── about/
│   ├── index.html              ← About landing
│   ├── our-story/index.html
│   ├── our-school/index.html
│   ├── vision-and-mission/index.html
│   ├── coat-of-arms/index.html
│   ├── school-flag/index.html
│   ├── school-houses/index.html
│   ├── governance/index.html
│   ├── academic-council/index.html
│   ├── bishops-message/index.html
│   ├── rectors-message/index.html
│   ├── principals-message/index.html
│   └── school-anthem/index.html
│
├── academic/
│   ├── index.html
│   ├── academic-staff/index.html
│   ├── academic-pathways/index.html
│   ├── benefits/index.html
│   ├── term-dates/index.html
│   ├── academic-calendar/index.html
│   ├── cambridge-early-years/index.html
│   ├── cambridge-primary/index.html
│   ├── cambridge-lower-secondary/index.html
│   ├── cambridge-upper-secondary/index.html
│   └── cambridge-advanced/index.html
│
├── student-life/
│   ├── index.html
│   ├── spiritual-formation/index.html
│   ├── pastoral-formation/index.html
│   └── prefects/index.html
│
├── gallery/
│   └── index.html
│
├── admissions/
│   └── index.html              ← Includes AdmissionsHQ enquiry form
│
├── news/
│   ├── index.html              ← News listing (from news.json)
│   ├── notices/index.html
│   ├── events/index.html
│   └── posts/                  ← Individual news post pages
│
├── contact/
│   └── index.html
│
└── admin/
    ├── index.html              ← Decap CMS panel
    └── config.yml              ← Decap CMS configuration
```

---

## Design System

### Colors
| Token | Value | Use |
|---|---|---|
| Oxford Blue | `#002147` | Primary dark, headings, backgrounds |
| Medium Champagne | `#FFE69E` | Gold accent, highlights |
| Tiffany Blue | `#00BDB6` | CTAs, active states, links |
| Turquoise | `#3BE0D0` | Hover states |
| Baby Powder | `#F7FAFA` | Page background |
| Eerie Black | `#1F2121` | Body text |

### Typography
- **Display/Headings**: Playfair Display
- **Body/UI**: DM Sans
- **Accent/Italic**: Cormorant Garamond

---

## Component Loader

Every page includes nav and footer via JS fetch:
```html
<div data-component="nav"></div>
...
<div data-component="footer"></div>
<script src="/assets/js/main.js"></script>
```

For pages NOT at root depth, set `data-root`:
```html
<html lang="en" data-root="../../">
```

---

## News Feed

`data/news.json` schema:
```json
{
  "id": "4",
  "title": "Post title",
  "slug": "post-slug",
  "date": "2025-01-15",
  "category": "News",
  "excerpt": "Short description (1-2 sentences)",
  "image": "assets/images/news/image.jpg",
  "featured": false
}
```

---

## AdmissionsHQ Integration

Enquiry form on `/admissions/` posts to:
- **Dev**: `http://localhost:3100/api/v1/public/leads/inquiry`
- **Production**: `https://api.jpeducation.net/api/v1/public/leads/inquiry`

Set via `data-api-url` attribute on the form element:
```html
<form id="enquiry-form" data-api-url="https://api.jpeducation.net/api/v1/public/leads/inquiry">
```

---

## Deployment

1. Push to GitHub
2. Cloudflare Pages auto-detects → builds in ~45s
3. Live at jpeducation.net

No build command needed. Output directory: `/` (root).

---

## Key Contacts
- admissions@jpeducation.net
- info@jpeducation.net
- 031 225 4143 | 076 190 0925 | 070 764 0657
- Lunuwila Junction, Chilaw Road, Wennappuwa 61170
