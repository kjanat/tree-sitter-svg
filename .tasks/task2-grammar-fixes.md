# Task 2: Grammar Fixes

**Status:** complete
**Files:** `grammar.js`, `src/scanner.c`, `test/corpus/misc_nodes.txt`

## Results

All 112 tests pass. The `cdata_text` fix required a deeper change than the
task specified: the regex `([^\]]|\][^\]]|\]\][^>])+` over-matches when 3+
consecutive `]` precede `>` (e.g. `]]]>`), consuming the `]]>` delimiter.
No pure regex can handle this without lookaheads. Solution: moved `cdata_text`
to an external scanner token (like tree-sitter-xml does) that emits chunks
via `repeat1()` in the grammar, using `mark_end` + returning false to let
tree-sitter reset the lexer when `]]>` is detected. Commit: `c7dd390`.

## Changes

### W2 — Fix `cdata_text` regex (grammar.js line 151)

Change:

```js
cdata_text: _ => token(/([^\]]|\][^\]])+/),
```

To:

```js
cdata_text: _ => token(/([^\]]|\][^\]]|\]\][^>])+/),
```

The third alternative `\]\][^>]` allows `]]` not followed by `>` inside CDATA.

Add a corpus test case to `test/corpus/misc_nodes.txt` (append at the end):

```
==================
CDATA with consecutive close brackets
==================

<svg><text><![CDATA[a[0]=b[1]]]></text></svg>

---

(source_file
  (text)
  root: (svg_root_element
    (start_tag
      name: (name))
    (element
      (start_tag
        name: (name))
      (cdata_section
        (cdata_text))
      (end_tag
        name: (name)))
    (end_tag
      name: (name)))
  (text))
```

### W3 — Remove dead `length_list` rule (grammar.js line 1117)

Delete line 1117:

```js
length_list: $ => seq($.length_or_percentage, repeat(seq($.comma_wsp, $.length_or_percentage))),
```

This rule is never referenced by any other rule in the grammar.

### S8 — Add comment above `event_attribute_value` (grammar.js ~line 1047)

Add before `event_attribute_value`:

```js
// Manual quoting (not `quoted()`) — each quote type needs a distinct
// inner token (script_text_double/single) for injection targeting.
```

## Verification

1. `tree-sitter generate` (regenerate parser)
2. `tree-sitter test` (all tests must pass including new CDATA test)

## Commit

`fix(grammar): fix cdata_text regex, remove dead length_list`
