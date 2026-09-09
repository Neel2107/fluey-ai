# image-size parser mitigation

`image-size+1.2.1.patch` locally guards Metro's existing CommonJS dependency against the non-advancing parser loops described in [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) and [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq). The [researcher's report](https://joshua.hu/image-size-infinite-loop-dos-vulnerabilities) explains the zero-length ICNS entry and matched JXL partial-stream box cases. This is a local mitigation, not a published upstream release or a renamed package.

- ICNS entries require a complete eight-byte header and a declared length of at least eight bytes within the declared file length. Each iteration therefore advances. Header-only reads of large valid icons remain supported.
- ISO BMFF boxes require a complete eight-byte header and a bounded size. A legal zero-sized box is normalized to the bytes remaining through EOF, so callers receive a positive size. Unsupported extended-size headers and undersized/oversized boxes stop parsing.

Run `node --test tests/security/image-size.test.cjs`. Every parser invocation runs in a child process with a two-second timeout and a 64 MiB JS heap limit, so a regression cannot hang the test runner. Tests cover malformed ICNS/JXL/HEIF headers, both first and later ICNS entries, and ordinary/EOF-sized valid containers plus PNG/GIF dimensions. Tests resolve the same image-size installation that Metro loads.

A standard install must run the root postinstall patch step. An install with `--ignore-scripts` must explicitly run `npm run postinstall` before use. Keep the security tests in validation. When a compatible upstream fix becomes available, upgrade image-size, remove this version-specific patch, and rerun the tests.

As of 2026-09-09, npm's latest image-size is 2.0.2 and the advisories list no patched version. Dependabot/npm audit inspect package versions, not this patch; the two image-size alerts can remain open until upstream publishes a recognized fix. Do not dismiss them merely because this mitigation is applied.
