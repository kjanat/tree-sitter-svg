/**
 * @file SVG grammar for Tree-sitter
 * @author Kaj Kowalski <info@kajkowalski.nl>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const PATH_COMMAND = /[MmZzLlHhVvCcSsQqTtAa]/;
const PATH_NUMBER = /[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?/;

export default grammar({
	name: 'svg',

	externals: $ => [
		$._start_tag_name,
		$._end_tag_name,
		$._erroneous_end_tag_name,
		'/>',
	],

	extras: () => [],

	rules: {
		source_file: $ =>
			seq(
				repeat($._pre_root_item),
				field('root', $.element),
				repeat($._post_root_item),
			),

		_pre_root_item: $ =>
			choice(
				$.xml_declaration,
				$.doctype,
				$.processing_instruction,
				$.comment,
				alias($.misc_text, $.text),
			),

		_post_root_item: $ =>
			choice(
				$.processing_instruction,
				$.comment,
				alias($.misc_text, $.text),
			),

		misc_text: _ => token(/[ \t\r\n]+/),

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
				'=',
				field('value', $.quoted_attribute_value),
			),

		xml_version_attribute_name: _ => 'version',

		xml_encoding_attribute: $ =>
			seq(
				field('name', $.xml_encoding_attribute_name),
				'=',
				field('value', $.quoted_attribute_value),
			),

		xml_encoding_attribute_name: _ => 'encoding',

		xml_standalone_attribute: $ =>
			seq(
				field('name', $.xml_standalone_attribute_name),
				'=',
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

		self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._start_tag_name, $.name)),
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
				$.generic_attribute,
			),

		path_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.path_attribute_name),
					'=',
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
				optional($.path_data),
				'"',
			),

		single_quoted_path_data: $ =>
			seq(
				"'",
				optional($.path_data),
				"'",
			),

		path_data: $ =>
			seq(
				$.moveto_segment,
				repeat(seq(optional($.path_wsp), $.path_segment)),
			),

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

		path_number: _ => token(PATH_NUMBER),

		path_comma: _ => ',',

		path_wsp: _ => token(/[ \t\r\n]+/),

		style_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.style_attribute_name),
					'=',
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

		generic_attribute: $ =>
			seq(
				field('name', $.attribute_name),
				'=',
				field('value', $.quoted_attribute_value),
			),

		attribute_name: _ => token(/[A-Za-z_:][A-Za-z0-9_.:-]*/),

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

		name: _ => token(/[A-Za-z_:][A-Za-z0-9_.:-]*/),

		_s: _ => token(/[ \t\r\n]+/),
	},
});
