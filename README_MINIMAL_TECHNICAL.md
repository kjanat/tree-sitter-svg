# tree-sitter-svg

SVG grammar for [Tree-sitter](https://tree-sitter.github.io/tree-sitter/).

Targets SVG2. Uses an external scanner (`src/scanner.c`) to enforce tag matching
and element content models. Parses path `d` data into structured commands.
Injects CSS into `<style>`/`style=`, JavaScript into `<script>`/event handlers,
HTML into `<foreignObject>`.

## Bindings

C, Go, Java, Node, Python, Rust, Swift, Zig.

| Runtime | Install                                          |
| ------- | ------------------------------------------------ |
| Node    | `npm install tree-sitter-svg tree-sitter`        |
| Rust    | `cargo add tree-sitter-svg`                      |
| Python  | `pip install tree-sitter-svg`                    |
| Go      | `go get github.com/kjanat/tree-sitter-svg`       |
| Swift   | SPM: `https://github.com/kjanat/tree-sitter-svg` |
| C       | `make && sudo make install`                      |

## Develop

```sh
tree-sitter generate   # regen parser from grammar.js
tree-sitter test       # corpus tests
npm test               # node binding tests
npm start              # wasm playground
```

## Layout

- `grammar.js` — grammar definition
- `src/scanner.c` — external scanner (tag matching, content models)
- `queries/` — highlights, injections, locals, tags
- `test/corpus/` — corpus tests
- `bindings/` — per-language bindings

## License

MIT
