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
