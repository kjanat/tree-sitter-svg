# tree-sitter-svg

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

SVG grammar for [Tree-sitter](https://tree-sitter.github.io/tree-sitter/).

Parses SVG documents with full awareness of the SVG2 spec — typed attributes,
structured path data, content model enforcement, and language injections for
embedded CSS, JavaScript, and HTML.

## Features

- **SVG2-aware parsing** — enforces element content models (`<defs>`,
  `<filter>`, `<text>`, etc.) and validates tag matching via a custom external
  scanner
- **Structured path data** — parses `d` attribute contents into commands,
  coordinates, arc flags, and separators
- **Typed attributes** — presentation attributes, event handlers, `style`,
  `viewBox`, `xmlns`, and more get dedicated node types
- **Language injections** — CSS in `<style>` elements and `style` attributes,
  JavaScript in `<script>` elements and event handlers, HTML in
  `<foreignObject>`
- **Query files** — `highlights.scm`, `injections.scm`, `locals.scm`,
  `tags.scm`

## Installation

### Node.js

```sh
npm install tree-sitter-svg tree-sitter
```

```js
const Parser = require('tree-sitter');
const SVG = require('tree-sitter-svg');

const parser = new Parser();
parser.setLanguage(SVG);

const tree = parser.parse('<svg><rect width="100" height="100"/></svg>');
console.log(tree.rootNode.toString());
```

### Rust

```toml
# Cargo.toml
[dependencies]
tree-sitter-svg = "0.1"
tree-sitter     = "0.26"
```

```rust
let mut parser = tree_sitter::Parser::new();
parser.set_language(&tree_sitter_svg::LANGUAGE.into()).unwrap();

let tree = parser.parse(r#"<svg><circle cx="50" cy="50" r="40"/></svg>"#, None).unwrap();
println!("{}", tree.root_node().to_sexp());
```

### Python

```sh
pip install tree-sitter-svg
```

```python
import tree_sitter_svg as ts_svg
from tree_sitter import Language, Parser

parser = Parser(Language(ts_svg.language()))
tree = parser.parse(b'<svg><line x1="0" y1="0" x2="100" y2="100"/></svg>')
print(tree.root_node.sexp())
```

### Go

```sh
go get github.com/kjanat/tree-sitter-svg
```

```go
package main

import (
	ts_svg "github.com/kjanat/tree-sitter-svg/bindings/go"
	ts "github.com/tree-sitter/go-tree-sitter"
)

func main() {
	parser := ts.NewParser()
	defer parser.Close()
	parser.SetLanguage(ts.NewLanguage(ts_svg.Language()))

	tree := parser.Parse([]byte(`<svg><rect width="10" height="10"/></svg>`), nil)
	defer tree.Close()
}
```

### Swift

```swift
// Package.swift
.package(url: "https://github.com/kjanat/tree-sitter-svg", from: "0.1.0")
```

### Zig

```zig
// build.zig.zon
.dependencies = .{
    .@"tree-sitter-svg" = .{
        .url = "https://github.com/kjanat/tree-sitter-svg/archive/refs/heads/master.tar.gz",
    },
},
```

### C/C++

```sh
make && sudo make install
```

This installs the shared library, headers, and pkg-config file.

## Editor Integration

Copy the `queries/` directory into your editor's queries path for SVG. For
Neovim with nvim-treesitter, place them under
`queries/svg/` in your runtime path.

## Development

### Prerequisites

- [Tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/creating-parsers/tool-overview.html) (`tree-sitter-cli`)
- Node.js 22+ (for grammar generation and Node binding tests)
- C compiler (for the parser and external scanner)

### Generate & Test

```sh
tree-sitter generate   # regenerate parser from grammar.js
tree-sitter test       # run corpus tests
```

### Playground

```sh
npm start              # builds WASM and opens the tree-sitter playground
```

### Node Binding Tests

```sh
npm test               # runs bindings/node/*_test.js
```

## Project Structure

```
grammar.js           # grammar definition (source of truth)
src/scanner.c        # external scanner for tag matching & content models
src/parser.c         # generated parser (do not edit)
queries/             # highlight, injection, locals, and tags queries
bindings/            # C, Go, Java, Node, Python, Rust, Swift, Zig
test/corpus/         # tree-sitter corpus tests
```

## Contributing

1. Edit `grammar.js` (and `src/scanner.c` if needed)
2. Run `tree-sitter generate && tree-sitter test`
3. Add corpus tests for new or changed behavior in `test/corpus/`
4. Open a pull request

## License

[MIT](LICENSE) &copy; Kaj Kowalski
