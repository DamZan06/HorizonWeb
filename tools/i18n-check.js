const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const languages = ['en', 'it', 'de', 'fr'];
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html') && !file.startsWith('google'));
const jsFiles = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.js')) jsFiles.push(path.relative(root, fullPath));
  }
}
walk(path.join(root, 'js'));

const context = {
  window: {},
  document: { documentElement: { lang: 'en' } },
  navigator: { language: 'en' },
  localStorage: {},
  CustomEvent: function CustomEvent() {},
  console
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8'), context, { filename: 'js/i18n.js' });
for (const language of languages) {
  const file = `js/locales/${language}.js`;
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}

function flatten(value, prefix = '', output = {}) {
  for (const [key, child] of Object.entries(value || {})) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') output[next] = child;
    else if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, next, output);
  }
  return output;
}

const flattened = Object.fromEntries(languages.map((language) => [
  language,
  flatten(context.window.HorizonI18n.locales[language])
]));
const failures = [];
const englishKeys = Object.keys(flattened.en).sort();

for (const language of languages) {
  for (const key of englishKeys) {
    if (!flattened[language][key]) failures.push(`${language}: missing or empty translation for ${key}`);
  }
  for (const key of Object.keys(flattened[language])) {
    if (!(key in flattened.en)) failures.push(`${language}: key not present in English locale: ${key}`);
  }
  for (const [key, value] of Object.entries(flattened[language])) {
    if (/\uFFFD|[A-Za-zÀ-ÿ]\?[A-Za-zÀ-ÿ]/u.test(value) || /^\?\s*[A-Za-zÀ-ÿ]/u.test(value)) {
      failures.push(`${language}: possible encoding damage in ${key}: ${value}`);
    }
  }
}

const referencedKeys = new Set();
const scannedFiles = [...htmlFiles, ...jsFiles.filter((file) => !file.startsWith('js/locales/'))];
for (const file of scannedFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (source.includes('copy:')) failures.push(`${file}: legacy copy: translation key remains`);

  for (const match of source.matchAll(/data-i18n="([^"]+)"/g)) referencedKeys.add(match[1]);
  for (const match of source.matchAll(/data-i18n-attr='([^']+)'/g)) {
    try {
      Object.values(JSON.parse(match[1])).forEach((key) => referencedKeys.add(key));
    } catch (error) {
      failures.push(`${file}: invalid data-i18n-attr JSON: ${match[1]}`);
    }
  }
  for (const match of source.matchAll(/\b(?:tr|tx)\(\s*['"]([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)+)['"]/g)) {
    referencedKeys.add(match[1]);
  }
  for (const match of source.matchAll(/\bi18n:\s*['"]([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)+)['"]/g)) {
    referencedKeys.add(match[1]);
  }
}

for (const key of [...referencedKeys].sort()) {
  for (const language of languages) {
    if (!flattened[language][key]) failures.push(`${language}: referenced key does not exist: ${key}`);
  }
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (!source.includes('js/i18n.js')) continue;
  const runtimeIndex = source.indexOf('js/i18n.js');
  for (const language of languages) {
    const localeIndex = source.indexOf(`js/locales/${language}.js`);
    if (localeIndex < 0) {
      failures.push(`${file}: does not load the ${language} locale`);
    } else if (localeIndex < runtimeIndex) {
      failures.push(`${file}: loads the ${language} locale before the i18n runtime`);
    }
  }

  for (const match of source.matchAll(/<meta\s+[^>]*(?:name="description"|(?:property|name)="(?:og|twitter):(title|description)")[^>]*>/g)) {
    if (!match[0].includes('data-i18n-attr')) failures.push(`${file}: translatable metadata is not annotated: ${match[0]}`);
  }

  const tokens = source.replace(/<!--[\s\S]*?-->/g, '').match(/<[^>]+>|[^<]+/g) || [];
  const stack = [];
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
  const allowedStaticText = [
    /^HORIZON$/,
    /^(?:Damiano Zanoni|Nicolas Mooser|“NicMos”)$/,
    /^(?:English|Italiano|Deutsch|Français)$/,
    /^(?:--\s*)?(?:kcal|km(?:\/h)?|m|h|bpm|L)$/i,
    /^(?:&minus;|&#x26F6;|X)$/,
    /^\d+(?:\.\d+)?x$/
  ];

  for (const token of tokens) {
    if (token.startsWith('<!')) continue;
    if (token.startsWith('</')) {
      const tag = token.slice(2).match(/^\s*([\w-]+)/)?.[1]?.toLowerCase();
      for (let index = stack.length - 1; index >= 0; index -= 1) {
        if (stack[index].tag === tag) { stack.length = index; break; }
      }
      continue;
    }
    if (token.startsWith('<')) {
      const tag = token.slice(1).match(/^\s*([\w-]+)/)?.[1]?.toLowerCase();
      if (!tag || token.startsWith('<?')) continue;
      const translated = /\sdata-i18n(?:=|\s|>)/.test(token);
      if (!voidTags.has(tag) && !token.endsWith('/>')) stack.push({ tag, translated });
      continue;
    }

    const text = token.replace(/\s+/g, ' ').trim();
    if (!text || !/[A-Za-zÀ-ÿ]/u.test(text)) continue;
    if (stack.some(({ tag }) => ['script', 'style', 'svg'].includes(tag))) continue;
    if (stack.some(({ translated }) => translated)) continue;
    if (stack.at(-1)?.tag === 'option') continue;
    if (allowedStaticText.some((pattern) => pattern.test(text))) continue;
    failures.push(`${file}: visible static text is not annotated for translation: ${text}`);
  }
}

if (failures.length) {
  console.error(`i18n validation failed with ${failures.length} problem(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Validated ${englishKeys.length} translation keys in ${languages.length} languages across ${htmlFiles.length} HTML pages.`);
