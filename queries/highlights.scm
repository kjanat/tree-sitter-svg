(xml_declaration) @keyword.directive
(doctype) @keyword.directive

(comment) @comment
(cdata_section) @string.special
(entity_reference) @constant.character.escape

(start_tag
  (name) @tag)

(end_tag
  (name) @tag)

(self_closing_tag
  (name) @tag)

(attribute_name) @attribute
(path_attribute_name) @attribute
(style_attribute_name) @attribute

(path_command) @keyword
(path_number) @number
(path_comma) @punctuation.delimiter
