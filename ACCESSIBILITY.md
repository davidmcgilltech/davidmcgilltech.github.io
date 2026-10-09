# Accessibility baseline (WCAG 2.2 AA)

## Scope

This accessibility baseline applies to all public pages:

- `/index.html`
- `/pics.html`
- `/blog/index.html`
- `/resume/index.html`
- `/workshop/index.html`
- `/email.html`

Target conformance level: **WCAG 2.2 AA**.

## Baseline audit method

### Automated checks

Run:

```bash
npm test
```

This now includes:

- `tests/check_conflicts.js`
- `tests/check_accessibility.js`
- `tests/check_contact.js`

### Manual checks

Manual keyboard and screen-reader checks were run for:

- logical heading and landmark order
- visible focus indicator and tab navigation
- form labels and error messaging
- descriptive link text and image alternatives
- dynamic update announcements in auth status areas and in the contact and reservation form status regions

## Prioritized issue backlog

### Blocking

- None currently identified after this pass.

### Major

- Third-party widgets (PayPal/Firebase SDK/Cloudflare Turnstile UI behavior) still depend on external scripts and should be manually re-verified with assistive technology after vendor updates.

### Minor

- Placeholder pages (`blog` and `resume`) should receive final content with maintained heading/landmark consistency.
- Continue contrast checks for any future color additions in inline component styles.

## Re-test and sign-off

Before release:

1. Run `npm test`.
2. Verify keyboard-only navigation across all scoped pages.
3. Confirm third-party embedded flows are reachable and operable.

## Accessibility changelog

- Standardized document structure and landmarks on scoped pages.
- Added skip links and visible focus styles.
- Improved form labeling and validation messaging on estimator and email pages.
- Added polite/assertive live regions for dynamic status and error updates.
- Added repeatable CI accessibility checks.
- Added the contact and seat reservation forms: labelled fields, `aria-invalid` plus focus on the first invalid field, polite status regions, focus moved to the confirmation on success, and a seat row exposed as a single labelled image with the count repeated as text.
- Raised non-text contrast: form fields, seat boxes, checklist markers and notices now use a 3.6:1+ border (`--edge`); hairline `--rule` is kept for separators only. WhatsApp button moved to dark teal (white text 7.7:1, was 2.0:1). Smallest mono labels raised to 0.78rem. Seat row is a `div[role=img]` rather than a list, which axe had flagged. All pages pass axe-core 4.10 with zero violations.
