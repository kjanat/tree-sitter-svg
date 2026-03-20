(xml_declaration) @keyword
(doctype) @keyword

(xml_version_attribute_name) @attribute
(xml_encoding_attribute_name) @attribute
(xml_standalone_attribute_name) @attribute
(xml_standalone_attribute_value) @boolean

(comment) @comment
(cdata_section) @markup.raw
(entity_reference) @string.escape

(processing_instruction
  (name) @keyword)

(start_tag
  (name) @tag)

(end_tag
  (name) @tag)

(self_closing_tag
  (name) @tag)

(attribute_name) @attribute
(d_attribute_name) @attribute
(viewbox_attribute_name) @attribute
(preserve_aspect_ratio_attribute_name) @attribute
(transform_attribute_name) @attribute
(points_attribute_name) @attribute
(style_attribute_name) @attribute
(paint_attribute_name) @attribute
(functional_iri_attribute_name) @attribute
(opacity_attribute_name) @attribute
(length_attribute_name) @attribute
(href_attribute_name) @attribute
(id_attribute_name) @attribute
(class_attribute_name) @attribute
(event_attribute_name) @attribute

(quoted_attribute_value) @string
(style_text_double) @string
(style_text_single) @string

(path_command) @function.builtin
(path_number) @number
(path_arc_flag) @boolean
(path_sweep_flag) @boolean
(path_comma) @punctuation.delimiter

[
  "<?"
  "?>"
  "<"
  ">"
  "</"
  "/>"
  "="
] @punctuation.delimiter
