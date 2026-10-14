#!/usr/bin/env node
/**
 * DoForYou mobile UI regression audit.
 * Static checks catch configuration/source regressions. Visual spacing, clipping,
 * keyboard behavior and adaptive-icon safe-zone still require device screenshots.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const results = [];
const add = (name, status, detail) => results.push({ name, status, detail });
const read = (file) => {
  try { return fs.readFileSync(path.join(root, file), 'utf8'); }
  catch { return null; }
};
const exists = (file) => fs.existsSync(path.join(root, file));
const walk = (dir) => {
  if (!exists(dir)) return [];
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(tsx|ts)$/.test(entry.name) ? [full] : [];
  });
};
const check = (name, condition, detail) => add(name, condition ? 'PASS' : 'FAIL', detail);
const warn = (name, detail) => add(name, 'VISUAL CHECK', detail);

const pkg = JSON.parse(read('package.json') || '{}');
const app = JSON.parse(read('app.json') || '{}');
const login = read('src/screens/auth/LoginScreen.tsx') || '';
const register = read('src/screens/auth/RegisterScreen.tsx') || '';
const brand = read('src/components/BrandLogo.tsx') || '';
const authHeader = read('src/components/AuthBrandHeader.tsx') || '';

check('Shared logo component uses image artwork',
  /require\(['"][^'"]*assets\/icon\.png['"]\)/.test(brand),
  'BrandLogo should render the shared icon asset, not a letter placeholder.');
check('Sign-in uses shared auth branding',
  /AuthBrandHeader/.test(login),
  'LoginScreen should import and render AuthBrandHeader.');
check('Registration uses shared auth branding',
  /AuthBrandHeader/.test(register),
  'RegisterScreen should import and render AuthBrandHeader.');
check('Sign-in has password-help action',
  /Forgot password\?/.test(login) && /mailto:/.test(login),
  'Confirm password-help action is present; this is a support email flow, not proof of automated reset.');
check('Registration has terms/privacy consent',
  /acceptedTerms/.test(register) && /Terms & Conditions/.test(register) && /Privacy Policy/.test(register),
  'Consent must gate account creation and link to terms and privacy information.');
check('Auth screens allow content to grow and scroll',
  /flexGrow:\s*1/.test(login) && /flexGrow:\s*1/.test(register) &&
  /keyboardShouldPersistTaps="handled"/.test(login) && /keyboardShouldPersistTaps="handled"/.test(register),
  'Check flexGrow and keyboard-friendly scrolling on both auth screens.');
check('Non-functional sign-in pills absent',
  !/Post a task|Find work/.test(login),
  'These labels should not be displayed as inert controls on the sign-in screen.');
check('Launcher icon asset exists',
  exists('assets/icon.png'),
  'app.json points the launcher icon to assets/icon.png.');
check('Android adaptive icon asset exists',
  exists('assets/adaptive-icon.png'),
  'Android adaptiveIcon.foregroundImage must exist.');
const splashImage = app.expo?.splash?.image;
const androidSplashImage = app.expo?.android?.splash?.image;
check('Splash artwork paths exist',
  typeof splashImage === 'string' && exists(splashImage.replace(/^\.\//, '')) &&
  typeof androidSplashImage === 'string' && exists(androidSplashImage.replace(/^\.\//, '')),
  'Both Expo and Android splash images should resolve to repository assets.');
check('Cream splash/adaptive backgrounds configured',
  app.expo?.splash?.backgroundColor === '#FFF9F2' &&
  app.expo?.android?.splash?.backgroundColor === '#FFF9F2' &&
  app.expo?.android?.adaptiveIcon?.backgroundColor === '#FFF9F2',
  'Keep the splash and adaptive icon backgrounds aligned with DFY cream.');

const sourceFiles = walk('src');
const letterPlaceholderMatches = [];
for (const file of sourceFiles) {
  const content = read(file) || '';
  if (/<Text[^>]*>\s*D\.?\s*<\/Text>/.test(content)) letterPlaceholderMatches.push(file);
}
check('No obvious standalone D text placeholders',
  letterPlaceholderMatches.length === 0,
  letterPlaceholderMatches.length ? 'Possible placeholders found in: ' + letterPlaceholderMatches.join(', ') :
    'No simple <Text>D</Text> / <Text>D.</Text> placeholder found in src. Review visual logo usage as well.');

warn('Bottom whitespace and vertical balance',
  'Requires screenshot comparison at small and tall device sizes; flexGrow alone cannot prove the layout looks balanced.');
warn('Launcher icon safe-zone and perceived logo size',
  'Inspect a built Android launcher screenshot; static config cannot measure the visual padding inside the PNG.');
warn('Splash animation and transition timing',
  'This audit checks static Expo splash assets only; animated “Let’s get it done.” behavior needs a runtime/device test.');
warn('Keyboard, clipping, contrast and tap targets',
  'Run device/emulator screenshots and interaction tests at supported font scales and with the keyboard open.');

console.log('DoForYou Mobile UI Audit');
console.log('========================');
for (const result of results) {
  console.log(`[${result.status}] ${result.name} — ${result.detail}`);
}
const failed = results.filter((result) => result.status === 'FAIL');
const visual = results.filter((result) => result.status === 'VISUAL CHECK');
console.log('');
console.log(`Summary: ${results.length - failed.length - visual.length} passed; ${failed.length} failed; ${visual.length} require visual/device review.`);
if (failed.length) process.exitCode = 1;
