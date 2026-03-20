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
(path_attribute_name) @attribute
(style_attribute_name) @attribute

(quoted_attribute_value) @string
(style_text_double) @string
(style_text_single) @string

(path_command) @keyword
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
