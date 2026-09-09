const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { createRequire } = require('node:module');
const queryString = require('query-string');

// Resolve through Expo Router, including any nested query-string installation.
const routerRequire = createRequire(require.resolve('expo-router/package.json'));
const routerQueryString = routerRequire('query-string');

test('Expo Router resolves the patched query-string implementation', () => {
  assert.equal(routerQueryString, queryString);
  const decoderRequire = createRequire(require.resolve('query-string'));
  const decoder = decoderRequire('decode-uri-component');
  assert.equal(typeof decoder.default, 'function');
});

test('query parsing preserves deep-link values, Unicode, duplicates, and empty parameters', () => {
  assert.deepEqual({ ...routerQueryString.parse('q=hello+world&name=%E4%BD%A0%E5%A5%BD&tag=a&tag=b&empty=&flag&next=%2Fhome%3Fx%3D1') }, {
    q: 'hello world', name: '你好', tag: ['a', 'b'], empty: '', flag: null, next: '/home?x=1',
  });
});

test('query strings round-trip and bracket arrays retain their existing API', () => {
  const params = { q: 'a+b & c', name: '你好', empty: '', tag: ['one', 'two'] };
  const encoded = routerQueryString.stringify(params, { arrayFormat: 'bracket' });
  assert.deepEqual({ ...routerQueryString.parse(encoded, { arrayFormat: 'bracket' }) }, params);
  const parsed = routerQueryString.parseUrl('myapp://details/7?q=hello%20world#section', { parseFragmentIdentifier: true });
  assert.equal(parsed.url, 'myapp://details/7');
  assert.equal(parsed.query.q, 'hello world');
  assert.equal(parsed.fragmentIdentifier, 'section');
});

test('malformed UTF-8 stays literal while valid adjacent characters decode once', () => {
  for (const [input, expected] of [
    ['%C3%41', '%C3A'], ['%F0%9F%98', '%F0%9F%98'], ['%G0', '%G0'],
    ['%C3%A5%80%C3%A5', 'å%80å'], ['%84%D7%25%88%90', '%84%D7%%88%90'],
    ['%2525', '%25'],
  ]) assert.equal(routerQueryString.parse(`q=${input}`).q, expected);
});

test('large malformed query input finishes instead of exhausting CPU', () => {
  // A separate process makes a regression killable even if the parser blocks its event loop.
  const child = spawnSync(process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const qs = require(${JSON.stringify(require.resolve('query-string'))});
    for (const byte of ['%C3', '%80', '%F0%9F']) {
      const input = byte.repeat(12000);
      assert.equal(qs.parse('q=' + input).q, input);
    }
  `], { encoding: 'utf8', timeout: 5000 });
  assert.ifError(child.error);
  assert.equal(child.status, 0, child.stderr);
});
