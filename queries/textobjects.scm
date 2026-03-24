; SVG textobjects for Helix.
; Keep this intentionally minimal until we add a reliable notion of
; entry.inside for mixed-content XML elements.

(svg_root_element) @entry.around
(element) @entry.around
(self_closing_tag) @entry.around

(attribute) @parameter.around
(attribute
  (_ value: (_) @parameter.inside))

; The current grammar exposes `comment` as a leaf node (no inner `comment_text`
; child), so `@comment.around` and `@comment.inside` intentionally capture the
; same node. When `comment_text` exists, move `@comment.inside` to that child so
; `@comment.around` keeps delimiters and `@comment.inside` excludes them.
(comment) @comment.around
(comment) @comment.inside
