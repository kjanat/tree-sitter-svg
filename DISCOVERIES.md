# Discoveries

## Build & Tooling

## Grammar

- Keeping `extras` empty preserves XML whitespace as explicit `text` nodes (including indentation/newlines)

## Testing

## Bindings

- `bun test` cannot load native Node `.node` addons (`tree-sitter` package); use `npm test` (`node --test`) instead

## SVG Spec Gotchas

## Tree-sitter Quirks

- `tree-sitter` v0.25.0 native addon fails to compile with Node 25 (V8 headers require C++20); Node 22 LTS works — Volta pin set to 22.22.1
