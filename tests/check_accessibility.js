const fs = require('fs');
const assert = require('assert');

const pages = [
  'index.html',
  'pics.html',
  'blog/index.html',
  'resume/index.html',
  'estimate/index.html',
  'email.html'
];

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function ensure(condition, message) {
  assert(condition, message);
}

function hasDoctype(html) {
  return /<!doctype html>/i.test(html);
}

function hasLang(html) {
  return /<html[^>]*\blang\s*=\s*['"][^'"]+['"]/i.test(html);
}

function hasViewport(html) {
  return /<meta[^>]*name\s*=\s*['"]viewport['"][^>]*>/i.test(html);
}

function hasTitle(html) {
  return /<title>[^<]+<\/title>/i.test(html);
}

function hasMainLandmark(html) {
  return /<main\b/i.test(html);
}

function allImagesHaveAlt(html) {
  const images = [...html.matchAll(/<img\b[^>]*>/gi)].map(match => match[0]);
  return images.every(img => /\balt\s*=\s*['"][^'"]*['"]/i.test(img));
}

function allInputsHaveLabels(html) {
  const inputs = [...html.matchAll(/<input\b[^>]*id\s*=\s*['"]([^'"]+)['"][^>]*>/gi)];
  return inputs.every((match) => {
    const id = match[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const labelRegex = new RegExp(`<label[^>]*for\\s*=\\s*['\"]${id}['\"][^>]*>`, 'i');
    return labelRegex.test(html);
  });
}

for (const page of pages) {
  const html = read(page);
  ensure(hasDoctype(html), `${page}: missing <!DOCTYPE html>`);
  ensure(hasLang(html), `${page}: missing html lang attribute`);
  ensure(hasViewport(html), `${page}: missing viewport meta tag`);
  ensure(hasTitle(html), `${page}: missing title element`);
  ensure(hasMainLandmark(html), `${page}: missing main landmark`);
  ensure(allImagesHaveAlt(html), `${page}: one or more images missing alt text`);
  ensure(allInputsHaveLabels(html), `${page}: one or more inputs missing associated labels`);
}

console.log('Accessibility baseline checks passed.');
