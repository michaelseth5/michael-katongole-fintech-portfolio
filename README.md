# Michael Katongole — FinTech Portfolio

Personal portfolio with an interactive financial-data globe, projects, experience (including incoming Fidelity Investments), and market watchlists for stocks, Nasdaq indices and commodities.

## Contents

- `index.html` — complete standalone homepage, CSS, client JavaScript, and TradingView market widgets
- `Michael_Katongole_Resume.pdf` — resume file linked from the site
- `netlify/functions/markets.js` — server-side Yahoo Finance quote proxy with in-memory caching and graceful fallback
- `netlify.toml` — functions configuration and `/api/markets` rewrite

## Deploy on Netlify with GitHub

1. Create a **new GitHub repository** (e.g. `fintech-portfolio`) and upload everything in this folder, preserving directory structure. Alternatively, from this folder: `git init && git add . && git commit -m "Initial FinTech portfolio"`, create the remote on GitHub, then `git branch -M main && git remote add origin <YOUR_GITHUB_REPO_URL> && git push -u origin main`.
2. On [Netlify](https://app.netlify.com/), select **Add new project → Import an existing project → GitHub** and authorize Netlify to access that repository.
3. Choose the repository. Site settings: **Base directory:** blank, **Build command:** blank, **Publish directory:** `.` (as configured by `netlify.toml`); **Functions directory:** `netlify/functions`.
4. Deploy. Netlify provides a `*.netlify.app` URL. Visit `/api/markets` on that URL to check the quote function; if Yahoo Finance blocks the function, the TradingView widget on the page remains the fallback.
5. After the first deploy, new pushes to the default branch will trigger redeploys automatically.

## Local development

- Open `index.html` locally to view the site. Embedded TradingView widgets require internet; Yahoo prices require a deployed API.
- For serverless functions locally: `npx netlify-cli dev` (requires Node.js). Visit the local URL Netlify prints.

## Market data disclaimer

The Yahoo Finance chart URL is **unofficial** and may fail due to access restrictions or terms. Verify data licensing before public redistribution. Quotes may be delayed and are **not intended for trading decisions**. TradingView embeds are included as a backup, subject to their service availability.

## Before publishing

- Replace the headshot placeholder with an approved image.
- Add verified GitHub, LinkedIn, project-demo and walkthrough URLs.
- Verify education and job timeline text and review the included resume for accuracy and privacy.
- Check the deployed site on mobile and verify live market status after deployment.