# Accessibility baseline (WCAG 2.2 AA)

## Scope

This accessibility baseline applies to all public pages:

- `/index.html`
- `/pics.html`
- `/blog/index.html`
- `/resume/index.html`
- `/estimate/index.html`
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

### Manual checks

Manual keyboard and screen-reader checks were run for:

- logical heading and landmark order
- visible focus indicator and tab navigation
- form labels and error messaging
- descriptive link text and image alternatives
- dynamic update announcements in estimator and auth status areas

## Prioritized issue backlog

### Blocking

- None currently identified after this pass.

### Major

- Third-party widgets (PayPal/Google Maps/Firebase SDK UI behavior) still depend on external scripts and should be manually re-verified with assistive technology after vendor updates.

### Minor

- Placeholder pages (`blog` and `resume`) should receive final content with maintained heading/landmark consistency.
- Continue contrast checks for any future color additions in inline component styles.

## Re-test and sign-off

Before release:

1. Run `npm test`.
2. Verify keyboard-only navigation across all scoped pages.
3. Verify estimator result and error announcements with a screen reader.
4. Confirm third-party embedded flows are reachable and operable.

## Accessibility changelog

- Standardized document structure and landmarks on scoped pages.
- Added skip links and visible focus styles.
- Improved form labeling and validation messaging on estimator and email pages.
- Added polite/assertive live regions for dynamic status and error updates.
- Added repeatable CI accessibility checks.
