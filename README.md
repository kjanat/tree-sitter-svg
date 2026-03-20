# tree-sitter-svg

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for
**SVG** (Scalable Vector Graphics), built against the
[SVG2 specification](https://www.w3.org/TR/SVG2/).

## Features

Most XML parsers treat SVG as generic markup. This grammar understands SVG
semantics:

- **Content model enforcement** — the parser distinguishes SVG element
  categories and validates which children are allowed where, via a custom
  external scanner
- **Structured path data** — the `d` attribute is parsed into commands,
  coordinates, arc/sweep flags, and separators
- **Typed attributes** — presentation attributes, event handlers, `style`,
  `viewBox`, `xmlns`, and more get dedicated node types
- **Language injections** — CSS in `<style>` and `style=`, JavaScript in
  `<script>` and event handlers, HTML in `<foreignObject>`
- **Query files** — `highlights.scm`, `injections.scm`, `locals.scm`,
  `tags.scm`

### Element Categories

| Category             | Examples                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| Root                 | `<svg>`                                                                  |
| Shapes               | `<rect>`, `<circle>`, `<ellipse>`, `<line>`, `<polygon>`, `<polyline>`   |
| Path                 | `<path>`                                                                 |
| Container/structural | `<g>`, `<defs>`, `<clipPath>`, `<symbol>`, `<use>`                       |
| Gradients            | `<linearGradient>`, `<radialGradient>`, `<stop>`                         |
| Filters              | `<filter>`, `<feGaussianBlur>`, `<feColorMatrix>`, `<feTurbulence>`, ... |
| Text                 | `<text>`, `<tspan>`, `<textPath>`                                        |
| Descriptive          | `<title>`, `<desc>`, `<metadata>`                                        |
| Linking/media        | `<a>`, `<image>`, `<foreignObject>`                                      |
| Animation            | `<animate>`, `<animateTransform>`, `<set>`, ...                          |
| Script/style         | `<script>`, `<style>`                                                    |

### Language Injections

| Context                          | Injected Language |
| -------------------------------- | ----------------- |
| `<style>` element content        | CSS               |
| `<style>` CDATA content          | CSS               |
| `style` attribute value          | CSS               |
| `<script>` element content       | JavaScript        |
| `<script>` CDATA content         | JavaScript        |
| Event handler attribute values   | JavaScript        |
| `<foreignObject>` child elements | HTML              |

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

```c
#include <tree_sitter/tree-sitter-svg.h>

const TSLanguage *lang = tree_sitter_svg();
```

## Development

### Prerequisites

- [Tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/creating-parsers/tool-overview.html)
- Node.js 22+ (grammar generation, Node binding tests)
- C compiler (parser + external scanner)

### Commands

```sh
tree-sitter generate          # regenerate src/parser.c from grammar.js
tree-sitter test              # run test/corpus/ tests
npm test                      # Node binding tests
npm start                     # build WASM + open playground
```

### Project Structure

```
grammar.js                    # grammar definition (source of truth)
src/
  scanner.c                   # external scanner — tag matching, content models
  parser.c                    # generated (do not edit)
queries/
  highlights.scm              # syntax highlighting
  injections.scm              # CSS/JS/HTML injection
  locals.scm                  # scope tracking
  tags.scm                    # symbol navigation
bindings/                     # C, Go, Java, Node, Python, Rust, Swift, Zig
test/corpus/                  # tree-sitter corpus tests
```

### Contributing

1. Edit `grammar.js` (and `src/scanner.c` for tag/content model changes)
2. Run `tree-sitter generate && tree-sitter test`
3. Add or update corpus tests in `test/corpus/`
4. Open a pull request

## Spec Compliance

Built against SVG2 with reference to the SVG 1.1 DTD for element
categorization. See [SPEC_AUDIT.md](SPEC_AUDIT.md) for evidence-to-implementation
traceability.

## License

[MIT](LICENSE) &copy; Kaj Kowalski
