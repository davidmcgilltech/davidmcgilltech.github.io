const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.join(__dirname, '..');

// Public pages. email.html is the Firebase auth sample: its only address is the
// you@example.com input placeholder.
const pages = [
  'index.html',
  'pics.html',
  'blog/index.html',
  'resume/index.html',
  'workshop/index.html'
];

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

// The site takes messages through a form so that no address is published for
// scrapers to harvest. A mailto: link or a literal address undoes that.
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert(!/mailto:/i.test(html), `${page}: contains a mailto: link`);
  const found = html.match(EMAIL) || [];
  assert.deepStrictEqual(found, [], `${page}: publishes an email address`);
}

// Every form page must load the script that submits it.
for (const page of ['index.html', 'workshop/index.html']) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert(/<form[^>]*data-form=/.test(html), `${page}: form is missing`);
  assert(/<script[^>]*src="[^"]*assets\/forms\.js"/.test(html), `${page}: forms.js is not loaded`);
}

// The forms cannot work in production with the placeholder key, so publishing
// before the Turnstile widget exists must fail here rather than on the live site.
const forms = fs.readFileSync(path.join(root, 'assets/forms.js'), 'utf8');
assert(
  !forms.includes('REPLACE_WITH_TURNSTILE_SITE_KEY'),
  'assets/forms.js: set the production Turnstile site key before publishing'
);

console.log('Contact checks passed.');
