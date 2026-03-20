# Discoveries

## Build & Tooling

- External scanner enum order must exactly match `externals` order in `grammar.js`; mismatches silently corrupt tokenization
- For simple external tokens (tag names, `/>`), avoid `mark_end` unless doing lookahead rollback; premature `mark_end` can truncate tokens

## Grammar

- Keeping `extras` empty preserves XML whitespace as explicit `text` nodes (including indentation/newlines)
- Generic XML attributes should require quoted values; allowing valueless/unquoted attrs accepts non-XML SVG
- Tag-name matching needs an external scanner stack; CFG-only grammar cannot enforce `<a>...</a>` equality
- Using hidden pre/post-root rules keeps document-structure helpers out of the visible CST

## Testing

- `:error` corpus sections are best for invalid syntax checks; for recovery-node checks without parser error state, keep normal sections with expected trees
- Add dedicated path-data corpus cases for implicit separators and arc-flag adjacency (e.g. `A... 01 ...`) to prevent regressions

## Bindings

- `bun test` cannot load native Node `.node` addons (`tree-sitter` package); use `npm test` (`node --test`) instead

## SVG Spec Gotchas

## Tree-sitter Quirks

- `<?xml` can be lexically stolen by generic `<?` processing-instruction rules; `token(prec(..., '<?xml'))` fixes declaration recognition
- `tree-sitter` v0.25.0 native addon fails to compile with newer Node/V8 toolchains in this repo setup; Node 22 LTS works — Volta pin set to 22.22.1
