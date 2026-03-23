; SVG textobjects for Helix.
; Keep this intentionally minimal until we add a reliable notion of
; entry.inside for mixed-content XML elements.

(svg_root_element) @entry.around
(element) @entry.around
(self_closing_tag) @entry.around

(attribute) @parameter.around
(attribute
  (_ value: (_) @parameter.inside))

; The current grammar exposes `comment` as a leaf node (no inner comment-text
; child), so `@comment.inside` is a placeholder until a dedicated child exists.
(comment) @comment.around
(comment) @comment.inside
