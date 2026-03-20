# Grammar Refactor: Structural Tiers

**Date:** 2026-03-20
**Status:** Approved
**Goal:** Shrink grammar so parser.c builds as WASM; preserve useful API

## Problem

- grammar.js: 458 rules, 50 externals, 138 specialized attributes
- parser.c: 102K lines — WASM backend chokes
- Root cause: encoding SVG spec (per-element/per-attribute branches) into LR states

## Design Principle

**Parse structure, not schema.** Tree-sitter handles syntax. SVG vocabulary
awareness goes into queries and helpers.

## Element Types: 24 → 5

| Node type          | Justification                             |
| ------------------ | ----------------------------------------- |
| `svg_root_element` | Root detection, xmlns, viewBox            |
| `script_element`   | Raw text capture for JS injection         |
| `style_element`    | Raw text capture for CSS injection        |
| `path_element`     | `d` attribute sub-grammar only valid here |
| `element`          | Everything else (~50 SVG element names)   |

## Externals: 50 → 13

```text
_start_tag_name, _end_tag_name, _erroneous_end_tag_name
_svg_start_tag_name, _svg_end_tag_name
_script_start_tag_name, _script_end_tag_name
_style_start_tag_name, _style_end_tag_name
_path_start_tag_name, _path_end_tag_name
_raw_text
'/>'
```

## Attributes: 138 → 14 typed grammar rules

**Criterion:** only typed if value has actual grammar structure (not just a
quoted string). Count refers to grammar rules (not covered attribute names —
e.g. `paint_attribute` covers fill, stroke, color, etc.).

### Typed (kept — 14 grammar rules)

- `d_attribute` — path data sub-grammar (25 rules)
- `viewbox_attribute` — 4-number structured value
- `transform_attribute` — transform function list
- `points_attribute` — coordinate pair list
- `preserve_aspect_ratio_attribute` — enum grammar
- `style_attribute` — CSS injection target
- `paint_attribute` — paint value grammar (covers fill, stroke, color, stop-color, flood-color, lighting-color)
- `functional_iri_attribute` — `url(#ref)` references (covers clip-path, mask, filter, marker-*, cursor)
- `href_attribute` — IRI/URI reference, scope references
- `id_attribute` — scope definition for locals.scm
- `class_attribute` — multi-value token
- `event_attribute` — JS injection target
- `opacity_attribute` — numeric constraint (covers opacity, fill-opacity, stroke-opacity)
- `length_attribute` — length/percentage (covers x, y, width, height, r, rx, ry, cx, cy, dx, dy, etc.)

### Generic

Everything else becomes:

```javascript
attribute: ($ =>
	seq(
		field('name', $.attribute_name),
		optional(seq('=', field('value', $.attribute_value))),
	));
```

Queries use `#any-of?` / `#eq?` on attribute_name text for highlighting.

## Content Model Enforcement

Scanner-based, not grammar-based:

- Scanner keeps `is_*_name()` predicates for element classification
- Tag stack tracks nesting context
- Invalid children parse as generic `element` (not ERROR)
- Queries/lint flag violations downstream

## Path Data Sub-Grammar

Preserved intact (25 rules). Lives inside `path_element` context.

## Query File Changes

All four query files rewritten for generic tree:

- **highlights.scm** — `#any-of?` on tag_name/attribute_name text
- **injections.scm** — script/style stay node-based; event/style attrs use predicates
- **locals.scm** — id_attribute defines, href_attribute references (both still typed)
- **tags.scm** — adapted for generic element structure

## Scanner Changes

- 60 → ~14 token types
- Remove 19 specialized element category tokens
- Keep name predicates for content model validation
- Add `_raw_text` for script/style content
- Tag stack mechanism unchanged
- ~596 → ~300 lines

## Expected Outcome

| Metric             | Before | After       |
| ------------------ | ------ | ----------- |
| grammar.js rules   | 458    | ~120        |
| Externals          | 50     | 13          |
| Element categories | 24     | 5           |
| Attribute rules    | 138    | 14          |
| Node types         | 968    | ~150        |
| parser.c lines     | 102K   | ~20-30K     |
| WASM build         | fails  | should work |

## Non-Negotiables

1. Path data sub-grammar (full SVG path EBNF)
2. Language injections (CSS, JS, HTML via foreignObject queries)
3. Tag-name matching stack (start/end pairing)
4. Content model awareness (scanner-level)

## Resolved Questions

- **foreignObject HTML injection:** Query-only. foreignObject is parsed as a
  generic `element`; HTML injection is handled via tag-name predicates in
  `injections.scm` (e.g. `#match? @_start "(^|:)foreignObject$"`). No dedicated
  element type needed — the generic element + generic_attribute for xmlns is
  sufficient (confirmed by corpus test "ForeignObject with nested HTML-like
  content" in edge_cases.txt).
- **ARIA attributes:** Generic. ARIA attributes are keyword-only values with no
  meaningful sub-grammar; they parse as `generic_attribute` with
  `attribute_name` + `quoted_attribute_value`. No `aria_attribute` rule needed.
- **xmlns/namespace handling:** Stays in `svg_root` only. The `xmlns` attribute
  appears as a `generic_attribute` on any element but is only semantically
  meaningful on `svg_root_element`. No special rule needed.
- **Typed attribute set:** 14 grammar rules (finalized during implementation).
  See list above. Design originally estimated ~18; implementation consolidated
  fill/stroke → `paint_attribute`, x/y/width/height → `length_attribute`, and
  added `functional_iri_attribute` for `url(#ref)` parsing.
