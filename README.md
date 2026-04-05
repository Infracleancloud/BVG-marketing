# Cloud Hygiene Coach — Marketing Site

Enterprise marketing site for [Cloud Hygiene Coach](https://cloudhygienecoach.com).

## Local Development

```bash
cp .env.example .env.local   # configure local environment
npm install
npm run dev                   # http://localhost:5176
```

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

## Deployment

Deployed to **Vercel**. Push to `main` triggers production deploy. Pull requests get preview URLs automatically.

### Environment Variables (Vercel Dashboard)

| Variable | Purpose | Example |
|---|---|---|
| `VITE_APP_URL` | Main application URL | `https://app.cloudhygienecoach.com` |
| `VITE_APP_API_URL` | Handoff API endpoint | `https://api.cloudhygienecoach.com` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics ID | `G-XXXXXXXXXX` |

## Site Structure

- `/` — Homepage
- `/platform` — Platform overview, capabilities, integrations, how-it-works
- `/pricing` — Plans and comparison
- `/proof/*` — Case studies, benchmarks, ROI
- `/roles/*` — CIO, CISO, CTO, VP Engineering
- `/outcomes/*` — Governance, audit, cost, risk
- `/trust/*` — Security, compliance
- `/company` — About, leadership, careers, contact
- `/blog` — Articles
- `/request-briefing` — Sign-up / trial form
- `/campaigns/*` — Campaign landing pages

## Copy Guidelines

See `MARKETING_COPY_GUIDE.md` for voice, tone, and section standards.
