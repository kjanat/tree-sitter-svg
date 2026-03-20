(element) @local.scope

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_double) @local.definition))
 (#eq? @_name "id"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_single) @local.definition))
 (#eq? @_name "id"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_double) @local.reference))
 (#any-of? @_name "href" "xlink:href")
 (#match? @local.reference "^#")
 (#strip! @local.reference "^#"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_single) @local.reference))
 (#any-of? @_name "href" "xlink:href")
 (#match? @local.reference "^#")
 (#strip! @local.reference "^#"))
