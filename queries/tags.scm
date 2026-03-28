; ─── ID definitions ──────────────────────────────────────────────
; Elements with id attributes are the primary navigation targets in SVG.
; Gradients, clipPaths, symbols, markers, filters — all referenceable by id.

(id_attribute
  value: (id_attribute_value
    (id_token) @name)) @definition.id

; ─── ID references (href) ───────────────────────────────────────
; <use href="#foo"/>, <textPath href="#path1">, <a href="#section">

((href_attribute
  value: (href_attribute_value
    (href_reference
      (iri_reference) @name))) @reference.id
 (#match? @name "^#"))

; ─── ID references (paint url()) ────────────────────────────────
; fill="url(#grad1)", stroke="url(#pattern)"

((paint_attribute
  value: (paint_attribute_value
    (paint_value
      (paint_server
        (iri_reference) @name)))) @reference.id
 (#match? @name "^#"))

; ─── ID references (functional IRI) ─────────────────────────────
; clip-path="url(#clip)", mask="url(#mask)", filter="url(#blur)"

((functional_iri_attribute
  value: (functional_iri_attribute_value
    (iri_reference) @name)) @reference.id
 (#match? @name "^#"))

((functional_iri_attribute
  value: (functional_iri_attribute_value
    (paint_server
      (iri_reference) @name))) @reference.id
 (#match? @name "^#"))
