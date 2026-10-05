# dmcgill50

This project hosts the source for https://davidmcgill.tech.

Recent updates removed leftover merge conflict markers that appeared on the live homepage. Pull the latest version to ensure they are gone.

## Accessibility

Accessibility standards, audit scope, baseline backlog, and sign-off steps are documented in [`ACCESSIBILITY.md`](./ACCESSIBILITY.md).

## Contact and reservation forms

The site publishes no email address. The contact form on the homepage and the seat reservation form on `/workshop/` are submitted by `assets/forms.js` to the workshop hub at `https://learn.davidmcgill.tech` (repo `davidmcgilltech/davidmcgill-learn`), which verifies Turnstile and emails the message on. `tests/check_contact.js` fails if any page gains a `mailto:` link or a literal address.

Two values in `assets/forms.js` tie the site to that app: `API_BASE` and `TURNSTILE_SITE_KEY` (the public site key of the Turnstile widget for `davidmcgill.tech`). The hub must list `https://davidmcgill.tech` in its `SITE_ORIGINS`.

To try the forms locally, run the hub (`npm run dev` in `davidmcgill-learn`, port 8787) and serve this repo on port 4000 (`python3 -m http.server 4000`). On `localhost` the script targets the local hub and Cloudflare's always-pass Turnstile test key.

## SEO conventions

`sitemap.xml` at the repo root lists every public URL. Add new pages to it.

Every page must carry all five of these, or it drags down the site-wide score
(the audit scores most checks as the *fraction of pages* that pass, so one thin
page lowers the result for all of them):

1. `<title>` between 30 and 65 characters, unique across the site
2. `<meta name="description">` between 70 and 160 characters
3. `<link rel="canonical">` with the absolute URL
4. A `<script type="application/ld+json">` block
5. At least 300 words of body copy **inside `<main>`**

Word count is measured after `script`, `style`, `noscript`, `nav`, `footer`,
and `header` are stripped. Copy placed in the header or footer does not count.

Audit the live site from the `seoscout` project:

```bash
seoscout run davidmcgill.yaml
```

## Custom domain configuration

If HTTPS fails with a `NET::ERR_CERT_COMMON_NAME_INVALID` error, verify the following:

1. `CNAME` file contains only `davidmcgill.tech`.
2. GitHub Pages settings list `davidmcgill.tech` as the custom domain and HTTPS is enforced.
3. DNS provider has these A records for `@`:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
   and a CNAME for `www` pointing to `davidmcgill.tech`.
