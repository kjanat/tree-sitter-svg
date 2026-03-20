((element
  (start_tag (name) @_start)
  (text) @injection.content
  (end_tag (name) @_end))
 (#eq? @_start "style")
 (#eq? @_end "style")
 (#set! injection.language "css"))

((element
  (start_tag (name) @_start)
  (text) @injection.content
  (end_tag (name) @_end))
 (#eq? @_start "script")
 (#eq? @_end "script")
 (#set! injection.language "javascript"))

((style_attribute
  (style_attribute_value
    (double_quoted_style_value
      (style_text_double) @injection.content)))
 (#set! injection.language "css"))

((style_attribute
  (style_attribute_value
    (single_quoted_style_value
      (style_text_single) @injection.content)))
 (#set! injection.language "css"))
