# Discoveries

## Build & Tooling

- External scanner enum order must exactly match `externals` order in `grammar.js`; mismatches silently corrupt tokenization
- For simple external tokens (tag names, `/>`), avoid `mark_end` unless doing lookahead rollback; premature `mark_end` can truncate tokens
- `tree-sitter build --wasm` can look stuck at `Extracting wasi-sdk...`, but for this grammar the real stall is later in wasm backend codegen for `src/parser.c`; syntax-only and LLVM IR emission finish quickly, object/wasm emission does not
- WASM build fails when parser.c exceeds ~100K lines; at 102K lines (458 rules, 50 externals) the WASM backend cannot complete; at 21K lines (120 rules, 13 externals) it succeeds instantly
- Zed's extension builder uses wasi-sdk clang-19 to compile grammar WASM; 102K-line parser.c hung indefinitely (23GB RSS); 21K-line parser.c compiles in ~17s

## Grammar

- Keeping `extras` empty preserves XML whitespace as explicit `text` nodes (including indentation/newlines)
- Generic XML attributes should require quoted values; allowing valueless/unquoted attrs accepts non-XML SVG
- Tag-name matching needs an external scanner stack; CFG-only grammar cannot enforce `<a>...</a>` equality
- Using hidden pre/post-root rules keeps document-structure helpers out of the visible CST
- For context-specific attributes (e.g. `type` on `<script>`/`<style>`), avoid including `generic_attribute` in the same element-specific attribute list or strict typing is bypassed
- To enforce content models for selected elements, add name-specialized externals + hidden element subrules (e.g. `_path_element`) instead of broad generic children
- Category overlap in scanner name predicates is precedence-sensitive (e.g. if an element name belongs to two families, first matching branch wins)
- Tight `defs` content models surface omitted common definition elements quickly (e.g. `clipPath`); either add explicit families or expect recovery nodes
- Using `$.attribute` (typed + generic) on specialized container tags restores extension/custom attribute support without weakening the global XML quoting constraint
- Filter primitive conformance needs family-scoped tag tokens and rules (`feColorMatrix`, `feTurbulence`, `feComponentTransfer` + `feFunc*`, `feMerge` + `feMergeNode`, lighting + light-source) rather than one shared primitive bucket
- `text` content should include linking/media (`<a>`) to accept common inline link patterns (`<text><a><tspan>…`)

## Testing

- `:error` corpus sections are best for invalid syntax checks; for recovery-node checks without parser error state, keep normal sections with expected trees
- Add dedicated path-data corpus cases for implicit separators and arc-flag adjacency (e.g. `A... 01 ...`) to prevent regressions

## Bindings

- Bun cannot load Node-API `.node` addons via `import()`; use `require()` (or `process.dlopen`) for Bun-specific loading paths
- `bun test` works in this repo when expected prebuild paths exist; test bootstrap can create the missing `tree-sitter` runtime prebuild path under `node_modules/tree-sitter/prebuilds/<platform>-<arch>/`

## SVG Spec Gotchas

- SVG 2 `svg_path` grammar allows empty/whitespace-only `d` values; treat `d=""` and `d="   "` as valid parse cases
- `svg` root detection should accept namespaced forms like `svg:svg` by checking local-name segment after the last `:`

## Tree-sitter Quirks

- `<?xml` can be lexically stolen by generic `<?` processing-instruction rules; `token(prec(..., '<?xml'))` fixes declaration recognition
- `tree-sitter` v0.25.0 native addon fails to compile with newer Node/V8 toolchains in this repo setup; Node 22 LTS works — Volta pin set to 22.22.1
- Non-start grammar rules cannot match empty strings; wrap optional emptiness in parent rules instead of making the child nullable
- Overlapping whitespace tokens (e.g. `misc_text` vs path whitespace) can cause wrong token choice; assign precedence for context-specific whitespace tokens
- `tree-sitter test -u` will not update sections that still parse with `ERROR`/`MISSING`; fix grammar/input first, then rerun update
- If one rule is a strict superset of another (e.g. `length` includes bare numbers), avoid including both in the same `choice` without precedence; this creates unresolved LR conflicts
- Aliasing a named subrule to `$.element` inside the `element` rule can create nested `(element (element ...))`; use hidden subrules (`_foo_element`) to keep CST stable
- With many specialized externals, choose token symbol *after* scanning the full name against all valid symbols; pairwise ambiguity guards do not scale

## Architecture: Parse Structure Not Schema

- Encoding SVG element categories × attribute combinations in the grammar causes LR state explosion (458 rules → 102K-line parser.c); collapsing to 5 element types + 14 typed attributes → 120 rules, 21K-line parser.c (79% reduction)
- Content model constraints (e.g. "path cannot contain child elements") belong in linting/query layers, not the parser; grammar should accept structurally valid XML
- `raw_text` external token for script/style must guard against error recovery: when tree-sitter sets all `valid_symbols` true, check `!valid_symbols[START_TAG_NAME] && !valid_symbols[END_TAG_NAME]` to prevent raw_text from consuming normal content
- Only 5 element names need scanner recognition: svg (root enforcement), path (d attribute), script/style (raw text capture), plus generic fallback
- Attribute sub-grammars worth keeping in the parser are those with genuine value syntax (path data, viewBox numbers, transform functions, paint functions, URI references) — keyword-only attributes (calcMode, spreadMethod, edgeMode) belong in queries
