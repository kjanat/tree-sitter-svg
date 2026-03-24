; SVG textobjects for Helix.
; Keep this intentionally minimal until we add a reliable notion of
; entry.inside for mixed-content XML elements.

(svg_root_element) @entry.around
(element) @entry.around
(self_closing_tag) @entry.around

(attribute) @parameter.around
(attribute
  (_ value: (_) @parameter.inside))

; `@comment.around` captures the full XML comment (with `<!--`/`-->` delimiters),
; while `@comment.inside` captures only the inner `comment_text` child.
(comment) @comment.around
(comment text: (comment_text) @comment.inside)
