# Grammar Refactor: Structural Tiers — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor grammar from 458 rules / 50 externals to ~120 rules / 13 externals so parser.c builds as WASM while preserving path data, injections, tag matching, and content model awareness.

**Architecture:** Collapse 24 element categories to 5 (svg_root, script, style, path, generic). Collapse 138 typed attributes to ~18 that have actual value sub-grammars. Push SVG vocabulary awareness from grammar rules into query files and scanner-level validation.

**Tech Stack:** Tree-sitter (grammar.js + scanner.c), S-expression queries (.scm), C external scanner

---

## Task 1: Create refactor branch and baseline

**Files:**

- None modified yet

**Step 1: Create feature branch**

```bash
git checkout -b refactor/structural-tiers
```

**Step 2: Record current parser.c size as baseline**

```bash
wc -l src/parser.c
```

Expected: ~102208 lines

**Step 3: Run existing tests to confirm green baseline**

```bash
tree-sitter generate && tree-sitter test
```

Expected: All 154 tests pass

**Step 4: Commit baseline (empty commit with intent)**

```bash
git commit --allow-empty -m "refactor: begin grammar structural-tiers refactor"
```

---

## Task 2: Rewrite external scanner (src/scanner.c)

**Files:**

- Modify: `src/scanner.c`

**Step 1: Write the new scanner**

Reduce `enum TokenType` from 60 to 14 entries:

```c
enum TokenType {
  START_TAG_NAME,
  SVG_START_TAG_NAME,
  PATH_START_TAG_NAME,
  SCRIPT_START_TAG_NAME,
  STYLE_START_TAG_NAME,
  END_TAG_NAME,
  SVG_END_TAG_NAME,
  PATH_END_TAG_NAME,
  SCRIPT_END_TAG_NAME,
  STYLE_END_TAG_NAME,
  ERRONEOUS_END_TAG_NAME,
  RAW_TEXT,
  SELF_CLOSING_TAG_DELIMITER,
};
```

Keep: `scan_tag_name`, `local_name_eq`, `local_name_start`, `string_eq`, all `is_*_name()` predicates (for future content model use), `TagStack`, serialize/deserialize.

Simplify `scan_start_tag_name` to only classify 4 named categories + generic fallback:

```c
if (is_svg_name(&name) && valid_symbols[SVG_START_TAG_NAME]) {
  symbol = SVG_START_TAG_NAME;
} else if (is_path_name(&name) && valid_symbols[PATH_START_TAG_NAME]) {
  symbol = PATH_START_TAG_NAME;
} else if (is_script_name(&name) && valid_symbols[SCRIPT_START_TAG_NAME]) {
  symbol = SCRIPT_START_TAG_NAME;
} else if (is_style_name(&name) && valid_symbols[STYLE_START_TAG_NAME]) {
  symbol = STYLE_START_TAG_NAME;
} else if (valid_symbols[START_TAG_NAME]) {
  symbol = START_TAG_NAME;
}
```

Same pattern for `scan_end_tag_name`.

Add `scan_raw_text` function for script/style content:

```c
static bool scan_raw_text(TagStack *tags, TSLexer *lexer) {
  // Consume everything until we see `</` followed by the tag name
  // on top of the stack (script or style).
  // This captures raw text content for injection queries.
  // Reference: tree-sitter-html's raw_text scanner pattern.
}
```

Simplify `any_start_valid` and `any_end_valid` checks to only check the 5 start and 5 end tokens.

Add RAW_TEXT dispatch in the main `scan` function.

**Step 2: Verify scanner compiles**

```bash
cc -c -I src -std=c11 src/scanner.c -o /dev/null
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/scanner.c
git commit -m "refactor(scanner): reduce to 5 element categories + raw_text"
```

---

## Task 3: Rewrite grammar.js — externals and element structure

**Files:**

- Modify: `grammar.js`

This is the largest task. Rewrite the grammar in stages within this single task.

**Step 1: Replace externals array**

From 50 entries to 13:

```js
externals: $ => [
  $._start_tag_name,
  $._svg_start_tag_name,
  $._path_start_tag_name,
  $._script_start_tag_name,
  $._style_start_tag_name,
  $._end_tag_name,
  $._svg_end_tag_name,
  $._path_end_tag_name,
  $._script_end_tag_name,
  $._style_end_tag_name,
  $._erroneous_end_tag_name,
  $._raw_text,
  '/>',
],
```

**Step 2: Rewrite element rules**

Replace the 24-branch `element` choice with:

```js
element: $ =>
  choice(
    $._script_element,
    $._style_element,
    $._path_element,
    $.self_closing_tag,
    seq($.start_tag, repeat($._content), choice($.end_tag, $.erroneous_end_tag)),
  ),
```

Keep `svg_root_element` mostly as-is (it's the document root, already a separate rule).

**Step 3: Rewrite script_element and style_element**

These need `_raw_text` capture for language injections:

```js
_script_element: $ =>
  choice(
    alias($.script_self_closing_tag, $.self_closing_tag),
    seq(
      alias($.script_start_tag, $.start_tag),
      optional(alias($._raw_text, $.raw_text)),
      choice(alias($.script_end_tag, $.end_tag), $.erroneous_end_tag),
    ),
  ),

// script_start_tag uses _script_start_tag_name
// script_end_tag uses _script_end_tag_name
// Same pattern for style_element
```

**Step 4: Keep path_element with d attribute context**

```js
_path_element: $ =>
  choice(
    alias($.path_self_closing_tag, $.self_closing_tag),
    seq(
      alias($.path_start_tag, $.start_tag),
      repeat($._content),
      choice(alias($.path_end_tag, $.end_tag), $.erroneous_end_tag),
    ),
  ),

// path_start_tag accepts path_attribute (which includes d_attribute with sub-grammar)
// plus generic attributes
```

**Step 5: Flatten start_tag, end_tag, self_closing_tag**

One generic version of each, no per-element-category variants except the 4 special ones:

```js
start_tag: $ =>
  seq(
    '<',
    field('name', alias($._start_tag_name, $.name)),
    repeat($.attribute),
    optional($._s),
    '>',
  ),

end_tag: $ =>
  seq(
    '</',
    field('name', alias($._end_tag_name, $.name)),
    optional($._s),
    '>',
  ),

self_closing_tag: $ =>
  seq(
    '<',
    field('name', alias($._start_tag_name, $.name)),
    repeat($.attribute),
    optional($._s),
    '/>',
  ),
```

**Step 6: Delete all removed element rules**

Remove: `_shape_element`, `_clip_path_element`, `_defs_element`, `_gradient_element`,
`_gradient_stop_element`, `_filter_element`, `_filter_primitive_core_element`,
`_filter_color_matrix_element`, `_filter_turbulence_element`,
`_filter_component_transfer_element`, `_filter_component_transfer_function_element`,
`_filter_merge_element`, `_filter_merge_node_element`, `_filter_lighting_element`,
`_filter_light_source_element`, `_text_container_element`, `_linking_media_element`,
`_animation_element`, `_descriptive_element`.

Also remove all their associated `*_start_tag`, `*_end_tag`, `*_self_closing_tag`,
`*_content` rules.

**Step 7: Verify generation**

```bash
tree-sitter generate
```

Expected: Generates successfully (tests will fail — tree shape changed)

**Step 8: Commit**

```bash
git add grammar.js
git commit -m "refactor(grammar): collapse elements to 5 types"
```

---

## Task 4: Rewrite grammar.js — attribute system

**Files:**

- Modify: `grammar.js`

**Step 1: Simplify the attribute rule**

Replace the 34-branch `_typed_attribute` choice with the kept set:

```js
attribute: $ =>
  choice(
    // Typed: value has grammar structure
    $.d_attribute,
    $.viewbox_attribute,
    $.transform_attribute,
    $.points_attribute,
    $.preserve_aspect_ratio_attribute,
    $.style_attribute,
    $.paint_attribute,        // fill, stroke
    $.functional_iri_attribute, // url(#...) references
    $.opacity_attribute,
    $.length_attribute,       // width, height, x, y, r, rx, ry, cx, cy, etc.
    $.href_attribute,
    $.id_attribute,
    $.class_attribute,
    $.event_attribute,
    // Generic fallback
    $.generic_attribute,
  ),
```

Note: `length_attribute` is kept because it parses values as `length_or_percentage`
with `number + optional(unit)` structure. `paint_attribute` covers fill/stroke and
parses `none | currentColor | url(#id) | <color>`. Keep `functional_iri_attribute`
for `url(#ref)` parsing used by locals.scm.

**Step 2: Delete removed attribute rules**

Remove all specialized attribute rules not in the kept set. This includes:

- All per-element attribute lists (`filter_color_matrix_attribute`, `script_attribute`, `style_element_attribute`, `linking_media_element_attribute`, etc.)
- All simple enum/keyword attributes (`fill_rule_attribute`, `stroke_linecap_attribute`, `stroke_linejoin_attribute`, `display_attribute`, `visibility_attribute`, `overflow_attribute`, `pointer_events_attribute`, `shape_rendering_attribute`, `text_rendering_attribute`, `color_rendering_attribute`, `vector_effect_attribute`, etc.)
- All text/font attributes (`font_family_attribute`, `font_style_attribute`, `font_weight_attribute`, `text_anchor_attribute`, `text_decoration_attribute`, `unicode_bidi_attribute`, `writing_mode_attribute`, etc.)
- All animation attributes (`begin_attribute`, `end_attribute`, `dur_attribute`, `calc_mode_attribute`, etc.)
- All filter-specific attributes (`filter_color_matrix_type_attribute`, `filter_turbulence_type_attribute`, etc.)
- All ARIA attributes (make generic)
- All remaining coord/layout attributes not covered by `length_attribute`

**Step 3: Simplify start tags to use unified attribute**

All start tags (generic, svg_root, script, style, path) now use `repeat($.attribute)`.
Path start tag additionally accepts `$.d_attribute` within the same attribute set
(the `d_attribute` is already in the attribute choice).

**Step 4: Delete associated value/name sub-rules for removed attributes**

Each deleted attribute typically has `*_attribute_name` and `*_attribute_value` rules.
Delete those too. Also delete any keyword rules only used by deleted attributes.

**Step 5: Verify generation**

```bash
tree-sitter generate
```

Expected: Success

**Step 6: Check parser.c size**

```bash
wc -l src/parser.c
```

Expected: Significant reduction (target: <30K lines)

**Step 7: Commit**

```bash
git add grammar.js
git commit -m "refactor(grammar): collapse attributes to ~15 typed + generic"
```

---

## Task 5: Rewrite test corpus

**Files:**

- Modify: `test/corpus/document.txt`
- Modify: `test/corpus/errors.txt`
- Modify: `test/corpus/long_tail_attributes.txt`
- Modify: `test/corpus/misc_nodes.txt`
- Modify: `test/corpus/path_grammar.txt`
- Modify: `test/corpus/svg_features.txt`
- Modify: `test/corpus/typed_attributes.txt`

**Step 1: Update expected trees for new node structure**

Key changes in expected trees:

- No more `text_container_content`, `path_content`, etc. — all become `_content`
- No more per-element-category tag types (e.g. `shape_start_tag` → `start_tag`)
- Removed typed attributes become `generic_attribute` with `attribute_name` + `quoted_attribute_value`
- Kept typed attributes retain their structure (`viewbox_attribute`, `transform_attribute`, etc.)
- `script_element` and `style_element` get `raw_text` node for content

Strategy: Use `tree-sitter test -u` to auto-update expected trees after grammar
changes, then manually review each updated test to ensure correctness.

**Step 2: Run auto-update**

```bash
tree-sitter test -u
```

Review each updated test file. Any test that shows ERROR or MISSING nodes needs
manual correction — either the grammar needs fixing or the test input needs adjusting.

**Step 3: Manually fix tests that can't auto-update**

Tests with `:error` sections may need manual adjustment if error recovery behavior changed.

**Step 4: Run full test suite**

```bash
tree-sitter test
```

Expected: All tests pass

**Step 5: Commit**

```bash
git add test/corpus/
git commit -m "test: update corpus for structural-tiers grammar"
```

---

## Task 6: Rewrite query files

**Files:**

- Modify: `queries/highlights.scm`
- Modify: `queries/injections.scm`
- Modify: `queries/locals.scm`
- Modify: `queries/tags.scm`

**Step 1: Rewrite highlights.scm**

```scheme
; XML declaration and doctype
(xml_declaration) @keyword
(doctype) @keyword

(xml_version_attribute_name) @attribute
(xml_encoding_attribute_name) @attribute
(xml_standalone_attribute_name) @attribute
(xml_standalone_attribute_value) @boolean

(comment) @comment
(cdata_section) @markup.raw
(entity_reference) @string.escape

(processing_instruction
  (name) @keyword)

; Tag names — covers all element types
(start_tag
  (name) @tag)

(svg_root_start_tag
  (name) @tag)

(end_tag
  (name) @tag)

(svg_root_end_tag
  (name) @tag)

(self_closing_tag
  (name) @tag)

(svg_root_self_closing_tag
  (name) @tag)

; Attribute names and values
(attribute_name) @attribute

(quoted_attribute_value) @string
(style_text_double) @string
(style_text_single) @string

; Path data
(path_command) @keyword
(path_number) @number
(path_arc_flag) @boolean
(path_sweep_flag) @boolean
(path_comma) @punctuation.delimiter

; Delimiters
[
  "<?"
  "?>"
  "<"
  ">"
  "</"
  "/>"
  "="
] @punctuation.delimiter
```

**Step 2: Rewrite injections.scm**

Script and style injections now use `raw_text` from the dedicated element types.
Event attributes and style attributes stay typed so their injections work.
foreignObject HTML injection uses generic element with tag_name predicate.

```scheme
; CSS in <style> element (via raw_text)
((element
  (start_tag (name) @_start)
  (raw_text) @injection.content
  (end_tag (name) @_end))
 (#match? @_start "(^|:)style$")
 (#match? @_end "(^|:)style$")
 (#set! injection.language "css"))

; JS in <script> element (via raw_text)
((element
  (start_tag (name) @_start)
  (raw_text) @injection.content
  (end_tag (name) @_end))
 (#match? @_start "(^|:)script$")
 (#match? @_end "(^|:)script$")
 (#set! injection.language "javascript"))

; HTML in <foreignObject>
((element
  (start_tag (name) @_start)
  (element) @injection.content
  (end_tag (name) @_end))
 (#match? @_start "(^|:)foreignObject$")
 (#match? @_end "(^|:)foreignObject$")
 (#set! injection.language "html")
 (#set! injection.include-children))

; CSS in style="..." attribute
((style_attribute
  (style_attribute_value
    (double_quoted_style_value
      (style_text_double) @injection.content)))
 (#set! injection.language "css"))

((style_attribute
  (style_attribute_value
    (single_quoted_style_value
      (style_text_single) @injection.content)))
 (#set! injection.language "css"))

; JS in event attributes (onclick, onload, etc.)
((event_attribute
  (event_attribute_value
    (script_text_double) @injection.content))
 (#set! injection.language "javascript"))

((event_attribute
  (event_attribute_value
    (script_text_single) @injection.content))
 (#set! injection.language "javascript"))

; CSS in generic style="..." (fallback for when style parsed as generic_attribute)
((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_double) @injection.content))
 (#match? @_name "(^|:)style$")
 (#set! injection.language "css"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_single) @injection.content))
 (#match? @_name "(^|:)style$")
 (#set! injection.language "css"))
```

Note: The exact injection query patterns for script/style depend on whether
those elements alias their start/end tags to `start_tag`/`end_tag` or keep
distinct names. Adjust based on actual tree output after grammar rewrite.

**Step 3: Rewrite locals.scm**

```scheme
(element) @local.scope
(svg_root_element) @local.scope

; id attribute defines scope
((id_attribute
  value: (id_attribute_value
    (id_token) @local.definition)))

; Generic id="..." fallback
((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_double) @local.definition))
 (#eq? @_name "id"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_single) @local.definition))
 (#eq? @_name "id"))

; href references
((href_attribute
  value: (href_attribute_value
    (href_reference
      (iri_reference) @local.reference)))
 (#match? @local.reference "^#")
 (#strip! @local.reference "^#"))

; functional IRI references (url(#id))
((functional_iri_attribute
  value: (functional_iri_attribute_value
    (iri_reference) @local.reference))
 (#match? @local.reference "^#")
 (#strip! @local.reference "^#"))

((functional_iri_attribute
  value: (functional_iri_attribute_value
    (paint_server
      (iri_reference) @local.reference)))
 (#match? @local.reference "^#")
 (#strip! @local.reference "^#"))

; Generic href/xlink:href fallback
((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_double) @local.reference))
 (#any-of? @_name "href" "xlink:href")
 (#match? @local.reference "^#")
 (#strip! @local.reference "^#"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_single) @local.reference))
 (#any-of? @_name "href" "xlink:href")
 (#match? @local.reference "^#")
 (#strip! @local.reference "^#"))
```

**Step 4: Rewrite tags.scm**

```scheme
(element
  (start_tag
    (name) @name) @definition.element)

(self_closing_tag
  (name) @name) @definition.element

(svg_root_element
  (svg_root_start_tag
    (name) @name) @definition.element)

(svg_root_self_closing_tag
  (name) @name) @definition.element

; id definitions
((id_attribute
  value: (id_attribute_value
    (id_token) @name)) @definition.id)

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_double) @name)) @definition.id
 (#eq? @_name "id"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_single) @name)) @definition.id
 (#eq? @_name "id"))

; href references
((href_attribute
  value: (href_attribute_value
    (href_reference
      (iri_reference) @name))) @reference.id
 (#match? @name "^#")
 (#strip! @name "^#"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_double) @name)) @reference.id
 (#any-of? @_name "href" "xlink:href")
 (#match? @name "^#")
 (#strip! @name "^#"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_single) @name)) @reference.id
 (#any-of? @_name "href" "xlink:href")
 (#match? @name "^#")
 (#strip! @name "^#"))

((functional_iri_attribute
  value: (functional_iri_attribute_value
    (iri_reference) @name)) @reference.id
 (#match? @name "^#")
 (#strip! @name "^#"))

((functional_iri_attribute
  value: (functional_iri_attribute_value
    (paint_server
      (iri_reference) @name))) @reference.id
 (#match? @name "^#")
 (#strip! @name "^#"))
```

**Step 5: Verify queries against new grammar**

```bash
tree-sitter generate && tree-sitter test
```

Expected: All tests pass

**Step 6: Commit**

```bash
git add queries/
git commit -m "refactor(queries): adapt to structural-tiers grammar"
```

---

## Task 7: Verify WASM build and parser size

**Files:**

- None modified

**Step 1: Check parser.c size**

```bash
wc -l src/parser.c
```

Expected: <30K lines (target: ~20-30K, down from 102K)

**Step 2: Attempt WASM build**

```bash
tree-sitter build --wasm
```

Expected: Completes successfully (this is the whole point)

**Step 3: Run full test suite one more time**

```bash
tree-sitter test
```

Expected: All tests pass

**Step 4: Run native build**

```bash
make clean && make
```

Expected: Compiles successfully

**Step 5: Commit any generated files**

```bash
git add src/parser.c src/node-types.json src/grammar.json
git commit -m "chore: regenerate parser for structural-tiers grammar"
```

---

## Task 8: Update documentation

**Files:**

- Modify: `README.md`
- Modify: `DISCOVERIES.md`
- Modify: `AGENTS.md`

**Step 1: Update README.md**

Update the feature list, node type descriptions, and any examples that reference
old node types. Remove references to per-element categories. Document the new
generic `element` + query-based approach.

**Step 2: Update DISCOVERIES.md**

Add entry about grammar-shape problem and the structural-tiers solution.
Remove or mark obsolete any discoveries about per-element specialization.

**Step 3: Update AGENTS.md**

Adjust guidance for the new grammar architecture.

**Step 4: Commit**

```bash
git add README.md DISCOVERIES.md AGENTS.md
git commit -m "docs: update for structural-tiers grammar"
```

---

## Task 9: Final verification and cleanup

**Files:**

- None (verification only)

**Step 1: Full verification suite**

```bash
tree-sitter generate && tree-sitter test && tree-sitter build --wasm && make clean && make
```

Expected: All pass

**Step 2: Test WASM playground**

```bash
npm start
```

Expected: Playground opens with working parser (this previously failed)

**Step 3: Run binding tests**

```bash
npm test
```

Expected: Node binding tests pass

**Step 4: Review final stats**

```bash
echo "=== parser.c ===" && wc -l src/parser.c
echo "=== node-types ===" && python3 -c "import json; d=json.load(open('src/node-types.json')); print(f'{len(d)} named types')"
echo "=== grammar rules ===" && grep -c '^\s\+\w\+:' grammar.js
```

---

## Summary: Key decision points during implementation

1. **Scanner raw_text**: Model after tree-sitter-html's approach — consume until
   `</` + matching tag name. If the html scanner source is available in
   node_modules or online, reference it directly.

2. **Path element attribute context**: The `path_start_tag` must include
   `d_attribute` in its attribute list. Other attributes use the generic set.

3. **Injection query patterns**: After rewriting, test injections manually with
   a sample SVG containing `<style>`, `<script>`, event attributes, and
   `<foreignObject>`. The exact query patterns depend on whether aliases
   produce `start_tag` or distinct node names in the tree.

4. **Test auto-update**: `tree-sitter test -u` won't update `:error` sections
   or tests with ERROR/MISSING nodes. Those need manual fixing.

5. **Content model enforcement**: Deferred to a follow-up task. The scanner
   keeps `is_*_name()` predicates but doesn't actively validate nesting in
   this refactor. Add validation after the WASM build succeeds.
