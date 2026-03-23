# Task 3: Highlights & Injections

**Status:** complete
**Files:** `queries/highlights.scm`, `queries/injections.scm`

## Changes to `queries/highlights.scm`

### W4 — Add `erroneous_end_tag` highlight

Add after the `self_closing_tag` capture (after line 23):

```scheme
(erroneous_end_tag
  (name) @tag)
```

### W5 — Add `script_text_*` fallback `@string`

Add after the `style_text_single` capture (after line 54):

```scheme
(script_text_double) @string
(script_text_single) @string
```

### S2 — Add color value captures

Add BEFORE the `[(quoted_attribute_value) ...] @string` block (before line 41) so they take precedence:

```scheme
(hex_color) @constant
(functional_color) @function.call
(named_color) @constant
```

### S3 — Add transform function name captures

Add after the attribute value `@string` block:

```scheme
(matrix_transform "matrix" @function.builtin)
(translate_transform "translate" @function.builtin)
(scale_transform "scale" @function.builtin)
(rotate_transform "rotate" @function.builtin)
(skew_x_transform "skewX" @function.builtin)
(skew_y_transform "skewY" @function.builtin)
```

### S1 — Add missing punctuation delimiters

Add to the delimiter list at lines 116-124:

```scheme
"<!--"
"-->"
"<!DOCTYPE"
"<![CDATA["
"]]>"
```

## Changes to `queries/injections.scm`

### S7 — Fix `foreignObject` injection to capture text children

Replace the current foreignObject pattern (lines 19-27) with two patterns:

```scheme
; HTML in <foreignObject> — element children
((element
  (start_tag (name) @_start)
  (element) @injection.content
  (end_tag (name) @_end))
 (#match? @_start "(^|:)foreignObject$")
 (#match? @_end "(^|:)foreignObject$")
 (#set! injection.language "html")
 (#set! injection.combined)
 (#set! injection.include-children))

; HTML in <foreignObject> — text children
((element
  (start_tag (name) @_start)
  (text) @injection.content
  (end_tag (name) @_end))
 (#match? @_start "(^|:)foreignObject$")
 (#match? @_end "(^|:)foreignObject$")
 (#set! injection.language "html")
 (#set! injection.combined))
```

## Verification

- `tree-sitter test` (query changes don't affect corpus tests, but verify no regressions)

## Commit

`fix(queries): add missing highlights, fix foreignObject injection`
