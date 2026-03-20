# tree-sitter-svg

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)][LICENSE]

A [Tree-sitter] grammar for **SVG** (Scalable Vector Graphics), built against the [SVG2 specification].

[Tree-sitter]: https://tree-sitter.github.io/tree-sitter/
[SVG2 specification]: https://www.w3.org/TR/SVG2/

## What This Parser Does

Most XML parsers treat SVG as generic markup. This grammar understands SVG
semantics:

### Typed Elements and Content Models

The parser distinguishes SVG element categories and enforces which children are
valid where. An external scanner (`src/scanner.c`) handles tag name recognition
and matching at parse time.

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

### Structured Path Data

The `d` attribute on `<path>` elements is parsed into its constituent parts:

```text
d="M 10 20 L 30 40 A 5 5 0 0 1 50 60 Z"
   ├─────┤ ├─────┤ ├───────────────┤ │
   │       │       │               └─ closepath_segment
   │       │       └─ elliptical_arc_segment
   │       └─ lineto_segment                 command:  path_command (A)
   └─ moveto_segment                         radii:    path_coordinate × 2
       command: path_command (M)             rotation: path_rotation
       args:    path_coordinate_pair         flags:    path_arc_flag, path_sweep_flag
                ├── path_number (10)         target:   path_coordinate_pair
                └── path_number (20)
```

This enables queries and tools to operate on individual path segments rather
than treating `d` as an opaque string.

### Typed Attributes

Attributes are parsed into semantic categories rather than generic
name/value pairs:

- **Presentation attributes** — `fill`, `stroke`, `opacity`, `transform`, etc.
- **Event handlers** — `onclick`, `onload`, `onmouseover`, etc.
- **`style` attribute** — separated from generic attributes with its own node type
- **`viewBox`**, **`xmlns`**, **`preserveAspectRatio`** — dedicated parsing
- **XML declaration attributes** — `version`, `encoding`, `standalone`

### Language Injections

Embedded languages are injected via `queries/injections.scm`:

| Context                          | Injected Language |
| -------------------------------- | ----------------- |
| `<style>` element content        | CSS               |
| `<style>` CDATA content          | CSS               |
| `style` attribute value          | CSS               |
| `<script>` element content       | JavaScript        |
| `<script>` CDATA content         | JavaScript        |
| Event handler attribute values   | JavaScript        |
| `<foreignObject>` child elements | HTML              |

### Query Files

| File             | Purpose                        |
| ---------------- | ------------------------------ |
| `highlights.scm` | Syntax highlighting captures   |
| `injections.scm` | Language injection rules       |
| `locals.scm`     | Local scope/reference tracking |
| `tags.scm`       | Symbol/tag navigation          |

<!--## Installation

<details>
<summary><strong>Node.js</strong></summary>

```sh
npm install tree-sitter-svg tree-sitter
```

```js
const Parser = require('tree-sitter');
const SVG = require('tree-sitter-svg');

const parser = new Parser();
parser.setLanguage(SVG);

const tree = parser.parse(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M 10 80 C 40 10, 65 10, 95 80" stroke="black" fill="none"/>
</svg>
`);
console.log(tree.rootNode.toString());
```

</details>

<details>
<summary><strong>Rust</strong></summary>

```toml
[dependencies]
tree-sitter-svg = "0.1"
tree-sitter     = "0.26"
```

```rust
let mut parser = tree_sitter::Parser::new();
parser.set_language(&tree_sitter_svg::LANGUAGE.into()).unwrap();

let source = r#"<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="red"/>
</svg>"#;

let tree = parser.parse(source, None).unwrap();
println!("{}", tree.root_node().to_sexp());
```

</details>

<details>
<summary><strong>Python</strong></summary>

```sh
pip install tree-sitter-svg
```

```python
import tree_sitter_svg as ts_svg
from tree_sitter import Language, Parser

parser = Parser(Language(ts_svg.language()))

tree = parser.parse(b"""
<svg xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="10" width="80" height="80" fill="blue"/>
</svg>
""")
print(tree.root_node.sexp())
```

</details>

<details>
<summary><strong>Go</strong></summary>

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

	source := []byte(`<svg><rect width="10" height="10"/></svg>`)
	tree := parser.Parse(source, nil)
	defer tree.Close()
}
```

</details>

<details>
<summary><strong>Swift</strong></summary>

Add to `Package.swift`:

```swift
.package(url: "https://github.com/kjanat/tree-sitter-svg", from: "0.1.0")
```

</details>

<details>
<summary><strong>C/C++</strong></summary>

```sh
make && sudo make install
```

```c
#include <tree_sitter/tree-sitter-svg.h>

const TSLanguage *lang = tree_sitter_svg();
```

</details>

<details>
<summary><strong>Zig</strong></summary>

Add to `build.zig.zon` dependencies:

```zig
.@"tree-sitter-svg" = .{
    .url = "https://github.com/kjanat/tree-sitter-svg/archive/refs/heads/master.tar.gz",
},
```

</details>

<details>
<summary><strong>Java</strong></summary>

Via Maven (coordinates TBD — build from source for now):

```xml
<dependency>
	<groupId>io.github.tree-sitter</groupId>
	<artifactId>tree-sitter-svg</artifactId>
	<version>0.1.0</version>
</dependency>
```

</details>-->

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

```text
grammar.js                    # grammar definition (source of truth)
src/
  scanner.c                   # external scanner — tag matching, content models
  parser.c                    # generated (do not edit)
  node-types.json             # generated node type metadata
queries/
  highlights.scm              # syntax highlighting
  injections.scm              # CSS/JS/HTML injection
  locals.scm                  # scope tracking
  tags.scm                    # symbol navigation
bindings/
  c/                          # C header + pkg-config
  go/                         # Go binding + test
  java/                       # Java binding + test
  node/                       # Node.js binding + types + test
  python/                     # Python binding + test
  rust/                       # Rust binding + build script
  swift/                      # Swift binding + test
  zig/                        # Zig binding + test
test/corpus/                  # tree-sitter corpus tests
```

### Contributing

1. Edit `grammar.js` (and `src/scanner.c` for tag/content model changes)
2. Run `tree-sitter generate && tree-sitter test`
3. Add or update corpus tests in `test/corpus/`
4. Open a pull request

## Spec Compliance

This parser is built against the SVG2 specification with reference to the
SVG 1.1 DTD for element categorization.

## License

[MIT]([LICENSE]) © Kaj Kowalski

[LICENSE]: https://github.com/kjanat/tree-sitter-svg/blob/master/LICENSE

<!-- markdownlint-disable-file MD010 MD033 -->
