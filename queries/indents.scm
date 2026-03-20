; Tag-level @indent captures intentionally duplicate the element-level captures
; below (lines 10-16). Editors like Zed query tag-level positions directly for
; indentation rather than walking to the parent element node.
(start_tag ">" @end) @indent
(svg_root_start_tag ">" @end) @indent
(self_closing_tag "/>" @end) @indent
(svg_root_self_closing_tag "/>" @end) @indent

(element
  (start_tag) @start
  (end_tag)? @end) @indent

(svg_root_element
  (svg_root_start_tag) @start
  (svg_root_end_tag)? @end) @indent
