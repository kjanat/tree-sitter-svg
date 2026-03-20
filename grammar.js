/**
 * @file SVG grammar for Tree-sitter
 * @author Kaj Kowalski <info@kajkowalski.nl>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PATH_COMMAND = /[MmZzLlHhVvCcSsQqTtAa]/;
const NUMBER_PATTERN = /[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?/;

function quoted(value) {
	return choice(
		seq('"', optional(value), '"'),
		seq("'", optional(value), "'"),
	);
}

export default grammar({
	name: 'svg',

	externals: $ => [
		$._start_tag_name,
		$._svg_start_tag_name,
		$._end_tag_name,
		$._svg_end_tag_name,
		$._erroneous_end_tag_name,
		'/>',
	],

	extras: () => [],

	rules: {
		source_file: $ =>
			seq(
				optional($.xml_declaration),
				repeat($._misc),
				optional(seq($.doctype, repeat($._misc))),
				field('root', $.svg_root_element),
				repeat($._misc),
			),

		_misc: $ =>
			choice(
				$.processing_instruction,
				$.comment,
				alias($.misc_text, $.text),
			),

		misc_text: _ => token(prec(-1, /[ \t\r\n]+/)),

		svg_root_element: $ =>
			choice(
				$.svg_root_self_closing_tag,
				seq(
					$.svg_root_start_tag,
					repeat($._content),
					choice($.svg_root_end_tag, $.erroneous_end_tag),
				),
			),

		element: $ =>
			choice(
				$.self_closing_tag,
				seq($.start_tag, repeat($._content), choice($.end_tag, $.erroneous_end_tag)),
			),

		_content: $ =>
			choice(
				$.element,
				$.comment,
				$.processing_instruction,
				$.cdata_section,
				$.entity_reference,
				$.text,
			),

		xml_declaration: $ =>
			seq(
				$._xml_declaration_start,
				$._s,
				$.xml_version_attribute,
				optional(seq($._s, $.xml_encoding_attribute)),
				optional(seq($._s, $.xml_standalone_attribute)),
				optional($._s),
				'?>',
			),

		_xml_declaration_start: _ => token(prec(2, '<?xml')),

		xml_version_attribute: $ =>
			seq(
				field('name', $.xml_version_attribute_name),
				$._eq,
				field('value', $.quoted_attribute_value),
			),

		xml_version_attribute_name: _ => 'version',

		xml_encoding_attribute: $ =>
			seq(
				field('name', $.xml_encoding_attribute_name),
				$._eq,
				field('value', $.quoted_attribute_value),
			),

		xml_encoding_attribute_name: _ => 'encoding',

		xml_standalone_attribute: $ =>
			seq(
				field('name', $.xml_standalone_attribute_name),
				$._eq,
				field('value', $.xml_standalone_attribute_value),
			),

		xml_standalone_attribute_name: _ => 'standalone',

		xml_standalone_attribute_value: _ => choice('"yes"', '"no"', "'yes'", "'no'"),

		doctype: $ =>
			seq(
				'<!DOCTYPE',
				$._s,
				field('name', $.name),
				optional(seq($._s, field('external_id', $.doctype_external_id))),
				optional(seq($._s, field('internal_subset', $.doctype_internal_subset))),
				optional($._s),
				'>',
			),

		doctype_external_id: _ => token(/[^\x5B\x5D>]+/),

		doctype_internal_subset: _ => seq('[', token(/[^\]]*/), ']'),

		processing_instruction: $ =>
			seq(
				'<?',
				field('target', alias($.pi_target_name, $.name)),
				optional(seq($._s, field('content', $.pi_content))),
				'?>',
			),

		pi_target_name: _ =>
			token(choice(
				/[A-WYZa-wyz_:][A-Za-z0-9_.:-]*/,
				/[xX][A-LN-Za-ln-z0-9_.:-][A-Za-z0-9_.:-]*/,
				/[xX][mM][A-KM-Za-km-z0-9_.:-][A-Za-z0-9_.:-]*/,
				/[xX][mM][lL][A-Za-z0-9_.:-]+/,
			)),

		pi_content: _ => token(/([^?]|\?[^>])+/),

		comment: _ =>
			seq(
				'<!--',
				repeat(choice(
					token.immediate(/[^-]+/),
					token.immediate(/-[^-]/),
				)),
				'-->',
			),

		cdata_section: $ =>
			seq(
				'<![CDATA[',
				optional($.cdata_text),
				']]>',
			),

		cdata_text: _ => token(/([^\]]|\][^\]])+/),

		start_tag: $ =>
			seq(
				'<',
				field('name', alias($._start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		svg_root_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._svg_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		svg_root_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._svg_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		end_tag: $ =>
			seq(
				'</',
				field('name', alias($._end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		svg_root_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._svg_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		erroneous_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._erroneous_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		attribute: $ =>
			choice(
				$.path_attribute,
				$.style_attribute,
				$.viewbox_attribute,
				$.preserve_aspect_ratio_attribute,
				$.transform_attribute,
				$.points_attribute,
				$.paint_attribute,
				$.opacity_attribute,
				$.stroke_dasharray_attribute,
				$.length_attribute,
				$.number_attribute,
				$.fill_rule_attribute,
				$.stroke_linecap_attribute,
				$.stroke_linejoin_attribute,
				$.display_attribute,
				$.visibility_attribute,
				$.overflow_attribute,
				$.pointer_events_attribute,
				$.shape_rendering_attribute,
				$.text_rendering_attribute,
				$.color_rendering_attribute,
				$.vector_effect_attribute,
				$.id_attribute,
				$.class_attribute,
				$.lang_attribute,
				$.xml_space_attribute,
				$.href_attribute,
				$.functional_iri_attribute,
				$.event_attribute,
				$.generic_attribute,
			),

		_eq: $ => seq(optional($._s), '=', optional($._s)),

		path_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.path_attribute_name),
					$._eq,
					field('value', $.path_attribute_value),
				),
			),

		path_attribute_name: _ => 'd',

		path_attribute_value: $ =>
			choice(
				$.double_quoted_path_data,
				$.single_quoted_path_data,
			),

		double_quoted_path_data: $ =>
			seq(
				'"',
				optional($.path_data_content),
				'"',
			),

		single_quoted_path_data: $ =>
			seq(
				"'",
				optional($.path_data_content),
				"'",
			),

		path_data_content: $ =>
			choice(
				seq(optional($.path_wsp), $.path_data),
				$.path_wsp,
			),

		path_data: $ =>
			prec.right(seq(
				$.moveto_segment,
				repeat(choice($.path_segment, seq($.path_wsp, $.path_segment))),
				optional($.path_wsp),
			)),

		path_segment: $ =>
			choice(
				$.closepath_segment,
				$.moveto_segment,
				$.lineto_segment,
				$.horizontal_lineto_segment,
				$.vertical_lineto_segment,
				$.curveto_segment,
				$.smooth_curveto_segment,
				$.quadratic_bezier_curveto_segment,
				$.smooth_quadratic_bezier_curveto_segment,
				$.elliptical_arc_segment,
			),

		moveto_segment: $ =>
			prec.left(
				seq(
					field('command', alias($.moveto_command, $.path_command)),
					optional($.path_wsp),
					$.path_coordinate_pair,
					repeat(seq($.path_comma_wsp, $.path_coordinate_pair)),
				),
			),

		closepath_segment: $ => field('command', alias($.closepath_command, $.path_command)),

		lineto_segment: $ =>
			prec.left(
				seq(
					field('command', alias($.lineto_command, $.path_command)),
					optional($.path_wsp),
					$.path_coordinate_pair,
					repeat(seq($.path_comma_wsp, $.path_coordinate_pair)),
				),
			),

		horizontal_lineto_segment: $ =>
			prec.left(
				seq(
					field('command', alias($.horizontal_lineto_command, $.path_command)),
					optional($.path_wsp),
					$.path_coordinate,
					repeat(seq($.path_comma_wsp, $.path_coordinate)),
				),
			),

		vertical_lineto_segment: $ =>
			prec.left(
				seq(
					field('command', alias($.vertical_lineto_command, $.path_command)),
					optional($.path_wsp),
					$.path_coordinate,
					repeat(seq($.path_comma_wsp, $.path_coordinate)),
				),
			),

		curveto_segment: $ =>
			prec.left(
				seq(
					field('command', alias($.curveto_command, $.path_command)),
					optional($.path_wsp),
					$.curveto_argument,
					repeat(seq($.path_comma_wsp, $.curveto_argument)),
				),
			),

		smooth_curveto_segment: $ =>
			prec.left(
				seq(
					field('command', alias($.smooth_curveto_command, $.path_command)),
					optional($.path_wsp),
					$.smooth_curveto_argument,
					repeat(seq($.path_comma_wsp, $.smooth_curveto_argument)),
				),
			),

		quadratic_bezier_curveto_segment: $ =>
			prec.left(
				seq(
					field('command', alias($.quadratic_bezier_curveto_command, $.path_command)),
					optional($.path_wsp),
					$.quadratic_bezier_curveto_argument,
					repeat(seq($.path_comma_wsp, $.quadratic_bezier_curveto_argument)),
				),
			),

		smooth_quadratic_bezier_curveto_segment: $ =>
			prec.left(
				seq(
					field('command', alias($.smooth_quadratic_bezier_curveto_command, $.path_command)),
					optional($.path_wsp),
					$.path_coordinate_pair,
					repeat(seq($.path_comma_wsp, $.path_coordinate_pair)),
				),
			),

		elliptical_arc_segment: $ =>
			prec.left(
				seq(
					field('command', alias($.elliptical_arc_command, $.path_command)),
					optional($.path_wsp),
					$.elliptical_arc_argument,
					repeat(seq($.path_comma_wsp, $.elliptical_arc_argument)),
				),
			),

		curveto_argument: $ =>
			seq(
				$.path_coordinate_pair,
				$.path_comma_wsp,
				$.path_coordinate_pair,
				$.path_comma_wsp,
				$.path_coordinate_pair,
			),

		smooth_curveto_argument: $ =>
			seq(
				$.path_coordinate_pair,
				$.path_comma_wsp,
				$.path_coordinate_pair,
			),

		quadratic_bezier_curveto_argument: $ =>
			seq(
				$.path_coordinate_pair,
				$.path_comma_wsp,
				$.path_coordinate_pair,
			),

		elliptical_arc_argument: $ =>
			seq(
				$.elliptical_arc_radii,
				optional($.path_comma_wsp),
				$.path_rotation,
				optional($.path_comma_wsp),
				$.path_arc_flag,
				optional($.path_comma_wsp),
				$.path_sweep_flag,
				optional($.path_comma_wsp),
				$.path_coordinate_pair,
			),

		elliptical_arc_radii: $ =>
			seq(
				$.path_coordinate,
				optional($.path_comma_wsp),
				$.path_coordinate,
			),

		path_coordinate_pair: $ =>
			seq(
				$.path_coordinate,
				optional($.path_comma_wsp),
				$.path_coordinate,
			),

		path_coordinate: $ => $.path_number,

		path_rotation: $ => $.path_number,

		path_arc_flag: _ => token(/[01]/),

		path_sweep_flag: _ => token(/[01]/),

		path_comma_wsp: $ =>
			choice(
				seq(optional($.path_wsp), $.path_comma, optional($.path_wsp)),
				$.path_wsp,
			),

		moveto_command: _ => token(/[Mm]/),

		closepath_command: _ => token(/[Zz]/),

		lineto_command: _ => token(/[Ll]/),

		horizontal_lineto_command: _ => token(/[Hh]/),

		vertical_lineto_command: _ => token(/[Vv]/),

		curveto_command: _ => token(/[Cc]/),

		smooth_curveto_command: _ => token(/[Ss]/),

		quadratic_bezier_curveto_command: _ => token(/[Qq]/),

		smooth_quadratic_bezier_curveto_command: _ => token(/[Tt]/),

		elliptical_arc_command: _ => token(/[Aa]/),

		path_command: _ => token(PATH_COMMAND),

		path_number: _ => token(NUMBER_PATTERN),

		path_comma: _ => ',',

		path_wsp: _ => token(prec(1, /[ \t\r\n]+/)),

		style_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.style_attribute_name),
					$._eq,
					field('value', $.style_attribute_value),
				),
			),

		style_attribute_name: _ => 'style',

		style_attribute_value: $ =>
			choice(
				$.double_quoted_style_value,
				$.single_quoted_style_value,
			),

		double_quoted_style_value: $ =>
			seq(
				'"',
				optional(field('content', $.style_text_double)),
				'"',
			),

		single_quoted_style_value: $ =>
			seq(
				"'",
				optional(field('content', $.style_text_single)),
				"'",
			),

		style_text_double: _ => token(/[^"]+/),

		style_text_single: _ => token(/[^']+/),

		viewbox_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.viewbox_attribute_name),
					$._eq,
					field('value', $.viewbox_attribute_value),
				),
			),

		viewbox_attribute_name: _ => 'viewBox',

		viewbox_attribute_value: $ => quoted($.viewbox_value),

		viewbox_value: $ =>
			seq(
				$.number,
				$.comma_wsp,
				$.number,
				$.comma_wsp,
				$.number,
				$.comma_wsp,
				$.number,
			),

		preserve_aspect_ratio_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.preserve_aspect_ratio_attribute_name),
					$._eq,
					field('value', $.preserve_aspect_ratio_attribute_value),
				),
			),

		preserve_aspect_ratio_attribute_name: _ => 'preserveAspectRatio',

		preserve_aspect_ratio_attribute_value: $ => quoted($.preserve_aspect_ratio_value),

		preserve_aspect_ratio_value: $ =>
			seq(
				optional(seq('defer', $.wsp)),
				$.align_keyword,
				optional(seq($.wsp, $.meet_or_slice_keyword)),
			),

		align_keyword: _ =>
			choice(
				'none',
				'xMinYMin',
				'xMidYMin',
				'xMaxYMin',
				'xMinYMid',
				'xMidYMid',
				'xMaxYMid',
				'xMinYMax',
				'xMidYMax',
				'xMaxYMax',
			),

		meet_or_slice_keyword: _ => choice('meet', 'slice'),

		transform_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.transform_attribute_name),
					$._eq,
					field('value', $.transform_attribute_value),
				),
			),

		transform_attribute_name: _ =>
			choice(
				'transform',
				'gradientTransform',
				'patternTransform',
			),

		transform_attribute_value: $ => quoted($.transform_list),

		transform_list: $ =>
			seq(
				$.transform_function,
				repeat(seq($.comma_wsp, $.transform_function)),
			),

		transform_function: $ =>
			choice(
				$.matrix_transform,
				$.translate_transform,
				$.scale_transform,
				$.rotate_transform,
				$.skew_x_transform,
				$.skew_y_transform,
			),

		matrix_transform: $ =>
			seq(
				'matrix',
				'(',
				optional($.wsp),
				$.number,
				$.comma_wsp,
				$.number,
				$.comma_wsp,
				$.number,
				$.comma_wsp,
				$.number,
				$.comma_wsp,
				$.number,
				$.comma_wsp,
				$.number,
				optional($.wsp),
				')',
			),

		translate_transform: $ =>
			seq(
				'translate',
				'(',
				optional($.wsp),
				$.number,
				optional(seq($.comma_wsp, $.number)),
				optional($.wsp),
				')',
			),

		scale_transform: $ =>
			seq(
				'scale',
				'(',
				optional($.wsp),
				$.number,
				optional(seq($.comma_wsp, $.number)),
				optional($.wsp),
				')',
			),

		rotate_transform: $ =>
			seq(
				'rotate',
				'(',
				optional($.wsp),
				$.number,
				optional(seq($.comma_wsp, $.number, $.comma_wsp, $.number)),
				optional($.wsp),
				')',
			),

		skew_x_transform: $ =>
			seq(
				'skewX',
				'(',
				optional($.wsp),
				$.number,
				optional($.wsp),
				')',
			),

		skew_y_transform: $ =>
			seq(
				'skewY',
				'(',
				optional($.wsp),
				$.number,
				optional($.wsp),
				')',
			),

		points_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.points_attribute_name),
					$._eq,
					field('value', $.points_attribute_value),
				),
			),

		points_attribute_name: _ => 'points',

		points_attribute_value: $ => quoted($.coordinate_pair_list),

		coordinate_pair_list: $ =>
			seq(
				$.coordinate_pair,
				repeat(seq($.comma_wsp, $.coordinate_pair)),
			),

		coordinate_pair: $ => seq($.number, optional($.comma_wsp), $.number),

		paint_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.paint_attribute_name),
					$._eq,
					field('value', $.paint_attribute_value),
				),
			),

		paint_attribute_name: _ =>
			choice(
				'fill',
				'stroke',
				'color',
				'stop-color',
				'flood-color',
				'lighting-color',
			),

		paint_attribute_value: $ => quoted($.paint_value),

		paint_value: $ =>
			choice(
				'none',
				'currentColor',
				'context-fill',
				'context-stroke',
				'inherit',
				$.paint_server,
				$.color_value,
			),

		paint_server: $ =>
			seq(
				'url(',
				optional($.wsp),
				$.iri_reference,
				optional($.wsp),
				')',
				optional(seq($.wsp, choice($.color_value, 'none', 'currentColor'))),
			),

		color_value: $ => choice($.hex_color, $.functional_color, $.named_color),

		hex_color: _ => token(/#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})/),

		functional_color: _ => token(/(?:rgb|rgba|hsl|hsla)\([^)]+\)/),

		named_color: _ => token(/[A-Za-z][A-Za-z-]*/),

		opacity_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.opacity_attribute_name),
					$._eq,
					field('value', $.opacity_attribute_value),
				),
			),

		opacity_attribute_name: _ =>
			choice(
				'opacity',
				'fill-opacity',
				'stroke-opacity',
				'stop-opacity',
				'flood-opacity',
			),

		opacity_attribute_value: $ => quoted($.number_or_percentage),

		stroke_dasharray_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.stroke_dasharray_attribute_name),
					$._eq,
					field('value', $.stroke_dasharray_attribute_value),
				),
			),

		stroke_dasharray_attribute_name: _ => 'stroke-dasharray',

		stroke_dasharray_attribute_value: $ => quoted($.stroke_dasharray_value),

		stroke_dasharray_value: $ => choice('none', $.length_list),

		length_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.length_attribute_name),
					$._eq,
					field('value', $.length_attribute_value),
				),
			),

		length_attribute_name: _ =>
			choice(
				'x',
				'y',
				'width',
				'height',
				'cx',
				'cy',
				'r',
				'rx',
				'ry',
				'x1',
				'y1',
				'x2',
				'y2',
				'fx',
				'fy',
				'refX',
				'refY',
				'markerWidth',
				'markerHeight',
				'stroke-width',
				'font-size',
				'startOffset',
				'textLength',
			),

		length_attribute_value: $ => quoted($.length_or_percentage_or_auto),

		number_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.number_attribute_name),
					$._eq,
					field('value', $.number_attribute_value),
				),
			),

		number_attribute_name: _ =>
			choice(
				'stroke-miterlimit',
				'stroke-dashoffset',
				'pathLength',
				'tabindex',
			),

		number_attribute_value: $ => quoted($.number),

		fill_rule_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.fill_rule_attribute_name),
					$._eq,
					field('value', $.fill_rule_attribute_value),
				),
			),

		fill_rule_attribute_name: _ => choice('fill-rule', 'clip-rule'),

		fill_rule_attribute_value: $ => quoted($.fill_rule_keyword),

		fill_rule_keyword: _ => choice('nonzero', 'evenodd', 'inherit'),

		stroke_linecap_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.stroke_linecap_attribute_name),
					$._eq,
					field('value', $.stroke_linecap_attribute_value),
				),
			),

		stroke_linecap_attribute_name: _ => 'stroke-linecap',

		stroke_linecap_attribute_value: $ => quoted($.stroke_linecap_keyword),

		stroke_linecap_keyword: _ => choice('butt', 'round', 'square', 'inherit'),

		stroke_linejoin_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.stroke_linejoin_attribute_name),
					$._eq,
					field('value', $.stroke_linejoin_attribute_value),
				),
			),

		stroke_linejoin_attribute_name: _ => 'stroke-linejoin',

		stroke_linejoin_attribute_value: $ => quoted($.stroke_linejoin_keyword),

		stroke_linejoin_keyword: _ => choice('miter', 'round', 'bevel', 'arcs', 'miter-clip', 'inherit'),

		display_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.display_attribute_name),
					$._eq,
					field('value', $.display_attribute_value),
				),
			),

		display_attribute_name: _ => 'display',

		display_attribute_value: $ => quoted($.display_keyword),

		display_keyword: _ =>
			choice(
				'inline',
				'block',
				'list-item',
				'run-in',
				'compact',
				'marker',
				'table',
				'inline-table',
				'table-row-group',
				'table-header-group',
				'table-footer-group',
				'table-row',
				'table-column-group',
				'table-column',
				'table-cell',
				'table-caption',
				'none',
				'inherit',
			),

		visibility_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.visibility_attribute_name),
					$._eq,
					field('value', $.visibility_attribute_value),
				),
			),

		visibility_attribute_name: _ => 'visibility',

		visibility_attribute_value: $ => quoted($.visibility_keyword),

		visibility_keyword: _ => choice('visible', 'hidden', 'collapse', 'inherit'),

		overflow_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.overflow_attribute_name),
					$._eq,
					field('value', $.overflow_attribute_value),
				),
			),

		overflow_attribute_name: _ => 'overflow',

		overflow_attribute_value: $ => quoted($.overflow_keyword),

		overflow_keyword: _ => choice('visible', 'hidden', 'scroll', 'auto', 'inherit'),

		pointer_events_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.pointer_events_attribute_name),
					$._eq,
					field('value', $.pointer_events_attribute_value),
				),
			),

		pointer_events_attribute_name: _ => 'pointer-events',

		pointer_events_attribute_value: $ => quoted($.pointer_events_keyword),

		pointer_events_keyword: _ =>
			choice(
				'visiblePainted',
				'visibleFill',
				'visibleStroke',
				'visible',
				'painted',
				'fill',
				'stroke',
				'all',
				'none',
				'inherit',
			),

		shape_rendering_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.shape_rendering_attribute_name),
					$._eq,
					field('value', $.shape_rendering_attribute_value),
				),
			),

		shape_rendering_attribute_name: _ => 'shape-rendering',

		shape_rendering_attribute_value: $ => quoted($.shape_rendering_keyword),

		shape_rendering_keyword: _ => choice('auto', 'optimizeSpeed', 'crispEdges', 'geometricPrecision', 'inherit'),

		text_rendering_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.text_rendering_attribute_name),
					$._eq,
					field('value', $.text_rendering_attribute_value),
				),
			),

		text_rendering_attribute_name: _ => 'text-rendering',

		text_rendering_attribute_value: $ => quoted($.text_rendering_keyword),

		text_rendering_keyword: _ => choice('auto', 'optimizeSpeed', 'optimizeLegibility', 'geometricPrecision', 'inherit'),

		color_rendering_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.color_rendering_attribute_name),
					$._eq,
					field('value', $.color_rendering_attribute_value),
				),
			),

		color_rendering_attribute_name: _ => 'color-rendering',

		color_rendering_attribute_value: $ => quoted($.color_rendering_keyword),

		color_rendering_keyword: _ => choice('auto', 'optimizeSpeed', 'optimizeQuality', 'inherit'),

		vector_effect_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.vector_effect_attribute_name),
					$._eq,
					field('value', $.vector_effect_attribute_value),
				),
			),

		vector_effect_attribute_name: _ => 'vector-effect',

		vector_effect_attribute_value: $ => quoted($.vector_effect_keyword),

		vector_effect_keyword: _ =>
			choice('none', 'non-scaling-stroke', 'non-scaling-size', 'non-rotation', 'fixed-position', 'inherit'),

		id_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.id_attribute_name),
					$._eq,
					field('value', $.id_attribute_value),
				),
			),

		id_attribute_name: _ => 'id',

		id_attribute_value: $ => quoted($.id_token),

		id_token: _ => token(/(?:[A-Za-z_:]|[\u0080-\uFFFF])(?:[A-Za-z0-9_.:-]|[\u0080-\uFFFF])*/),

		class_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.class_attribute_name),
					$._eq,
					field('value', $.class_attribute_value),
				),
			),

		class_attribute_name: _ => 'class',

		class_attribute_value: $ => quoted($.class_list),

		class_list: $ => seq($.class_name, repeat(seq($.wsp, $.class_name))),

		class_name: _ => token(/[A-Za-z_][A-Za-z0-9_-]*/),

		lang_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.lang_attribute_name),
					$._eq,
					field('value', $.lang_attribute_value),
				),
			),

		lang_attribute_name: _ => choice('lang', 'xml:lang'),

		lang_attribute_value: $ => quoted($.language_tag),

		language_tag: _ => token(/[A-Za-z]{1,8}(?:-[A-Za-z0-9]{1,8})*/),

		xml_space_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.xml_space_attribute_name),
					$._eq,
					field('value', $.xml_space_attribute_value),
				),
			),

		xml_space_attribute_name: _ => 'xml:space',

		xml_space_attribute_value: $ => quoted($.xml_space_keyword),

		xml_space_keyword: _ => choice('default', 'preserve'),

		href_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.href_attribute_name),
					$._eq,
					field('value', $.href_attribute_value),
				),
			),

		href_attribute_name: _ => choice('href', 'xlink:href'),

		href_attribute_value: $ => quoted($.iri_reference),

		functional_iri_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.functional_iri_attribute_name),
					$._eq,
					field('value', $.functional_iri_attribute_value),
				),
			),

		functional_iri_attribute_name: _ =>
			choice(
				'clip-path',
				'mask',
				'filter',
				'marker-start',
				'marker-mid',
				'marker-end',
				'cursor',
			),

		functional_iri_attribute_value: $ => quoted(choice('none', $.paint_server, $.iri_reference)),

		event_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.event_attribute_name),
					$._eq,
					field('value', $.event_attribute_value),
				),
			),

		event_attribute_name: _ => token(prec(1, /on[A-Za-z][A-Za-z0-9_-]*/)),

		event_attribute_value: $ =>
			choice(
				seq('"', optional(field('content', $.script_text_double)), '"'),
				seq("'", optional(field('content', $.script_text_single)), "'"),
			),

		script_text_double: _ => token(/[^"]+/),

		script_text_single: _ => token(/[^']+/),

		number_or_percentage: $ => choice($.number, $.percentage),

		length_or_percentage: $ => choice($.length, $.percentage),

		length_or_percentage_or_auto: $ => choice($.length_or_percentage, 'auto'),

		length_list: $ => seq($.length_or_percentage, repeat(seq($.comma_wsp, $.length_or_percentage))),

		length: $ => seq($.number, optional($.length_unit)),

		percentage: $ => seq($.number, '%'),

		length_unit: _ =>
			choice(
				'em',
				'ex',
				'px',
				'cm',
				'mm',
				'in',
				'pt',
				'pc',
				'Q',
				'q',
				'rem',
				'ch',
				'vh',
				'vw',
				'vmin',
				'vmax',
			),

		number: _ => token(NUMBER_PATTERN),

		iri_reference: _ => token(prec(-1, /(?:#[A-Za-z_:][A-Za-z0-9_.:-]*|[^)\s"']+)/)),

		comma_wsp: $ => choice(seq(optional($.wsp), ',', optional($.wsp)), $.wsp),

		wsp: _ => token(/[ \t\r\n]+/),

		generic_attribute: $ =>
			seq(
				field('name', $.attribute_name),
				$._eq,
				field('value', $.quoted_attribute_value),
			),

		attribute_name: _ => token(/(?:[A-Za-z_:]|[\u0080-\uFFFF])(?:[A-Za-z0-9_.:-]|[\u0080-\uFFFF])*/),

		quoted_attribute_value: $ =>
			choice(
				seq(
					'"',
					repeat(choice($.entity_reference, $.attribute_text_double)),
					'"',
				),
				seq(
					"'",
					repeat(choice($.entity_reference, $.attribute_text_single)),
					"'",
				),
			),

		attribute_text_double: _ => token(/[^"&<]+/),

		attribute_text_single: _ => token(/[^'&<]+/),

		entity_reference: _ => token(/&(#x[0-9A-Fa-f]+|#[0-9]+|[A-Za-z_:][A-Za-z0-9_.:-]*);/),

		text: _ => token(prec(-1, /[^<&]+/)),

		name: _ => token(/(?:[A-Za-z_:]|[\u0080-\uFFFF])(?:[A-Za-z0-9_.:-]|[\u0080-\uFFFF])*/),

		_s: _ => token(/[ \t\r\n]+/),
	},
});
