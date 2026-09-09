const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { createRequire } = require('node:module');
const routerRequire = createRequire(require.resolve('expo-router/package.json'));
const queryRequire = createRequire(routerRequire.resolve('query-string'));
const decoderPath = process.env.DECODER_TEST_MODULE || queryRequire.resolve('decode-uri-component');
const decode = require(decoderPath).default;

test('distinct encoded runs plus malformed suffix finish in bounded time', () => {
  const source = `
    const assert = require('node:assert/strict');
    const decode = require(process.argv[1]).default;
    const count = 64000;
    const input = Array.from({length: count}, (_, i) => '%41' +
      Array.from(String(i), c => '%' + c.charCodeAt(0).toString(16)).join('')).join('x') + '%C3';
    const expected = Array.from({length: count}, (_, i) => 'A' + i).join('x') + '%C3';
    assert.equal(decode(input), expected);
  `;
  const child = spawnSync(process.execPath, ['--max-old-space-size=128', '-e', source, decoderPath], {
    encoding: 'utf8', timeout: 5000,
  });
  assert.ifError(child.error);
  assert.equal(child.status, 0, child.stderr || `Worker killed by ${child.signal}`);
});

test('fallback processes original runs once, including percent and dollar output', () => {
  for (const [input, expected] of [
    ['%2525x%25x%C3', '%25x%x%C3'],
    ['%25C2%G0', '%C2%G0'],
    ['%25FE%25FF%G0', '%FE%FF%G0'],
    ['%24%26%C3', '$&%C3'],
    ['%84%D7%25%88%90', '%84%D7%%88%90'],
    ['%C3%A5%80%C3%A5', 'å%80å'],
  ]) assert.equal(decode(input), expected, input);
});

test('retains original BOM and uppercase truncated C2 behavior', () => {
  for (const [input, expected] of [
    ['%FE%FF', '\uFFFD\uFFFD'], ['%FF%FE', '\uFFFD\uFFFD'],
    ['a%FE%FFb', 'a\uFFFD\uFFFDb'],
    ['%FE%FF%FE%FF', '\uFFFD\uFFFD\uFFFD\uFFFD'],
    ['%EF%BB%BF', '\uFEFF'], ['%fe%ff', '%fe%ff'],
    ['%C2', '\uFFFD'], ['%C2%41', '\uFFFDA'],
    ['%C2%C2', '\uFFFD\uFFFD'], ['%C2%C2%B5', '\uFFFDµ'],
    ['%C2%B5%C2', 'µ\uFFFD'], ['%c2', '%c2'],
    ['%%C2%%', '%\uFFFD%%'],
  ]) assert.equal(decode(input), expected, input);
});

test('retains Unicode boundaries and malformed literal sequences', () => {
  for (const [input, expected] of [
    ['%F4%8F%BF%BF', '\u{10FFFF}'], ['%ED%9F%BF', '\uD7FF'],
    ['%F0%9F%98%80', '😀'], ['%E4%BD%A0%E5%A5%BD', '你好'],
    ['%F0%9F%98', '%F0%9F%98'], ['%F0%41%82%83', '%F0A%82%83'],
    ['%C0%AF', '%C0%AF'], ['%ED%A0%80', '%ED%A0%80'],
    ['%F4%90%80%80', '%F4%90%80%80'], ['%E0%80%80', '%E0%80%80'],
    ['%G0', '%G0'], ['%C3%41', '%C3A'], ['%2525', '%25'],
  ]) assert.equal(decode(input), expected, input);
});
