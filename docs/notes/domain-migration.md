# Domain Migration — cocoex.xyz → Cloudflare + GitHub Pages

> Status: **STEP 1 DONE (2026-07-28)** — `cocoex.xyz` now serves the GitHub Pages site over HTTPS via Squarespace DNS. Cloudflare transfer + archive subdomain still pending.
> Goal: serve the new GitHub Pages site on `cocoex.xyz`, move the domain off Squarespace (we're cancelling that plan), and land it at Cloudflare.
> Scope also includes bringing the **Muse Archive** (separate repo `osiom/museobservatory`) online at the subdomain `archive.cocoex.xyz` — see the dedicated section at the bottom. **DONE 2026-07-28** (live over HTTPS).

## Current state
- Site deployed via GitHub Actions (`.github/workflows/deploy.yml`) → `actions/deploy-pages`. No `gh-pages` branch; `dist/` is uploaded as an artifact.
- Repo: `osiom/cocoex-website` (moved from `vithana7` — new owner as of 2026-07). Pages URL: `osiom.github.io`.
- `public/CNAME` = `cocoex.xyz` already committed → Vite copies it to `dist/CNAME` on every build, so the domain survives deploys. **Done.**
- **GitHub Pages custom domain set to `cocoex.xyz`, DNS check green, HTTPS cert issued.** Only remaining click: tick **Enforce HTTPS** in Settings → Pages (the REST API rejects `https_enforced` — UI toggle only).
- `vite.config.js` uses `base: './'` (relative paths) → works at an apex domain with **no config change**. Do NOT switch to a `/repo/` base.
- Domain currently registered at **Squarespace** (registrar + DNS). We want to cancel Squarespace but keep the domain.

## Why migrate (not just cancel)
Cancelling the Squarespace plan can strand or expire the domain, and DNS lives wherever the domain is registered. Move it to a registrar we'll keep. **Chosen: Cloudflare** (at-cost renewal ~$10–11/yr for `.xyz`, best DNS UI, free proxy/CDN/redirects if we want them later).

---

## Target DNS records (recreate these at Cloudflare)

Apex `cocoex.xyz` → 4 GitHub Pages A records:
```
Type   Name   Value
A      @      185.199.108.153
A      @      185.199.109.153
A      @      185.199.110.153
A      @      185.199.111.153
```

`www` subdomain → CNAME to the Pages host:
```
Type    Name   Value
CNAME   www    osiom.github.io
```

`archive` subdomain → CNAME to the Pages host (Muse Archive — see the archive section below):
```
Type    Name      Value
CNAME   archive   osiom.github.io
```
> Both `www` and `archive` CNAME to the same `osiom.github.io` host (both repos moved to `osiom`) — that's fine. GitHub routes each request to the correct repo by matching the `Host` header against each repo's Pages custom-domain setting. Leave these **grey-cloud (DNS-only)** on Cloudflare unless we deliberately want the proxy.

**Cloudflare proxy note:** if the records are **orange-cloud (proxied)**, set SSL/TLS mode to **Full** (NOT Flexible — Flexible causes an HTTPS redirect loop with GitHub Pages). Simplest/safest: leave them **grey-cloud (DNS-only)** and Cloudflare behaves like a plain registrar. Enable the orange proxy later only if we want CDN/analytics.

---

## Migration sequence (order matters — avoid downtime)

A domain transfer takes **5–7 days** (ICANN). Do NOT cancel Squarespace until the transfer completes.

1. **Prove GitHub Pages works on the CURRENT (Squarespace) DNS first.**
   - In Squarespace DNS: add the 4 A records (`@`) + the `www` CNAME above. Remove any existing Squarespace `A`/`CNAME`/`ALIAS` on `@`/`www` that conflict.
   - Push the CNAME commit (already staged in `public/CNAME`):
     ```
     git add public/CNAME
     git commit -m "chore: add CNAME for cocoex.xyz custom domain"
     git push
     ```
   - GitHub repo → **Settings → Pages** → Source = "GitHub Actions" → Custom domain = `cocoex.xyz` → Save. Wait for the green DNS check, then tick **Enforce HTTPS** (cert can take up to ~24h).
   - Verify before proceeding:
     ```
     dig cocoex.xyz +short        # → the 4 GitHub IPs
     dig www.cocoex.xyz +short    # → osiom.github.io
     ```
     Site loads over HTTPS at cocoex.xyz. ✅ Only continue once this is solid.

2. **Prep the domain at Squarespace for transfer:**
   - Unlock the domain (disable transfer/registrar lock).
   - Get the **EPP / auth (authorization) code**.
   - Disable WHOIS privacy if it blocks the transfer.

3. **Start the transfer at Cloudflare** using the auth code (Cloudflare → Domain Registration → Transfer).
   - **Pre-stage DNS at Cloudflare**: recreate the records from the "Target DNS records" section BEFORE the transfer finalizes, so there's zero DNS gap when nameservers flip.

4. **Approve the transfer** (confirmation email), wait 5–7 days for completion.

5. **Confirm** the site still loads on cocoex.xyz after the transfer completes (re-run the `dig` + HTTPS checks).

6. **Cancel Squarespace LAST** — only after the transfer shows complete and the site is verified on Cloudflare DNS.

---

## Blockers / gotchas to check
- **60-day transfer lock:** ICANN blocks transfers within 60 days of registration or a previous transfer. If `cocoex.xyz` was registered at Squarespace <60 days ago, the transfer is refused until day 60 — in that case, do step 1 now (point DNS at GitHub) and schedule the transfer for later.
- **Squarespace raw-DNS access:** newer Squarespace domains sometimes hide raw DNS behind a "point to third-party host" toggle. If A records can't be added, that's the one case to fast-track the transfer to Cloudflare and manage DNS there instead.
- **Don't cancel Squarespace early** — losing DNS control mid-transfer takes the site down.
- **Enforce HTTPS** may re-need toggling after the domain moves (GitHub re-provisions the cert on DNS changes).

## Accesses needed before starting
- [ ] Squarespace login (domain management + EPP code + unlock)
- [ ] Cloudflare account (for the transfer + DNS)
- [ ] GitHub repo admin (Settings → Pages) — both repos (cocoex-website AND museobservatory)

---

# Muse Archive → archive.cocoex.xyz

Bring the **Muse Archive** online at `archive.cocoex.xyz`. It lives in a **separate repo**
(`osiom/museobservatory`) — we are **NOT** merging it into cocoex-website.

## Why a subdomain + separate repo (not a subpath)
GitHub Pages allows exactly **one custom domain per repo**, so each repo claims its own:
- `cocoex-website` → `cocoex.xyz`
- `museobservatory` → `archive.cocoex.xyz`

Keeping them separate isolates the archive's WebGL globe (documented device-fragility) and
its own build/deploy from the main marketing site — a globe or build failure can't take
cocoex.xyz down. Chosen over `cocoex.xyz/archive` (which would need merging two Vite builds).

## The only code change: flip the Vite base to root
`museobservatory` currently deploys under the project subpath. Its `vite.config.js` already
has a **conditional base** — `process.env.GITHUB_PAGES ? '/museobservatory/' : '/'`. The
deploy workflow (`.github/workflows/deploy.yml`) sets `GITHUB_PAGES: 1` on the build step,
which forces the `/museobservatory/` base. For a custom apex-style subdomain the site serves
from **root**, so:

- **Remove the `env: { GITHUB_PAGES: 1 }` block** from the `npm run build` step in
  `museobservatory/.github/workflows/deploy.yml` → base becomes `/`. (The vite.config
  comment already anticipates a custom-domain root base.)
- **Add `museobservatory/public/CNAME`** containing `archive.cocoex.xyz` (Vite copies
  `public/` → `dist/` root, so the domain survives every deploy — same trick as the main site).

No other code changes expected. The archive uses the same `actions/deploy-pages@v4` flow.

## Steps (do AFTER the main domain is live on Cloudflare)
1. Add the `archive` CNAME record at Cloudflare (see the DNS block above).
2. In the **museobservatory** repo: remove `GITHUB_PAGES: 1` from the deploy workflow build
   step + add `public/CNAME` = `archive.cocoex.xyz`. Commit + push (triggers a deploy).
3. museobservatory repo → **Settings → Pages** → Custom domain = `archive.cocoex.xyz` → Save →
   wait for the green DNS check → tick **Enforce HTTPS**.
4. Verify:
   ```
   dig archive.cocoex.xyz +short     # → osiom.github.io
   ```
   Load https://archive.cocoex.xyz — globe + grid render, record pages resolve, assets 200
   (confirm no `/museobservatory/`-prefixed 404s — that's the tell the base flip didn't take).

## Gotchas
- **Don't forget the base flip.** If `GITHUB_PAGES: 1` is left in, assets 404 under the
  subdomain (they'd expect `/museobservatory/…`). This is the #1 thing to check after deploy.
- Enabling Pages + setting the custom domain is a repo-admin toggle (per repo).
- `www` → `osiom.github.io` (cocoex-website) and `archive` → `osiom.github.io` (museobservatory) — both moved to `osiom`; same host, GitHub disambiguates by Host header.
