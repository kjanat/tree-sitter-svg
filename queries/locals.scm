(element) @local.scope

(svg_root_element) @local.scope

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

((id_attribute
  value: (id_attribute_value
    (id_token) @local.definition)))

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

((href_attribute
  value: (href_attribute_value
    (href_reference
      (iri_reference) @local.reference)))
 (#match? @local.reference "^#")
 (#strip! @local.reference "^#"))

((functional_iri_attribute
  value: (functional_iri_attribute_value
    (iri_reference) @local.reference))
 (#match? @local.reference "^#")
 (#strip! @local.reference "^#"))

((functional_iri_attribute
  value: (functional_iri_attribute_value
    (paint_server
      (iri_reference) @local.reference)))
 (#match? @local.reference "^#")
 (#strip! @local.reference "^#"))
