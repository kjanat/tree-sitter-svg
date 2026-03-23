; SVG textobjects for Helix.
; Keep this intentionally minimal until we add a reliable notion of
; entry.inside for mixed-content XML elements.

(svg_root_element) @entry.around
(element) @entry.around
(self_closing_tag) @entry.around

(attribute) @parameter.around
(generic_attribute value: (_) @parameter.inside)
(d_attribute value: (_) @parameter.inside)
(viewbox_attribute value: (_) @parameter.inside)
(preserve_aspect_ratio_attribute value: (_) @parameter.inside)
(transform_attribute value: (_) @parameter.inside)
(points_attribute value: (_) @parameter.inside)
(style_attribute value: (_) @parameter.inside)
(paint_attribute value: (_) @parameter.inside)
(functional_iri_attribute value: (_) @parameter.inside)
(opacity_attribute value: (_) @parameter.inside)
(length_attribute value: (_) @parameter.inside)
(href_attribute value: (_) @parameter.inside)
(id_attribute value: (_) @parameter.inside)
(class_attribute value: (_) @parameter.inside)
(event_attribute value: (_) @parameter.inside)

; The current grammar exposes `comment` as a leaf node (no inner comment-text
; child), so `@comment.inside` is a placeholder until a dedicated child exists.
(comment) @comment.around
(comment) @comment.inside
