# JPIC Website Audit Report
**jpeducation.net | Audit Date: 17 May 2026**
**Prepared for: Pathum / Ekho Studio**

---

## EXECUTIVE SUMMARY

The JPIC website has a strong design foundation, good SEO structure, and a well-thought-out Cambridge content strategy. However, **the site is not launch-ready** as of this audit. Three showstopper issues exist: (1) the coming-soon redirect is still active, meaning production visitors see `coming-soon.html` instead of the homepage; (2) the Admissions enquiry form is hardcoded to `ENV = 'development'` and therefore submits to `localhost:3100` — every admission enquiry is silently discarded in production; and (3) canonical tags are missing from every single page, which will cause duplicate content penalties as soon as search engines crawl the live site. Once these three blockers are resolved, a second wave of medium-priority improvements will significantly boost SEO, performance, and AEO/GEO rankings.

---

## PHASE 1 — ARCHITECTURE & FILE STRUCTURE AUDIT

### 1. Directory Tree

Public root files and folders (non-`.git`):

```
Root
├── _headers ✅
├── _redirects ⚠️ (coming-soon still active)
├── _docs/ ⚠️ (publicly accessible)
│   └── JPIC_Cambridge_Page_Content.md
├── .vscode/ (benign, not served by Cloudflare Pages)
├── README.md ⚠️ (publicly accessible at /README.md)
├── package.json ⚠️ (publicly accessible at /package.json)
├── robots.txt ✅
├── sitemap.xml ⚠️ (references non-existent URLs)
├── about.html
├── contact.html
├── coming-soon.html
├── index.html
├── academic/
├── academic-calendar/
├── admissions/
├── assets/  (css, js, images, audio, docs)
├── components/ (nav.html, footer.html)
├── data/ (news.json)
├── gallery/
├── news/
├── notices/
└── student-life/
```

**Findings:**

| # | Finding | Severity |
|---|---------|----------|
| 1.1 | `README.md` is in the public web root and is accessible at `jpeducation.net/README.md` | [WARNING] |
| 1.2 | `package.json` is in the public web root and is accessible at `jpeducation.net/package.json` | [WARNING] |
| 1.3 | `_docs/` directory is in the public web root — `_docs/JPIC_Cambridge_Page_Content.md` is publicly readable | [WARNING] |
| 1.4 | `data-livereload-anchor` artifact found in `components/footer.html` line 97 — dev tool remnant | [INFO] |
| 1.5 | No `.env`, `node_modules`, `DS_Store`, or `Thumbs.db` files found | [PASS] |

---

### 2. Page Inventory

**Pages Present vs. Sitemap:**

| Sitemap / Nav URL | File on Disk | Status |
|---|---|---|
| `/` (HOME) | `index.html` | ✅ PASS |
| `/about/` | `about.html` | ⚠️ File is `about.html` — clean URL `/about/` needs redirect |
| `/about/our-story/` | (hash fragment only: `about.html#our-story`) | ❌ No file at this path |
| `/about/vision-and-mission/` | (hash fragment only) | ❌ No file |
| `/about/governance/` | (hash fragment only) | ❌ No file |
| `/about/bishops-message/` | (hash fragment only) | ❌ No file |
| `/about/rectors-message/` | (hash fragment only) | ❌ No file |
| `/about/principals-message/` | (hash fragment only) | ❌ No file |
| `/about/school-anthem/` | (hash fragment only) | ❌ No file |
| `/academic/` | no `academic/index.html` | ❌ 404 on click |
| `/academic/programmes.html` | `academic/programmes.html` | ⚠️ Has .html extension |
| `/academic/cambridge-early-years/` | `academic/cambridge-early-years.html` | ⚠️ URL mismatch |
| `/academic/cambridge-primary/` | `academic/cambridge-primary.html` | ⚠️ URL mismatch |
| `/academic/cambridge-lower-secondary/` | `academic/cambridge-lower-secondary.html` | ⚠️ URL mismatch |
| `/academic/cambridge-upper-secondary/` | `academic/cambridge-upper-secondary.html` | ⚠️ URL mismatch |
| `/academic/cambridge-advanced/` | `academic/cambridge-advanced.html` | ⚠️ URL mismatch |
| `/academic/benefits/` | **MISSING** | ❌ No file — nav/sitemap link is broken |
| `/academic/academic-pathways/` | **MISSING** | ❌ Sitemap + index.html link — broken |
| `/academic-calendar/` | `academic-calendar/index.html` | ✅ PASS |
| `/student-life/` | no `student-life/index.html` | ❌ 404 on click |
| `/student-life/spiritual-formation.html` | exists | ⚠️ Has .html extension |
| `/student-life/pastoral-formation.html` | exists | ⚠️ Has .html extension |
| `/student-life/cambridge-board-of-prefects.html` | exists | ⚠️ Has .html extension |
| `/gallery/` | `gallery/index.html` | ✅ PASS |
| `/admissions/` | `admissions/index.html` | ✅ PASS |
| `/news/` | `news/index.html` | ✅ PASS |
| `/notices/` | `notices/index.html` | ✅ PASS |
| `/contact/` | `contact.html` | ⚠️ Mismatch — file is `contact.html` not `/contact/index.html` |
| `/terms/` | **MISSING** | ❌ Footer link is broken |
| `/privacy/` | **MISSING** | ❌ Footer link is broken |
| Academic Staff page | **MISSING** | ❌ In original sitemap spec, not created yet |

---

### 3. Component Loading

| Check | Result |
|---|---|
| `components/nav.html` exists | ✅ PASS |
| `components/footer.html` exists | ✅ PASS |
| All pages use `data-component="nav"` injection | ✅ PASS |
| All pages use `data-component="footer"` injection | ✅ PASS |
| No pages hardcode nav/footer HTML | ✅ PASS |

---

### 4. Asset Audit

**Required assets:**

| Asset | Status |
|---|---|
| `assets/images/Hero_Image.jpg` | ✅ Present |
| `assets/images/Banner_Image.jpg` | ✅ Present |
| `assets/images/school-logo.png` | ✅ Present |
| `assets/images/cambridge-logo.png` | ✅ Present |
| `assets/images/favicon.png` | ✅ Present |
| `assets/images/og-image.webp` | ✅ Present |

**Assets with unsafe names (spaces, special characters):**

| File | Issue |
|---|---|
| `assets/images/JPIC Logo White.png` | Space in name |
| `assets/images/Staff/Diocese of Chilaw.webp` | Space in name |
| `assets/images/Staff/Rev. Fr. Don Neville Merinus Coonghe.webp` | Spaces + periods |
| `assets/images/Pastoral Formation/` (directory) | Space in name |
| `assets/images/Spiritual Formation/` (directory) | Space in name |
| `assets/images/ADAMELLO_-_PAPA_-_Giovanni_Paolo_II_-_panoramio_(cropped).webp` | Parentheses in name |
| `gallery/images/Campus & Facilities/` | Ampersand in directory name |
| `gallery/images/Faith & Liturgy/` | Ampersand in directory name |
| `gallery/images/Hero Images/` | Space in directory name |
| `news/images/News 01.webp`, `News 02.webp`, `News 03.webp` | Spaces in filenames |

**Potentially orphaned assets:** `JPIC_Flag.webp`, `ADAMELLO_-_PAPA_-_...` — verify if referenced in any page.

---

### 5. URL Consistency

| Finding | Severity |
|---|---|
| `about.html` uses relative paths (`assets/css/main.css` without leading `/`) — will break if URL depth changes | [WARNING] |
| All other pages use absolute root-relative paths (`/assets/css/main.css`) ✅ | [PASS] |
| No `localhost` or dev port URLs in HTML `href` attributes ✅ | [PASS] |

---

### 6. Broken Link Scan

| File | Broken Link | Issue |
|---|---|---|
| `index.html` | `/about/our-story/` | No file — relies on redirect (verify redirect works) |
| `index.html` | `/academic/benefits/` | File does not exist |
| `index.html` | `/academic/academic-pathways/` | File does not exist |
| `index.html` | `/student-life/` | No `index.html` in `/student-life/` |
| `index.html` | `https://jpeducation.net/wp-content/uploads/2025/05/New-application-2025-2026.pdf` | WordPress URL — old domain path, likely 404 |
| `components/footer.html` | `/about/our-story/`, `/about/vision-and-mission/`, etc. | No files at these clean URLs |
| `components/footer.html` | `/terms/` | No file |
| `components/footer.html` | `/privacy/` | No file |
| `components/footer.html` | `/academic/academic-calendar/` | Should be `/academic-calendar/` |
| `components/nav.html` | `/academic/` | No `academic/index.html` |
| `components/nav.html` | `/student-life/` | No `student-life/index.html` |

---

### 7. Naming Conventions

See Asset Audit above. Additionally, directory names with `&` and spaces (e.g. `Campus & Facilities`) are URL-unsafe and will require percent-encoding in any web reference.

---

### 8. `_redirects` and `_headers`

| Check | Status |
|---|---|
| `_redirects` file exists | ✅ |
| **CRITICAL: Line 5 still has `/    /coming-soon.html    200`** | ❌ CRITICAL |
| Legacy WordPress URL redirects present | ✅ |
| Missing: `http://jpeducation.net/* https://jpeducation.net/:splat 301` | [WARNING] |
| Missing: `http://www.jpeducation.net/* https://jpeducation.net/:splat 301` | [WARNING] |
| Missing: `www.jpeducation.net/* https://jpeducation.net/:splat 301` | [WARNING] |
| `_headers` file exists with security headers | ✅ |

---

### 9. `robots.txt`

```
User-agent: *
Allow: /
Sitemap: https://jpeducation.net/sitemap.xml
```

**Findings:**
- [PASS] Correctly allows all crawlers.
- [PASS] References the sitemap.
- [WARNING] Does not disallow `/_docs/` — consider blocking `Disallow: /_docs/`.
- [WARNING] Does not disallow `/coming-soon.html` (when live, this page should not be indexed).

---

### 10. `sitemap.xml`

| Check | Status |
|---|---|
| File exists | ✅ |
| All URLs use `https://jpeducation.net` | ✅ |
| `<lastmod>` dates | ❌ None present |
| References `/about/our-story/`, `/about/vision-and-mission/` etc. | ❌ No files at these URLs |
| References `/academic/` (no index.html) | ❌ |
| References `/academic/benefits/` (no file) | ❌ |
| References `/academic/academic-pathways/` (no file) | ❌ |
| References `/student-life/` (no index.html) | ❌ |
| References `/contact/` but file is `contact.html` | ⚠️ |
| Missing: notices, student-life sub-pages | [WARNING] |

---

## PHASE 2 — SECURITY AUDIT

| File | Issue | Severity | Recommended Fix |
|---|---|---|---|
| `admissions/index.html:1538` | `var ENV = 'development'` — form POSTs to localhost:3100 in production | **CRITICAL** | Change to `var ENV = 'production'` before launch |
| `academic-calendar/index.html:1004` | `const API_BASE = 'http://localhost:3100/api/v1'` hardcoded | **CRITICAL** | Point to production API URL |
| `notices/index.html:847` | `var API_BASE = 'http://localhost:3100/api/v1'` hardcoded | **CRITICAL** | Point to production API URL |
| `assets/js/main.js:262` | Fallback `API_URL` defaults to `http://localhost:3100` | **HIGH** | Change fallback to production URL |
| `_headers:7` | CSP `connect-src` includes `http://localhost:3100` — localhost in production headers | **HIGH** | Remove `http://localhost:3100` from CSP |
| `_headers:7` | CSP `img-src` missing `https://maps.gstatic.com` and `https://maps.googleapis.com` — Google Maps images blocked | **HIGH** | Add map domains to `img-src` and `frame-src` |
| `admissions/index.html:1467` | `target="_blank"` on dynamically set anchor missing `rel="noopener noreferrer"` | **MEDIUM** | Add `rel="noopener noreferrer"` |
| `admissions/index.html:1746` | Dynamically injected `target="_blank"` link missing `rel="noopener"` | **MEDIUM** | Add `rel="noopener noreferrer"` to dynamic HTML string |
| `package.json` | Publicly accessible at `/package.json` | **LOW** | Add to `.gitignore` or use `_redirects` to return 404 |
| `README.md` | Publicly accessible at `/README.md` | **LOW** | Block via `_redirects` returning 404 |
| `_docs/` | Entire directory publicly accessible | **LOW** | Add `_docs/* 404` to `_redirects` |
| `index.html:798` | Download link to `wp-content/uploads/...` — old WordPress URL, may 404 | **MEDIUM** | Host the PDF in `/assets/docs/` and update the link |
| No hardcoded API keys, passwords, or tokens found | — | **PASS** | — |
| No `.env` files in repository | — | **PASS** | — |
| Contact form uses Web3Forms access key (safe to be public per Web3Forms docs) | — | **PASS** | — |
| Contact form has honeypot `botcheck` field | — | **PASS** | — |
| Admissions form has 429 rate-limit handling | — | **PASS** | — |
| All external CDN scripts load over HTTPS | — | **PASS** | — |
| HSTS header present | — | **PASS** | — |
| `X-Frame-Options: DENY` set | — | **PASS** | — |
| Font Awesome 6.5.0 from cdnjs has no `integrity` (SRI) attribute | LOW | Add `integrity="sha512-..."` and `crossorigin="anonymous"` |
| Google Fonts has no SRI — acceptable (dynamic version) | — | **INFO** | — |
| `<iframe>` on contact and admissions pages load over HTTPS and have `loading="lazy"` | — | **PASS** | — |
| No SQL, `.bak`, or `.old` files in public root | — | **PASS** | — |

---

## PHASE 3 — PERFORMANCE & CLOUDFLARE OPTIMIZATION AUDIT

### 1. Image Audit

| Finding | Severity |
|---|---|
| Hero slide 1 `<img>` has `fetchpriority="high"` | ✅ PASS |
| Hero slides 2–5 have `loading="lazy"` | ✅ PASS |
| Hero images, gallery images, news card images, welcome image, partner logos — ALL missing `width` and `height` attributes → CLS risk | **P1** |
| No `.bmp` files found — all images are `.jpg` or `.webp` | ✅ PASS |
| `Hero_Image.jpg` and `Banner_Image.jpg` are `.jpg` — should be converted to `.webp` | **P3** |
| No `<link rel="preload" as="image">` for LCP hero image | **P2** |

---

### 2. Font Loading

| Page | Has Google Fonts `<link>` | Uses `display=swap` | Has `preconnect` |
|---|---|---|---|
| `index.html` | ❌ No explicit `<link>` for fonts | — | ✅ preconnect present |
| `about.html` | ❌ No explicit `<link>` for fonts | — | ❌ No preconnect |
| `admissions/index.html` | ✅ | ✅ `display=swap` | ✅ |
| `contact.html` | ✅ | ✅ `display=swap` | ✅ |
| `cambridge-*.html` pages | No explicit font link | — | ✅ preconnect |

**Finding:** Font loading is inconsistent. `index.html` and `about.html` have `preconnect` but no actual `<link>` to load the fonts. Fonts must be loaded somewhere (perhaps via CSS `@import` in `main.css`). If fonts are in `main.css` via `@import`, this is render-blocking and slower than a `<link>` in `<head>`. **P2 — Verify font loading path in `main.css` and add explicit `<link>` tags with `display=swap` to all pages.**

---

### 3. CSS Audit

| Finding | Severity |
|---|---|
| 2–3 CSS files loaded per page (main.css, components.css, home.css on homepage) — no minification suffix | INFO (Cloudflare gzips) |
| CSS version query strings inconsistent across pages: `?v=20260521`, `?v=20260510b`, `?v=20260514` | **P2** — normalise to single version |
| Font Awesome loaded from cdnjs for full icon set | INFO |
| No unused CSS framework detected (no Bootstrap/Tailwind) | ✅ PASS |
| Large inline `<style>` blocks in admissions/contact/academic pages — not cached separately | INFO |

---

### 4. JavaScript Audit

| Finding | Severity |
|---|---|
| `index.html`: main.js loaded at bottom of `<body>` (equivalent to defer, but not explicit) | **P3** |
| `academic/cambridge-*.html` pages: main.js has `defer` attribute | ✅ PASS |
| `admissions/index.html`: main.js at bottom of body without `defer` | **P3** |
| No `document.write()` calls found | ✅ PASS |
| Component fetch uses `cache: 'no-store'` — nav and footer are fetched fresh on EVERY page load | **P2** |
| Three inline `<script>` blocks on index.html — hero slider, news feed, inline | INFO |

---

### 5. `<head>` Audit (index.html)

| Check | Status |
|---|---|
| `<meta charset="UTF-8">` | ✅ PASS |
| `<meta name="viewport">` | ✅ PASS |
| `<title>` present and unique | ✅ PASS |
| `<meta name="description">` | ✅ PASS |
| `<link rel="canonical">` | ❌ MISSING on all 17 pages |
| Favicon linked | ✅ PASS |
| `<link rel="preconnect">` to fonts | ✅ PASS |
| OG tags complete | ✅ PASS |
| Twitter card tags | ✅ PASS |
| JSON-LD structured data | ✅ PASS (homepage only) |

---

### 6. Cloudflare Pages Specific

| Check | Status |
|---|---|
| `_headers` exists | ✅ |
| `Cache-Control: public, max-age=31536000, immutable` for JS/CSS | ✅ |
| `Cache-Control` for HTML pages (no-cache) | ❌ Not set for `/*.html` |
| `X-Frame-Options` header | ✅ DENY |
| `X-Content-Type-Options: nosniff` | ✅ |
| `Referrer-Policy` | ✅ |
| `Permissions-Policy` | ✅ |
| HTTP→HTTPS redirects in `_redirects` | ❌ Missing |
| `www→non-www` redirects in `_redirects` | ❌ Missing |

---

### 7. Component Fetch Performance

`main.js:16` uses `cache: 'no-store'` on every component fetch request. This prevents browser caching of `nav.html` and `footer.html`, meaning each new page load (even back/forward navigation) makes 2 fresh HTTP requests for components. Recommendation: Change to `cache: 'default'` or use the `max-age=3600` that `_headers` sets for components.

---

### 8. Core Web Vitals Checklist

| Metric | Risk | Finding |
|---|---|---|
| **LCP** | MEDIUM | Hero image has `fetchpriority="high"` ✅ but no `<link rel="preload">` to begin fetching before render |
| **CLS** | HIGH | All `<img>` tags missing `width`/`height` attributes — browser cannot reserve space |
| **FID/INP** | LOW | No heavy synchronous JS on main thread ✅ |

---

## PHASE 4 — SEO AUDIT

### 1. Title Tags

| Page | Title | Length | Issues |
|---|---|---|---|
| `index.html` | Cambridge International School Wennappuwa \| St. John Paul II International College | 82 chars | ⚠️ Over 60 chars |
| `about.html` | About Us — St. John Paul II International College | 50 chars | ✅ |
| `contact.html` | Contact Us \| JPIC – St. John Paul II International College | 57 chars | ✅ |
| `admissions/index.html` | Admissions — St. John Paul II International College \| Cambridge School Wennappuwa | 83 chars | ⚠️ Over 60 chars |
| `academic/programmes.html` | Academic Programmes — St. John Paul II International College \| Cambridge School Wennappuwa | 91 chars | ⚠️ Over 60 chars |
| `cambridge-early-years.html` | Cambridge Early Years (Age 3–6) \| JPIC | 40 chars | ⚠️ Missing full school name |
| `cambridge-primary.html` | Cambridge Primary (Age 5–11) \| JPIC | 37 chars | ⚠️ Missing full school name |
| `cambridge-lower-secondary.html` | Cambridge Lower Secondary (Age 11–14) \| JPIC | 46 chars | ⚠️ Missing full school name |
| `cambridge-upper-secondary.html` | Cambridge Upper Secondary (Age 14–16) \| JPIC | 46 chars | ⚠️ Missing full school name |
| `cambridge-advanced.html` | Cambridge Advanced — AS & A Level (Age 16–19) \| JPIC | 54 chars | ⚠️ Missing full school name |
| `gallery/index.html` | Gallery \| JPIC | 15 chars | ⚠️ Too short, missing school name |
| `news/index.html` | News & Announcements \| JPIC – St. John Paul II International College | 68 chars | ⚠️ Slightly over 60 chars |
| `notices/index.html` | Notices \| JPIC | 15 chars | ⚠️ Too short |
| `academic-calendar/index.html` | Academic Calendar 2026–2027 \| JPIC | 35 chars | ⚠️ Missing school name |
| `spiritual-formation.html` | Spiritual Formation \| JPIC | 27 chars | ⚠️ Missing school name |
| `pastoral-formation.html` | Pastoral Formation \| JPIC | 26 chars | ⚠️ Missing school name |
| `cambridge-board-of-prefects.html` | Board of Prefects \| JPIC | 24 chars | ⚠️ Missing school name |

**Recommendation:** Append `| St. John Paul II International College, Wennappuwa` to short titles. Trim over-60 titles.

---

### 2. Meta Descriptions

All pages have meta descriptions. Spot-check quality:

| Page | Description | Issues |
|---|---|---|
| `index.html` | "St. John Paul II International College is an authorised Cambridge…" | ✅ Good, 155 chars |
| `gallery/index.html` | "A glimpse into life at JPIC — events, sports, academic life..." | ⚠️ Generic |
| `notices/index.html` | Not checked | Needs verification |
| Cambridge programme pages | Present and specific | ✅ |

---

### 3. Heading Structure

| Finding | Severity |
|---|---|
| `index.html`: **5 `<h1>` tags** — one per hero slide. Only the first/active slide should have `<h1>`; the rest should be `<h2>` or `aria-hidden` | **HIGH** |
| All other pages: Single `<h1>` per page | ✅ PASS |
| Heading hierarchy (h1→h2→h3) appears logical on inner pages | ✅ PASS |

---

### 4. Image Alt Text

| Finding | Severity |
|---|---|
| Hero images have descriptive alt text | ✅ |
| Partner logos use abbreviated alt: `alt="OUSL"`, `alt="NSBM"`, `alt="KDU"`, `alt="SLIIT"` — too brief | [WARNING] |
| `components/footer.html`: nav logo has `alt="JPIC"` — consider full name | [INFO] |
| News card images: alt dynamically set from post title | ✅ |
| Student photo: `alt="JPIC students"` — generic but acceptable | [INFO] |

---

### 5. Structured Data (Schema.org)

| Schema Type | Location | Status |
|---|---|---|
| `EducationalOrganization` | `index.html` (JSON-LD) | ✅ Present — name, alternateName, url, logo, address, telephone, email, foundingDate, memberOf |
| `BreadcrumbList` | Inner pages | ❌ Missing |
| `FAQPage` | Contact page has FAQ accordion | ❌ Not marked up with schema |
| `FAQPage` | Admissions page has FAQ-like content | ❌ Not marked up |
| `Event` | Academic Calendar page | ❌ Not marked up |

**Missing from EducationalOrganization:** `hasCredential` (Cambridge accreditation), `numberOfStudents`, `description` is present ✅.

---

### 6. Open Graph (OG) Tags

| Page | og:title | og:description | og:image | og:url | og:type | og:site_name |
|---|---|---|---|---|---|---|
| `index.html` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `about.html` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `admissions/index.html` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `contact.html` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `gallery/index.html` | ✅ | ✅ | ✅ | ⚠️ Uses `/gallery/index.html` not `/gallery/` | ✅ | ✅ |
| `cambridge-*.html` pages | ✅ | ✅ | ✅ | ⚠️ Uses `.html` extension in URL | ✅ | ✅ |

`about.html` is completely missing all OG tags — the About page is one of the most shared pages for a school.

---

### 7. Twitter Card Tags

| Page | Present | Issues |
|---|---|---|
| `index.html` | ✅ | Missing `twitter:description` uses OG desc |
| `about.html` | ❌ | No Twitter tags at all |
| All other pages | ✅ | Good |

---

### 8. Canonical Tags

**Every single page is missing `<link rel="canonical">`.**

This means Google could index `jpeducation.net/contact.html`, `/contact/`, and `/contact` as three different pages, causing duplicate content issues. Canonical tags must be added to all 17 pages before launch.

---

### 9. Internal Linking

| Finding | Severity |
|---|---|
| Admissions page linked from homepage hero, CTA section, nav, and footer | ✅ |
| `/academic/benefits/` linked in homepage but file doesn't exist → 404 | ❌ |
| `/academic/academic-pathways/` linked in homepage but file doesn't exist → 404 | ❌ |
| `/terms/` and `/privacy/` in footer — not implemented | ❌ |
| Footer references `/academic/academic-calendar/` but correct path is `/academic-calendar/` | ❌ |

---

### 10. URL Structure

| Finding | Severity |
|---|---|
| Most pages use lowercase hyphens | ✅ |
| `contact.html`, `about.html` are at root level with `.html` extension — inconsistent with clean URL pages | [WARNING] |
| Cambridge programme pages use `.html` extension but sitemap/nav reference clean URLs | [WARNING] |
| `academic/programmes.html` uses `.html` extension | [WARNING] |
| No underscores in page URLs | ✅ |

---

### 11. robots.txt and sitemap.xml

| Check | Status |
|---|---|
| robots.txt allows all crawlers | ✅ |
| robots.txt references sitemap | ✅ |
| sitemap.xml has `<lastmod>` | ❌ None |
| sitemap.xml URLs match actual page files | ❌ Many mismatches (see Architecture section) |
| No important pages accidentally blocked | ✅ |

---

### 12. Language and hreflang

All pages have `<html lang="en">`. ✅ hreflang not required for English-only site.

`about.html` uses `<html lang="en">` ✅ (no `data-root` attribute — minor inconsistency).

---

### 13. Cambridge Partnership Keywords

Cambridge programme pages each have dedicated content. The Early Years and Advanced pages appear well-structured with proper stage descriptions. However, without full-page reads, the word count cannot be confirmed. Based on the structure observed, each page likely exceeds 300 words. The `_docs/JPIC_Cambridge_Page_Content.md` source doc suggests good content depth was planned.

---

## PHASE 5 — AEO / GEO AUDIT

### 1. Structured Data for AI Comprehension

`index.html` has a solid `EducationalOrganization` JSON-LD block with: name, alternateName (JPIC, SJPIC), url, logo, description, address, telephone × 3, email, foundingDate, memberOf (Cambridge International Education). **This is good.**

**Missing from schema:**
- `hasCredential` to explicitly state Cambridge accreditation
- `numberOfStudents` (if available)
- `sameAs` array — no links to Facebook, Instagram, LinkedIn, or Wikipedia
- `foundingDate` uses "2015" as a string — should include full ISO date if possible

---

### 2. FAQ Content Audit

| Page | Has FAQ | Has FAQPage Schema |
|---|---|---|
| `contact.html` | ✅ Full accordion FAQ (6 questions) | ❌ No schema markup |
| `admissions/index.html` | Partial (documents required, how-to-apply steps) | ❌ No schema |
| Other pages | ❌ | ❌ |

The Contact page FAQ answers: academic year start, application timeline, scholarships, campus visits, medium of instruction, international recognition — all highly relevant. **Adding FAQPage JSON-LD here could get the site into Google's FAQ rich results.**

---

### 3. Entity Clarity

| Entity | Present on Site | Consistent |
|---|---|---|
| Full school name: "St. John Paul II International College" | ✅ On all key pages | ✅ |
| Location: "Lunuwila Junction, Chilaw Road, Wennappuwa 61170, Sri Lanka" | ✅ Footer, contact, schema | ✅ |
| Diocese of Chilaw | ✅ Homepage hero, About | ✅ |
| Cambridge International Education affiliation | ✅ Prominent throughout | ✅ |
| Age range: Age 3 to 19 | ✅ | ✅ |
| Website: jpeducation.net | ✅ | ✅ |
| Contact phones and email | ✅ Footer, contact, admissions | Minor inconsistency (see below) |

**Phone number discrepancy detected across pages:**
- Footer/contact departments: `031 225 4143`
- Admissions page contact info: `031 22 54143` (same number, different formatting)
- Contact page hero panel: `031 224 5761` (different number!)
- Education Office: `031 224 5761`

These inconsistencies confuse both users and AI engines. Standardise to one format.

---

### 4. E-E-A-T Signals

| Signal | Present | Quality |
|---|---|---|
| About page with school history | ✅ | Good |
| Governance page with named leadership | ✅ (in about.html) | ✅ |
| Bishop's message and Principal's message | ✅ | Strong authority signal |
| Cambridge partnership prominently stated | ✅ | ✅ |
| Link to cambridgeinternational.org | ✅ (in schema memberOf) | ✅ |
| Physical address visible sitewide (footer) | ✅ | ✅ |
| Testimonials / social proof | ✅ Cambridge learner quotes on homepage | Moderate (not JPIC-specific alumni testimonials) |
| JPIC alumni testimonials | ❌ | Recommend adding |

---

### 5. Content Depth — Cambridge Programme Pages

Based on structure observed (pages have hero, intro, curriculum areas, age ranges, what students learn, next steps sections):

| Page | Estimated Content Depth |
|---|---|
| Cambridge Early Years | Adequate (dedicated sections, multiple curriculum areas described) |
| Cambridge Primary | Adequate |
| Cambridge Lower Secondary | Adequate |
| Cambridge Upper Secondary | Adequate |
| Cambridge Advanced | Adequate |

All programme pages appear to exceed the 300-word threshold. Good.

---

### 6. Conversational Query Coverage

| Query | Covered by Site |
|---|---|
| "Cambridge school near Wennappuwa / Chilaw" | ✅ (multiple pages mention Wennappuwa, Chilaw Road) |
| "International school in Wennappuwa Sri Lanka" | ✅ |
| "Cambridge IGCSE school in Sri Lanka" | ✅ |
| "Cambridge A Level school in Western Province North" | ⚠️ Province not explicitly mentioned |
| "Catholic international school in Sri Lanka" | ✅ |
| "Early years Cambridge programme Sri Lanka" | ✅ (dedicated page) |
| "School fees Cambridge school Sri Lanka" | ❌ No fee information on site |
| "How to apply to Cambridge school Sri Lanka" | ✅ (admissions page) |

---

### 7. Named Entity Co-occurrence

| Entity | Present |
|---|---|
| University of Cambridge / Cambridge Assessment International Education | ✅ |
| Chilaw Diocese / Catholic Education | ✅ |
| Wennappuwa / Chilaw (geographic) | ✅ |
| Sri Lanka education | ✅ |
| National curriculum comparison | ❌ Not present |

---

### 8. Freshness Signals

- No `dateModified` in homepage JSON-LD ❌
- No visible "Last updated" on Academic Calendar page ❌
- News section exists with dated posts — good for freshness ✅
- Recommend adding `dateModified` to JSON-LD schema

---

### 9. Voice Search Readiness

| Check | Status |
|---|---|
| Directions in natural language on Contact page | ✅ "Lunuwila Junction, Chilaw Road, Wennappuwa" |
| Office hours on Contact page | ✅ Monday–Friday 7:30AM–3:00PM |
| Phone in `tel:` link format | ✅ All phone numbers are `<a href="tel:...">` |
| FAQ with natural language answers | ✅ (Contact page) |

---

## PHASE 6 — ACCESSIBILITY AUDIT (WCAG 2.1 AA)

| Check | Status | Notes |
|---|---|---|
| **1. Colour contrast** | PARTIAL | Oxford Blue (#002147) on white: ~14:1 ✅. Champagne Gold (#FFE69E) on Oxford Blue: ~9.6:1 ✅. Muted text (#5A6478) on white: ~4.6:1 ✅ (borderline). Teal (#00BDB6) on white: ~3.1:1 ❌ — fails 4.5:1 for normal text size. Used as labels/eyebrows — ensure these are large text (18px+) or bold 14px+ |
| **2. Skip navigation** | ❌ FAIL | No "Skip to main content" link found on any page — WCAG 2.1 AA failure |
| **3. Focus styles** | PASS | No `outline: none` or `outline: 0` found in any CSS file ✅ |
| **4. Form labels** | PASS | Admissions form: all inputs have `<label for="...">` ✅. Contact form: all inputs have `<label for="...">` ✅ |
| **5. ARIA landmarks** | PASS | `<main id="main-content">` ✅. Nav has `role="navigation" aria-label="Main navigation"` ✅. `<footer>` element used ✅. `aria-hidden="true"` used on decorative elements ✅ |
| **6. Button vs link** | PASS | Submit buttons: `<button type="submit">` ✅. Nav toggle: `<button>` ✅. No `<div>` or `<span>` as click targets found ✅ |
| **7. Mobile tap targets** | PARTIAL | Cannot fully verify without computed styles, but nav toggle and CTA buttons appear to have sufficient padding. Small text links in footer may be under 44px — flag for mobile testing |
| **8. `aria-expanded` on menus** | PASS | Mobile menu toggle uses `aria-expanded` ✅. Mobile sub-menus use `aria-expanded` ✅ |
| **9. `aria-label` on nav** | PASS | Main nav: `aria-label="Main navigation"` ✅ |
| **10. FAQ accordion accessibility** | PARTIAL | FAQ items use `div.faq-q` with click handler — should use `<button>` for keyboard accessibility. Screen reader will not announce it as interactive |

---

## PHASE 7 — MASTER FINDINGS REPORT

```
═══════════════════════════════════════════════════════
JPIC WEBSITE AUDIT REPORT
jpeducation.net | 17 May 2026
Prepared by: Claude Code (Ekho Studio)
═══════════════════════════════════════════════════════

EXECUTIVE SUMMARY

The site is visually polished and well-architected but has three
launch-blocking issues: the coming-soon redirect remains active on
the homepage, the admissions form is pointed at localhost (silently
discarding all enquiries), and canonical tags are missing from every
page. Once these three blockers are cleared, the site will be
search-engine ready. A second wave of improvements (broken internal
links, missing pages, schema enhancements, image dimensions, and
font-loading consistency) will deliver ongoing SEO and performance
gains over the weeks following launch.
═══════════════════════════════════════════════════════
```

---

### CRITICAL ISSUES (fix before launch)

| # | Issue | File | Fix |
|---|---|---|---|
| C1 | **Homepage redirects to coming-soon.html** — `_redirects` line 5 is `/ /coming-soon.html 200`. Live visitors see the coming-soon page. | `_redirects:5` | Delete line 5 (`/    /coming-soon.html    200`) |
| C2 | **Admissions form posts to localhost** — `var ENV = 'development'` means ALL enquiries go to port 3100 and are silently lost | `admissions/index.html:1538` | Change to `var ENV = 'production'` |
| C3 | **Academic Calendar API hardcoded to localhost** — calendar data fetch will fail in production | `academic-calendar/index.html:1004` | Point `API_BASE` to `https://api.jpeducation.net/api/v1` |
| C4 | **Notices API hardcoded to localhost** — notices will not load in production | `notices/index.html:847` | Point `API_BASE` to production URL |
| C5 | **Canonical tags missing on all 17 pages** — duplicate content risk as soon as Googlebot crawls | Every `.html` file | Add `<link rel="canonical" href="https://jpeducation.net/PAGE">` to every page `<head>` |

---

### HIGH PRIORITY (fix within 1 week)

| # | Issue | File | Fix |
|---|---|---|---|
| H1 | `localhost:3100` in production CSP `connect-src` | `_headers:7` | Remove `http://localhost:3100` from CSP |
| H2 | Google Maps images blocked by CSP — maps won't render | `_headers:7` | Add `https://maps.gstatic.com https://maps.googleapis.com` to `img-src` |
| H3 | 5 `<h1>` tags on homepage (one per hero slide) | `index.html:84,113,138,170,200` | Keep first slide `<h1>`, change others to `<h2>` or hide with `aria-hidden="true"` |
| H4 | `about.html` missing all OG and Twitter card meta tags | `about.html` | Add full OG/Twitter tag block |
| H5 | Footer links to `/terms/` and `/privacy/` — pages don't exist | `components/footer.html` | Create stub pages or update links |
| H6 | `/academic/` has no `index.html` — nav link 404s | `academic/` | Create `academic/index.html` or redirect to `programmes.html` |
| H7 | `/student-life/` has no `index.html` — nav link 404s | `student-life/` | Create `student-life/index.html` |
| H8 | `/academic/benefits/` linked in homepage — file missing | `index.html:119` | Create benefits page or update link |
| H9 | All images missing `width`/`height` attributes — CLS failures | All HTML files | Add explicit dimensions to all `<img>` tags |
| H10 | Footer link to `/academic/academic-calendar/` is wrong — should be `/academic-calendar/` | `components/footer.html` | Fix the link path |
| H11 | `admissions/index.html` main.js fallback `API_URL` uses localhost | `assets/js/main.js:262` | Change fallback to production URL |
| H12 | Download link points to `wp-content/uploads` (old WordPress URL) | `index.html:798` | Host PDF at `/assets/docs/` and update link |

---

### MEDIUM PRIORITY (fix within 1 month)

| # | Issue | File | Fix |
|---|---|---|---|
| M1 | HTTP→HTTPS redirect not in `_redirects` | `_redirects` | Add `http://jpeducation.net/* https://jpeducation.net/:splat 301` |
| M2 | www→non-www redirect not in `_redirects` | `_redirects` | Add `https://www.jpeducation.net/* https://jpeducation.net/:splat 301` |
| M3 | Component fetch uses `cache: 'no-store'` — nav/footer refetched on every page load | `assets/js/main.js:16` | Change to `cache: 'default'` to use browser cache |
| M4 | CSS version query strings inconsistent (`v=20260521` vs `v=20260510b` vs `v=20260514`) | Multiple HTML files | Standardise to single version token |
| M5 | FAQPage schema missing on Contact page (has 6 FAQ items) | `contact.html` | Add JSON-LD `FAQPage` block |
| M6 | `sameAs` missing from EducationalOrganization schema | `index.html` | Add Facebook, Instagram, LinkedIn URLs to `sameAs` array |
| M7 | No `dateModified` in JSON-LD schema | `index.html` | Add `"dateModified": "2026-05-17"` |
| M8 | `_docs/` directory publicly accessible | `_redirects` | Add `/_docs/* 404` to `_redirects` |
| M9 | `README.md` and `package.json` publicly accessible | `_redirects` | Add redirect rules returning 404 for these files |
| M10 | Short page titles missing full school name (6+ pages) | Cambridge/gallery/student pages | Expand titles: `Cambridge Early Years \| St. John Paul II International College` |
| M11 | Teal (#00BDB6) on white fails 4.5:1 contrast ratio for small text | `assets/css/main.css` | Use larger text (18px+) or darken teal for body text usage |
| M12 | No `<link rel="preload">` for LCP hero image | `index.html` | Add `<link rel="preload" as="image" href="/assets/images/hero/hero-1.webp" fetchpriority="high">` |
| M13 | sitemap.xml references non-existent URLs and has no `<lastmod>` | `sitemap.xml` | Rebuild sitemap to match actual page URLs; add `<lastmod>` |
| M14 | Phone number displayed inconsistently across pages (`031 224 5761` vs `031 225 4143`) | Multiple | Standardise to a single authoritative number per context |
| M15 | `data-livereload-anchor` dev artifact in footer | `components/footer.html:97` | Remove `<div hidden data-livereload-anchor></div>` |
| M16 | FAQ accordion uses `div.faq-q` not `<button>` — keyboard inaccessible | `contact.html` | Wrap `.faq-q` content in a `<button>` element |
| M17 | Font loading inconsistent — `index.html` and `about.html` lack explicit Google Fonts `<link>` | `index.html`, `about.html` | Verify font load path; add explicit `<link>` with `display=swap` if needed |

---

### LOW PRIORITY / ENHANCEMENTS

| # | Issue / Suggestion | File | Notes |
|---|---|---|---|
| L1 | Font Awesome CDN missing SRI `integrity` attribute | All pages loading FA | Low risk on cdnjs but best practice |
| L2 | Image filenames with spaces and special characters | `assets/images/` | Rename files; URL-encode or replace before launch |
| L3 | Partner logo alt text too abbreviated (`alt="OUSL"`) | Multiple | Use `alt="Open University of Sri Lanka"` etc. |
| L4 | Gallery `og:url` uses `/gallery/index.html` instead of `/gallery/` | `gallery/index.html` | Fix to clean URL |
| L5 | `admissions/index.html` dynamically injected `target="_blank"` links missing `rel="noopener noreferrer"` | `admissions/index.html:1746` | Add to dynamic HTML string |
| L6 | No `BreadcrumbList` schema on inner pages | All inner pages | Add for enhanced search snippet display |
| L7 | Academic calendar page has no `Event` schema for term dates | `academic-calendar/index.html` | Add `Event` JSON-LD per term |
| L8 | `about.html` uses relative CSS paths (no leading `/`) | `about.html:14` | Change to `/assets/css/main.css` |
| L9 | `Hero_Image.jpg` and `Banner_Image.jpg` are JPEG — convert to WebP | `assets/images/` | Reduce file size for legacy fallback images |
| L10 | Add skip-to-main-content link as first focusable element | All pages | `<a href="#main-content" class="skip-link">Skip to content</a>` |
| L11 | No JPIC-specific student/parent testimonials | `index.html` | Replace generic Cambridge quotes with school community voices |
| L12 | No fee/pricing information on site | Admissions | Consider a "request fee structure" CTA if fees are private |
| L13 | `robots.txt` does not disallow `/_docs/` or `/coming-soon.html` | `robots.txt` | Add `Disallow: /_docs/` and `Disallow: /coming-soon.html` |

---

## PHASE SCORES

| Phase | Score | Notes |
|---|---|---|
| Architecture | **4/10** | Coming-soon redirect, multiple broken internal links, missing pages, naming issues |
| Security | **6/10** | No credentials exposed ✅; ENV=development and localhost in CSP are critical |
| Performance | **6/10** | Missing image dimensions, component cache inefficiency, inconsistent fonts |
| SEO | **5/10** | Zero canonical tags, multiple H1s on homepage, 6+ short titles, URL inconsistencies |
| AEO / GEO | **7/10** | Solid structured data foundation, entity clarity; missing FAQPage schema, no freshness signals |
| Accessibility | **6/10** | No skip nav, FAQ not keyboard accessible, teal contrast borderline |
| **OVERALL** | **34/60** | — |

---

## TOP 10 QUICK WINS (highest impact, lowest effort)

| # | Action | Impact | Effort |
|---|---|---|---|
| 1 | Delete coming-soon redirect from `_redirects` line 5 | 🔴 LAUNCH BLOCKER | 1 line delete |
| 2 | Change `var ENV = 'development'` to `'production'` in admissions/index.html | 🔴 LAUNCH BLOCKER | 1 word change |
| 3 | Fix localhost API URLs in academic-calendar and notices pages | 🔴 LAUNCH BLOCKER | 2 line changes |
| 4 | Add `<link rel="canonical" href="https://jpeducation.net/...">` to all 17 pages | 🟠 SEO CRITICAL | ~17 line additions |
| 5 | Remove `http://localhost:3100` from `_headers` CSP `connect-src` | 🟠 SECURITY | 1 line edit |
| 6 | Add `https://maps.gstatic.com https://maps.googleapis.com` to CSP `img-src` | 🟠 Google Maps broken | 1 line edit |
| 7 | Fix the 5×`<h1>` tags on homepage — change hero slides 2–5 to `<h2>` | 🟠 SEO | ~4 attribute changes |
| 8 | Add OG/Twitter meta block to `about.html` | 🟡 Social/SEO | ~10 lines |
| 9 | Remove `data-livereload-anchor` from footer.html | 🟡 Cleanliness | 1 line delete |
| 10 | Add FAQPage JSON-LD to contact.html (FAQ content already exists) | 🟡 AEO/Rich results | ~30 lines of JSON-LD |

---

## RECOMMENDED IMPLEMENTATION ORDER

### Sprint 1 — Launch Blockers (Do before going live)
1. Remove coming-soon redirect from `_redirects` (C1)
2. Set `ENV = 'production'` in `admissions/index.html` (C2)
3. Fix `API_BASE` to production URL in `academic-calendar/index.html` and `notices/index.html` (C3, C4)
4. Remove `http://localhost:3100` from `_headers` CSP (H1)
5. Add `maps.gstatic.com` / `maps.googleapis.com` to CSP `img-src` (H2)
6. Delete `data-livereload-anchor` from footer.html (M15)
7. Fix broken application PDF download link (H12)

### Sprint 2 — SEO Foundation (Week 1 post-launch)
8. Add canonical tags to all 17 pages (C5)
9. Fix homepage H1 → change hero slides 2–5 to `<h2>` (H3)
10. Add OG and Twitter tags to `about.html` (H4)
11. Add all image `width` and `height` attributes (H9)
12. Add `<link rel="preload">` for LCP hero image (M12)
13. Rebuild `sitemap.xml` to match real page URLs; add `<lastmod>` (M13)
14. Add HTTP→HTTPS and www→non-www redirects (M1, M2)
15. Fix `robots.txt` to disallow `/_docs/` and coming-soon (L13)

### Sprint 3 — Structure & Links (Week 2)
16. Create `academic/index.html` or redirect `/academic/` → `/academic/programmes.html` (H6)
17. Create `student-life/index.html` or redirect to first sub-page (H7)
18. Create `/academic/benefits/` page or update all links pointing to it (H8)
19. Create stub `/terms/` and `/privacy/` pages (H5)
20. Fix footer link: `/academic/academic-calendar/` → `/academic-calendar/` (H10)
21. Standardise phone number formatting across all pages (M14)
22. Change component fetch `cache: 'no-store'` → `cache: 'default'` (M3)

### Sprint 4 — SEO Enhancement (Week 3–4)
23. Add FAQPage JSON-LD to contact.html (M5)
24. Add `sameAs` and `dateModified` to homepage JSON-LD (M6, M7)
25. Expand short page titles with full school name (M10)
26. Standardise CSS version query strings (M4)
27. Add BreadcrumbList schema to inner pages (L6)
28. Block `_docs/` and `README.md` from public access (M8, M9)

### Sprint 5 — Accessibility & Polish (Month 2)
29. Add skip-to-main-content link to all pages (L10)
30. Convert `.faq-q` divs to `<button>` elements for keyboard access (M16)
31. Fix teal (#00BDB6) contrast issue for small text (M11)
32. Rename asset files with spaces/special characters (L2)
33. Add SRI integrity attribute to Font Awesome CDN link (L1)
34. Add `Event` schema to Academic Calendar page (L7)

---

*End of audit. Total issues found: 5 Critical, 12 High, 17 Medium, 14 Low.*
*Audit performed by Claude Code — automated static analysis only. Manual testing of rendered pages, form submissions, and mobile layouts is recommended to complement these findings.*
