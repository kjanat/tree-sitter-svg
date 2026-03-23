# Task 1: Scanner Documentation

**Status:** complete
**Files:** `src/scanner.c`, `DISCOVERIES.md`

## Changes

### W1 — Document `(char)` truncation

Add block comment above `scan_tag_name` function (~line 101 in scanner.c):

```c
// Tag names stored as char (8-bit). The (char) cast from int32_t truncates
// code points above U+007F. Safe for SVG (all element names are ASCII) and
// matches tree-sitter-xml/html. To support non-ASCII XML names, change
// String to Array(int32_t) and update serialization.
```

Add inline comment at line ~211 in `scan_raw_text` before the `(char)` cast comparison:

```c
// Cast safe: tag names are ASCII (see scan_tag_name note)
```

### S6 — Document serialization truncation

Add comment before the for-loop in `tree_sitter_svg_external_scanner_serialize` (~line 308):

```c
// Serialize as many tags as fit. If buffer fills, stop early and patch
// the count header. Truncated deep tags become erroneous_end_tag.
// SVG nesting rarely exceeds the ~1024-byte buffer.
```

### DISCOVERIES.md

Add entry under the existing "Build & Tooling" section:

```
- Scanner stores tag names as `Array(char)`, truncating `int32_t` lookahead to 8 bits; safe for SVG (ASCII-only names), matches tree-sitter-xml/html; widening to `Array(int32_t)` would require serialization format change
- Serialization silently truncates tag stack when 1024-byte buffer exceeded; `written` count is patched to reflect actual serialized tags
```

## Verification

- `tree-sitter test` (should pass unchanged — comments only)

## Commit

`docs(scanner): document char truncation and serialization limits`
