(element
  (start_tag
    (name) @name) @definition.element)

(self_closing_tag
  (name) @name) @definition.element

(svg_root_element
  (svg_root_start_tag
    (name) @name) @definition.element)

(svg_root_self_closing_tag
  (name) @name) @definition.element

; id definitions
((id_attribute
  value: (id_attribute_value
    (id_token) @name)) @definition.id)

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

; href references
((href_attribute
  value: (href_attribute_value
    (href_reference
      (iri_reference) @name))) @reference.id
 (#match? @name "^#")
 (#strip! @name "^#"))

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

((functional_iri_attribute
  value: (functional_iri_attribute_value
    (iri_reference) @name)) @reference.id
 (#match? @name "^#")
 (#strip! @name "^#"))

((functional_iri_attribute
  value: (functional_iri_attribute_value
    (paint_server
      (iri_reference) @name))) @reference.id
 (#match? @name "^#")
 (#strip! @name "^#"))
