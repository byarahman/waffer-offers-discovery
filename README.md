# Waffer Offers Discovery

A minimal, responsive, bilingual-friendly directory of Waffer card promotions, created from the supplied **Waffer Offers Master Database** workbook. Built with **React 19, TypeScript, Vite, and Lucide icons**. It is a static site: **no backend, credentials, paid service, or user accounts**.

> **Independent project notice:** This is a discovery interface, not an official Sharjah Government or Waffer website. All discounts and dates originate from user-provided materials. Dates are interpreted in UAE local time and do **not** mean the business has confirmed the offer in real time. Always verify details and eligibility before paying.

## What is included

- **Discover:** prominent global search, quick interest categories, featured currently-dated offers
- **Explore:** relevance-aware search, category chips, business, UAE location, benefit type, minimum discount, date-status filters, sorting, and progressive pagination
- **Offer detail:** benefit, pricing (where supplied), date-based status, eligibility, redemption, channels, restrictions, full original partner text, source links, artwork/PDF, contact links, documented branches
- **Business directory:** browse and search 104 partners; each profile includes all associated offers and original wording
- **Saved offers:** localStorage-only; no sign-in or account
- **Comparison:** select up to three offers and inspect terms in a side-by-side table
- **English and Arabic UI:** basic Arabic interface and right-to-left layout; original source terms remain in their supplied language
- **Accessible navigation:** semantic HTML, keyboard-visible focus, descriptive labels, touch-friendly buttons, reduced-motion support
- **Source transparency:** review flags and promotion-specific Waffer eligibility warnings; no fabricated missing values

### Dataset

| Measure | Imported |
|---|---:|
| Distinct offer rows | 314 |
| Unique businesses | 104 |
| Explicit branch locations | 19 |
| Source-register records | 15 |
| Review flags | 14 |

**Scope:** 314 rows includes 1 general advertised medical screening package that was *not* explicitly confirmed as Waffer-eligible, 16 date-expired entries as of 12 Nov 2026, and offers with various disclosure caveats. The public interface does not state that a listing is live-verified. Some benefits are percentage discounts, others are special rates, bundles, or free services; the website does not recalculate percentages without source amounts.

## Deploy on GitHub Pages

1. **Unzip** the project.
2. Create a **public GitHub repository** (e.g. `waffer-offers-discovery`). Do not initialize it with other conflicting files.
3. Upload **all contents of the unzipped project folder**, including `.github/workflows/deploy.yml`, `src`, `public`, `package.json` and `vite.config.ts`, to the repository's `main` branch. Alternatively, use Git:
   ```bash
   git init
   git branch -M main
   git add .
   git commit -m "Launch Waffer offer discovery"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git push -u origin main
   ```
4. Open your repository **Settings → Pages → Build and deployment → Source → GitHub Actions**.
5. Check the **Actions** tab. The included workflow installs packages, validates TypeScript, builds Vite, and publishes `dist/`.
6. Once deployment succeeds, visit `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/` (or your custom-domain URL).

**Why links survive refresh:** the site uses URL hash routing (`#/offer/OF-0001`). GitHub Pages can always serve the entry page, and Vite automatically chooses `/<repository>/` as the asset prefix when running in GitHub Actions (and `/` for a username `.github.io` repository).

**Important:** upload the *contents* of the project, not a single ZIP file. GitHub Pages does not execute React/TypeScript source by itself; the workflow must finish successfully.

Authoritative guides: [Vite static deployment](https://vite.dev/guide/static-deploy) · [GitHub Pages via Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Run locally

Install Node.js **22 or later** and Python 3 (only needed when importing an updated workbook):

```bash
npm install
npm run dev
```

Follow the local address printed by Vite. Production build:

```bash
npm run build
npm run preview
```

No API key is needed. Favorites and comparison selections are stored only in the visitor's own browser. Browser storage does not sync across devices.

## Updating offers from Excel

The workbook is the source of truth. The import script parses XLSX using **only Python's standard library** and retains the documented relationships. For the same workbook template:

```bash
python3 scripts/import_workbook.py "path/to/Waffer_Offers_Master_Database.xlsx"
python3 -m unittest discover -s tests -v
npm run build
```

This updates:
- `public/data/offers.json` — the public data bundle used by the website
- `DATA_AUDIT.md` — counts, source audit, sector distribution, and handling notes

Commit and push the new JSON and audit (or all changed files); GitHub Actions redeploys automatically. **Stable Offer IDs and Partner IDs are essential:** changing them breaks previously saved favorites or deep links. Maintain the same sheet headings and row structure. Do not manually edit the generated JSON unless you also document the source and regenerate the import.

### Workbook mapping

| Source worksheet | Website use |
|---|---|
| Master Offers | Individual offer cards and detailed terms, dates, pricing and filters |
| Partner Directory | Company descriptions, full original offer language, contacts, marketing posters |
| Branches & Locations | Branch/address cards and map links where supplied |
| Review Flags | Caution messages and clarification reminders |
| Source Register | Preservation/audit of the evidence list |
| Dashboard / Field Guide | Reference and explanatory sheets, not presented as consumer offers |

The importer intentionally excludes spreadsheet formula/cache fields and computes active/upcoming/expired/undated states in the browser from the listed start/end dates. **No future date is interpreted as a promise of availability.** It also keeps original text as authored rather than overwriting it with translations.

## Project structure

```text
waffer-offers-site/
├─ .github/workflows/deploy.yml      # automatic GitHub Pages deployment
├─ src/
│  ├─ App.tsx                         # search, cards, filters, pages, detail, compare
│  ├─ main.tsx                        # React entry
│  └─ lib/{types,utils}.ts            # typed model and data handling
├─ public/
│  ├─ data/offers.json                # 314 offers + partner/branch/source records
│  └─ assets/
│     ├─ favicon.svg
│     ├─ posters/                       # supplied promotional artwork, optimized
│     └─ documents/                     # supplied supporting PDFs
├─ scripts/import_workbook.py        # reproducible XLSX → JSON importer
├─ tests/test_data.py                # structural integrity tests
├─ styles.css                        # design system and responsive layout
├─ DATA_AUDIT.md                     # import reconciliation
├─ vite.config.ts                    # GitHub Pages base-path handling
├─ package.json
└─ index.html
```

## Accessibility and verification scope

The implementation aims at WCAG 2.2 AA. Check contrast, keyboard journeys, screen-reader announcements, and Lighthouse scores after deployment; **no numerical Lighthouse score is claimed without a browser-based run**. Confirm that all external links and offer terms remain valid before promoting the website to a wider audience. The source material contains historical discounts and explicit review caveats, so a date-based `Active dates` label should not be represented as live offer verification.

## Data completeness and exclusions

Every recorded business and offer is retained; related records connect by stable IDs. Empty amounts or dates remain unknown. Benefits are **not** assumed stackable. A medical screening price advertised outside Waffer is marked unconfirmed rather than presented as guaranteed Waffer eligibility. Original promotional PDFs and selected supplied posters are bundled so documented evidence stays accessible, while internal workbook file names are not displayed as live URLs.
