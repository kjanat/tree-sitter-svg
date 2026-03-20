(("<" @open
  "/>" @close)
  (#set! rainbow.exclude))

(("</" @open
  ">" @close)
  (#set! rainbow.exclude))

(("<" @open
  ">" @close)
  (#set! rainbow.exclude))

(("\"" @open
  "\"" @close)
  (#set! rainbow.exclude))

(("'" @open
  "'" @close)
  (#set! rainbow.exclude))

((element
  (start_tag) @open
  (end_tag) @close)
  (#set! newline.only)
  (#set! rainbow.exclude))

((svg_root_element
  (svg_root_start_tag) @open
  (svg_root_end_tag) @close)
  (#set! newline.only)
  (#set! rainbow.exclude))
