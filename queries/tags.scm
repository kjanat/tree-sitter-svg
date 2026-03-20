(element
  (start_tag
    (name) @name) @definition.element)

(self_closing_tag
  (name) @name) @definition.element

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_double) @name)) @definition.id
 (#eq? @_name "id"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_single) @name)) @definition.id
 (#eq? @_name "id"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_double) @name)) @reference.id
 (#any-of? @_name "href" "xlink:href")
 (#match? @name "^#")
 (#strip! @name "^#"))

((generic_attribute
  name: (attribute_name) @_name
  value: (quoted_attribute_value
    (attribute_text_single) @name)) @reference.id
 (#any-of? @_name "href" "xlink:href")
 (#match? @name "^#")
 (#strip! @name "^#"))
