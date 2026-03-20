((element
  (start_tag (name) @_start)
  (text) @injection.content
  (end_tag (name) @_end))
 (#match? @_start "(^|:)style$")
 (#match? @_end "(^|:)style$")
 (#set! injection.language "css"))

((element
  (start_tag (name) @_start)
  (cdata_section (cdata_text) @injection.content)
  (end_tag (name) @_end))
 (#match? @_start "(^|:)style$")
 (#match? @_end "(^|:)style$")
 (#set! injection.language "css"))

((element
  (start_tag (name) @_start)
  (text) @injection.content
  (end_tag (name) @_end))
 (#match? @_start "(^|:)script$")
 (#match? @_end "(^|:)script$")
 (#set! injection.language "javascript"))

((element
  (start_tag (name) @_start)
  (cdata_section (cdata_text) @injection.content)
  (end_tag (name) @_end))
 (#match? @_start "(^|:)script$")
 (#match? @_end "(^|:)script$")
 (#set! injection.language "javascript"))

((element
  (start_tag (name) @_start)
  (element) @injection.content
  (end_tag (name) @_end))
 (#match? @_start "(^|:)foreignObject$")
 (#match? @_end "(^|:)foreignObject$")
 (#set! injection.language "html")
 (#set! injection.include-children))

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

((event_attribute
  (event_attribute_value
    (script_text_double) @injection.content))
 (#set! injection.language "javascript"))

((event_attribute
  (event_attribute_value
    (script_text_single) @injection.content))
 (#set! injection.language "javascript"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_double) @injection.content))
 (#match? @_name "(^|:)style$")
 (#set! injection.language "css"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_single) @injection.content))
 (#match? @_name "(^|:)style$")
 (#set! injection.language "css"))
