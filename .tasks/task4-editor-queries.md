# Task 4: Editor Integration Queries

**Status:** complete
**Files:** `queries/textobjects.scm`, `queries/brackets.scm`

## Changes to `queries/textobjects.scm`

### W6 — Fix `@parameter.inside` to target value only

Replace lines 9-11:

```scheme
(attribute) @parameter.around
(attribute
  (_) @parameter.inside)
```

With:

```scheme
(attribute) @parameter.around
(generic_attribute value: (_) @parameter.inside)
(d_attribute value: (_) @parameter.inside)
(viewbox_attribute value: (_) @parameter.inside)
(preserve_aspect_ratio_attribute value: (_) @parameter.inside)
(transform_attribute value: (_) @parameter.inside)
(points_attribute value: (_) @parameter.inside)
(style_attribute value: (_) @parameter.inside)
(paint_attribute value: (_) @parameter.inside)
(functional_iri_attribute value: (_) @parameter.inside)
(opacity_attribute value: (_) @parameter.inside)
(length_attribute value: (_) @parameter.inside)
(href_attribute value: (_) @parameter.inside)
(id_attribute value: (_) @parameter.inside)
(class_attribute value: (_) @parameter.inside)
(event_attribute value: (_) @parameter.inside)
```

## Changes to `queries/brackets.scm`

### S4 — Add comment/CDATA bracket pairs

Append to end of file:

```scheme
((comment
  "<!--" @open
  "-->" @close)
  (#set! rainbow.exclude))

((cdata_section
  "<![CDATA[" @open
  "]]>" @close)
  (#set! rainbow.exclude))
```

## Verification

- `tree-sitter test` (query changes don't affect corpus tests, but verify no regressions)

## Commit

`fix(queries): fix textobject value capture, add bracket pairs`
