# Decoder fallback CPU mitigation

`decode-uri-component` 0.5.0 fixes the old recursive malformed-UTF-8 decoder, but its outer fallback still collects one replacement-map entry per distinct encoded run and rescans the entire input for every entry. A roughly 1.18 MB query containing 64,000 distinct valid encoded runs followed by `%C3` exceeded a five-second timeout through `query-string.parse()` during verification.

`decode-uri-component+0.5.0.patch` replaces the outer replacement-map loop with a callback over the original percent-encoded runs. Each run is decoded once. The existing linear byte scanner retains the package's uppercase UTF-16 BOM and truncated `%C2` fallback behavior, applied to original bytes so decoded percent characters are not decoded again. Callback replacements also preserve literal dollar characters instead of interpreting JavaScript replacement-string patterns.

The patch intentionally leaves the published package version and registry integrity intact. `patch-package` must run during installation; the project's failing postinstall hook prevents silently proceeding when the version-specific patch no longer applies. Re-evaluate and remove this patch when an upstream release addresses distinct-run rescanning.

## Verification

- All 135 upstream test invocations from [the 0.5 decoder fix's test suite](https://github.com/SamVerschueren/decode-uri-component/blob/fa479dafeede7bedf04e5c89aa78f2a78c664005/test.js) passed against a temporary patched module. The upstream AVA assertions were executed using a local Node assert adapter; no upstream test files were added to this repository.
- `node --test tests/security/decoder-runs.test.cjs` covers 64,000 distinct runs in a bounded subprocess, one-pass decoding, dollar output, BOM/truncated-C2 behavior, valid Unicode boundaries, and malformed UTF-8.
- The distinct-run regression completed in approximately 81 ms including process startup locally, compared with a five-second timeout before the patch. Timing varies by machine; the test checks a generous deadline rather than an exact duration.
- Existing `query-string` integration tests cover the Expo Router resolution path, query parsing, round trips, malformed repeated bytes, and Unicode.

Source: [upstream decoder implementation](https://github.com/SamVerschueren/decode-uri-component/blob/fa479dafeede7bedf04e5c89aa78f2a78c664005/index.js). The additional distinct-run problem was independently reproduced while validating the dependency security update.
