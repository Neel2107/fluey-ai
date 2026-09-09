const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');
const { createRequire } = require('node:module');
// Resolve the exact dependency Metro loads, including a future nested install.
const metroRequire = createRequire(require.resolve('metro/package.json'));
const modulePath = process.env.IMAGE_SIZE_TEST_MODULE || metroRequire.resolve('image-size');
const worker = `
  const assert = require('node:assert/strict');
  const { input, dimensions, reject } = JSON.parse(require('node:fs').readFileSync(0, 'utf8'));
  const imageSize = require(process.argv[1]);
  const run = () => imageSize(Buffer.from(input, 'base64'));
  if (reject) assert.throws(run);
  else { const result = run(); assert.equal(result.width, dimensions[0]); assert.equal(result.height, dimensions[1]); }
`;
function check(input, expectation) {
  const result = spawnSync(process.execPath, ['--max-old-space-size=64', '-e', worker, modulePath], {
    input: JSON.stringify({ input: input.toString('base64'), ...expectation }),
    encoding: 'utf8', timeout: 2000,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr || `Worker killed by ${result.signal}`);
}
function u32(value) { const b = Buffer.alloc(4); b.writeUInt32BE(value); return b; }
function box(name, data = Buffer.alloc(0), size = data.length + 8) {
  return Buffer.concat([u32(size), Buffer.from(name), data]);
}
function icns(entries, declaredLength) {
  // ICNS headers store the type before the length (opposite of BMFF).
  const body = Buffer.concat(entries.map(entry => entry.length < 8 ? entry :
    Buffer.concat([entry.subarray(4, 8), entry.subarray(0, 4), entry.subarray(8)])));
  return Buffer.concat([Buffer.from('icns'), u32(declaredLength ?? body.length + 8), body]);
}
const jxlHeader = box('JXL ', Buffer.from([13, 10, 135, 10]));
const jxlBrand = box('ftyp', Buffer.from('jxl \0\0\0\0'));
const jxlStream = Buffer.from([255, 10, 63, 62]);
const jxl = (...boxes) => Buffer.concat([jxlHeader, jxlBrand, ...boxes]);
function heif(lastSize) {
  const ispe = box('ispe', Buffer.concat([u32(0), u32(32), u32(24)]), lastSize);
  return Buffer.concat([box('ftyp', Buffer.from('avif\0\0\0\0')),
    box('meta', Buffer.concat([u32(0), box('iprp', box('ipco', ispe))]))]);
}
for (const length of [0, 1, 4, 7, 0xffffffff]) {
  test(`rejects ICNS entry length ${length} within a bounded subprocess`, () => {
    check(icns([box('is32', Buffer.alloc(0), length)]), { reject: true });
  });
}
test('rejects a zero-length second ICNS entry', () => {
  check(icns([box('is32'), box('icp5', Buffer.alloc(0), 0)]), { reject: true });
});
test('rejects truncated ICNS entry headers', () => {
  check(icns([Buffer.from('is32')]), { reject: true });
});
test('preserves single and multiple ICNS dimensions', () => {
  check(icns([box('is32')]), { dimensions: [16, 16] });
  check(icns([box('is32'), box('icp5')]), { dimensions: [16, 16] });
});
test('preserves ICNS dimensions from a partial file read', () => {
  check(icns([box('is32', Buffer.alloc(0), 600000)], 600008), { dimensions: [16, 16] });
});
test('rejects empty zero-sized JXL partial stream without looping', () => {
  check(jxl(box('jxlp', u32(0), 0)), { reject: true });
});
for (const length of [1, 4, 7, 0xffffffff]) {
  test(`rejects invalid JXL box size ${length}`, () => {
    check(jxl(box('jxlp', u32(0), length)), { reject: true });
  });
}
test('preserves complete and split JXL codestream dimensions', () => {
  check(jxl(box('jxlc', jxlStream)), { dimensions: [256, 256] });
  check(jxl(box('jxlp', Buffer.concat([u32(0), jxlStream.subarray(0, 2)])),
    box('jxlp', Buffer.concat([u32(0x80000001), jxlStream.subarray(2)]))), { dimensions: [256, 256] });
});
test('handles EOF-sized JXL partial stream with forward progress', () => {
  check(jxl(box('jxlp', Buffer.concat([u32(0x80000000), jxlStream]), 0)), { dimensions: [256, 256] });
});
test('preserves HEIF dimensions and legal EOF-sized final box', () => {
  check(heif(20), { dimensions: [32, 24] });
  check(heif(0), { dimensions: [32, 24] });
});
for (const length of [1, 4, 7, 0xffffffff]) {
  test(`rejects invalid HEIF box size ${length}`, () => check(heif(length), { reject: true }));
}
test('preserves PNG and GIF dimension detection', () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64');
  check(png, { dimensions: [1, 1] }); check(gif, { dimensions: [1, 1] });
});
