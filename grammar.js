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
		$._path_start_tag_name,
		$._shape_start_tag_name,
		$._clip_path_start_tag_name,
		$._defs_start_tag_name,
		$._gradient_start_tag_name,
		$._gradient_stop_start_tag_name,
		$._filter_start_tag_name,
		$._filter_primitive_start_tag_name,
		$._filter_color_matrix_start_tag_name,
		$._filter_turbulence_start_tag_name,
		$._filter_component_transfer_start_tag_name,
		$._filter_component_transfer_function_start_tag_name,
		$._filter_merge_start_tag_name,
		$._filter_merge_node_start_tag_name,
		$._filter_lighting_start_tag_name,
		$._filter_light_source_start_tag_name,
		$._text_container_start_tag_name,
		$._linking_media_start_tag_name,
		$._script_start_tag_name,
		$._style_start_tag_name,
		$._animation_start_tag_name,
		$._descriptive_start_tag_name,
		$._end_tag_name,
		$._svg_end_tag_name,
		$._path_end_tag_name,
		$._shape_end_tag_name,
		$._clip_path_end_tag_name,
		$._defs_end_tag_name,
		$._gradient_end_tag_name,
		$._gradient_stop_end_tag_name,
		$._filter_end_tag_name,
		$._filter_primitive_end_tag_name,
		$._filter_color_matrix_end_tag_name,
		$._filter_turbulence_end_tag_name,
		$._filter_component_transfer_end_tag_name,
		$._filter_component_transfer_function_end_tag_name,
		$._filter_merge_end_tag_name,
		$._filter_merge_node_end_tag_name,
		$._filter_lighting_end_tag_name,
		$._filter_light_source_end_tag_name,
		$._text_container_end_tag_name,
		$._linking_media_end_tag_name,
		$._script_end_tag_name,
		$._style_end_tag_name,
		$._animation_end_tag_name,
		$._descriptive_end_tag_name,
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
				$._path_element,
				$._shape_element,
				$._clip_path_element,
				$._defs_element,
				$._gradient_element,
				$._filter_element,
				$._text_container_element,
				$._linking_media_element,
				$._script_element,
				$._style_element,
				$.self_closing_tag,
				seq($.start_tag, repeat($._content), choice($.end_tag, $.erroneous_end_tag)),
			),

		_content: $ =>
			choice(
				$.element,
				$._text_like_content,
			),

		_text_like_content: $ =>
			choice(
				$.comment,
				$.processing_instruction,
				$.cdata_section,
				$.entity_reference,
				$.text,
			),

		_path_element: $ =>
			choice(
				alias($.path_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.path_start_tag, $.start_tag),
					repeat($.path_content),
					choice(alias($.path_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		path_content: $ =>
			choice(
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_shape_element: $ =>
			choice(
				alias($.shape_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.shape_start_tag, $.start_tag),
					repeat($.shape_content),
					choice(alias($.shape_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		shape_content: $ =>
			choice(
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_clip_path_element: $ =>
			choice(
				alias($.clip_path_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.clip_path_start_tag, $.start_tag),
					repeat($.clip_path_content),
					choice(alias($.clip_path_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		clip_path_content: $ =>
			choice(
				$._path_element,
				$._shape_element,
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_defs_element: $ =>
			choice(
				alias($.defs_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.defs_start_tag, $.start_tag),
					repeat($.defs_content),
					choice(alias($.defs_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		defs_content: $ =>
			choice(
				$.element,
				$._text_like_content,
			),

		_gradient_element: $ =>
			choice(
				alias($.gradient_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.gradient_start_tag, $.start_tag),
					repeat($.gradient_content),
					choice(alias($.gradient_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		gradient_content: $ =>
			choice(
				$._gradient_stop_element,
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_gradient_stop_element: $ =>
			choice(
				alias($.gradient_stop_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.gradient_stop_start_tag, $.start_tag),
					repeat($.gradient_stop_content),
					choice(alias($.gradient_stop_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		gradient_stop_content: $ =>
			choice(
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_filter_element: $ =>
			choice(
				alias($.filter_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.filter_start_tag, $.start_tag),
					repeat($.filter_content),
					choice(alias($.filter_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		filter_content: $ =>
			choice(
				$._filter_primitive_element,
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_filter_primitive_element: $ =>
			choice(
				$._filter_primitive_core_element,
				$._filter_color_matrix_element,
				$._filter_turbulence_element,
				$._filter_component_transfer_element,
				$._filter_merge_element,
				$._filter_lighting_element,
			),

		_filter_primitive_core_element: $ =>
			choice(
				alias($.filter_primitive_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.filter_primitive_start_tag, $.start_tag),
					repeat($.filter_primitive_core_content),
					choice(alias($.filter_primitive_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		filter_primitive_core_content: $ =>
			choice(
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_filter_color_matrix_element: $ =>
			choice(
				alias($.filter_color_matrix_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.filter_color_matrix_start_tag, $.start_tag),
					repeat($.filter_color_matrix_content),
					choice(alias($.filter_color_matrix_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		filter_color_matrix_content: $ =>
			choice(
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_filter_turbulence_element: $ =>
			choice(
				alias($.filter_turbulence_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.filter_turbulence_start_tag, $.start_tag),
					repeat($.filter_turbulence_content),
					choice(alias($.filter_turbulence_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		filter_turbulence_content: $ =>
			choice(
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_filter_component_transfer_element: $ =>
			choice(
				alias($.filter_component_transfer_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.filter_component_transfer_start_tag, $.start_tag),
					repeat($.filter_component_transfer_content),
					choice(alias($.filter_component_transfer_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		filter_component_transfer_content: $ =>
			choice(
				$._filter_component_transfer_function_element,
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_filter_component_transfer_function_element: $ =>
			choice(
				alias($.filter_component_transfer_function_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.filter_component_transfer_function_start_tag, $.start_tag),
					repeat($.filter_component_transfer_function_content),
					choice(alias($.filter_component_transfer_function_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		filter_component_transfer_function_content: $ =>
			choice(
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_filter_merge_element: $ =>
			choice(
				alias($.filter_merge_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.filter_merge_start_tag, $.start_tag),
					repeat($.filter_merge_content),
					choice(alias($.filter_merge_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		filter_merge_content: $ =>
			choice(
				$._filter_merge_node_element,
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_filter_merge_node_element: $ =>
			choice(
				alias($.filter_merge_node_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.filter_merge_node_start_tag, $.start_tag),
					repeat($.filter_merge_node_content),
					choice(alias($.filter_merge_node_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		filter_merge_node_content: $ =>
			choice(
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_filter_lighting_element: $ =>
			choice(
				alias($.filter_lighting_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.filter_lighting_start_tag, $.start_tag),
					repeat($.filter_lighting_content),
					choice(alias($.filter_lighting_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		filter_lighting_content: $ =>
			choice(
				$._filter_light_source_element,
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_filter_light_source_element: $ =>
			choice(
				alias($.filter_light_source_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.filter_light_source_start_tag, $.start_tag),
					repeat($.filter_light_source_content),
					choice(alias($.filter_light_source_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		filter_light_source_content: $ =>
			choice(
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_text_container_element: $ =>
			choice(
				alias($.text_container_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.text_container_start_tag, $.start_tag),
					repeat($.text_container_content),
					choice(alias($.text_container_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		text_container_content: $ =>
			choice(
				$._text_container_element,
				$._linking_media_element,
				$._animation_element,
				$._descriptive_element,
				$._text_like_content,
			),

		_linking_media_element: $ =>
			choice(
				alias($.linking_media_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.linking_media_start_tag, $.start_tag),
					repeat($._content),
					choice(alias($.linking_media_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		_script_element: $ =>
			choice(
				alias($.script_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.script_start_tag, $.start_tag),
					repeat($._script_content),
					choice(alias($.script_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		_script_content: $ =>
			choice(
				$.comment,
				$.processing_instruction,
				$.cdata_section,
				$.entity_reference,
				$.text,
			),

		_style_element: $ =>
			choice(
				alias($.style_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.style_element_start_tag, $.start_tag),
					repeat($._style_content),
					choice(alias($.style_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		_style_content: $ =>
			choice(
				$.comment,
				$.processing_instruction,
				$.cdata_section,
				$.entity_reference,
				$.text,
			),

		_animation_element: $ =>
			choice(
				alias($.animation_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.animation_start_tag, $.start_tag),
					repeat($._content),
					choice(alias($.animation_end_tag, $.end_tag), $.erroneous_end_tag),
				),
			),

		_descriptive_element: $ =>
			choice(
				alias($.descriptive_self_closing_tag, $.self_closing_tag),
				seq(
					alias($.descriptive_start_tag, $.start_tag),
					repeat($._text_like_content),
					choice(alias($.descriptive_end_tag, $.end_tag), $.erroneous_end_tag),
				),
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

		path_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._path_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		shape_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._shape_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		clip_path_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._clip_path_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		defs_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._defs_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		gradient_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._gradient_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		gradient_stop_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._gradient_stop_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		filter_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		filter_primitive_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_primitive_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'>',
			),

		filter_color_matrix_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_color_matrix_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_color_matrix_attribute)),
				optional($._s),
				'>',
			),

		filter_turbulence_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_turbulence_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_turbulence_attribute)),
				optional($._s),
				'>',
			),

		filter_component_transfer_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_component_transfer_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'>',
			),

		filter_component_transfer_function_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_component_transfer_function_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_component_transfer_function_attribute)),
				optional($._s),
				'>',
			),

		filter_merge_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_merge_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'>',
			),

		filter_merge_node_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_merge_node_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'>',
			),

		filter_lighting_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_lighting_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'>',
			),

		filter_light_source_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_light_source_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'>',
			),

		text_container_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._text_container_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		linking_media_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._linking_media_start_tag_name, $.name)),
				repeat(seq($._s, $.linking_media_element_attribute)),
				optional($._s),
				'>',
			),

		script_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._script_start_tag_name, $.name)),
				repeat(seq($._s, $.script_attribute)),
				optional($._s),
				'>',
			),

		style_element_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._style_start_tag_name, $.name)),
				repeat(seq($._s, $.style_element_attribute)),
				optional($._s),
				'>',
			),

		animation_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._animation_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		descriptive_start_tag: $ =>
			seq(
				'<',
				field('name', alias($._descriptive_start_tag_name, $.name)),
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

		path_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._path_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		shape_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._shape_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		clip_path_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._clip_path_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		defs_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._defs_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		gradient_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._gradient_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		gradient_stop_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._gradient_stop_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		filter_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		filter_primitive_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_primitive_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'/>',
			),

		filter_color_matrix_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_color_matrix_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_color_matrix_attribute)),
				optional($._s),
				'/>',
			),

		filter_turbulence_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_turbulence_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_turbulence_attribute)),
				optional($._s),
				'/>',
			),

		filter_component_transfer_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_component_transfer_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'/>',
			),

		filter_component_transfer_function_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_component_transfer_function_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_component_transfer_function_attribute)),
				optional($._s),
				'/>',
			),

		filter_merge_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_merge_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'/>',
			),

		filter_merge_node_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_merge_node_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'/>',
			),

		filter_lighting_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_lighting_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'/>',
			),

		filter_light_source_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._filter_light_source_start_tag_name, $.name)),
				repeat(seq($._s, $.filter_primitive_core_attribute)),
				optional($._s),
				'/>',
			),

		text_container_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._text_container_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		linking_media_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._linking_media_start_tag_name, $.name)),
				repeat(seq($._s, $.linking_media_element_attribute)),
				optional($._s),
				'/>',
			),

		script_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._script_start_tag_name, $.name)),
				repeat(seq($._s, $.script_attribute)),
				optional($._s),
				'/>',
			),

		style_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._style_start_tag_name, $.name)),
				repeat(seq($._s, $.style_element_attribute)),
				optional($._s),
				'/>',
			),

		animation_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._animation_start_tag_name, $.name)),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		descriptive_self_closing_tag: $ =>
			seq(
				'<',
				field('name', alias($._descriptive_start_tag_name, $.name)),
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

		path_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._path_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		shape_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._shape_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		clip_path_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._clip_path_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		defs_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._defs_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		gradient_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._gradient_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		gradient_stop_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._gradient_stop_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		filter_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._filter_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		filter_primitive_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._filter_primitive_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		filter_color_matrix_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._filter_color_matrix_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		filter_turbulence_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._filter_turbulence_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		filter_component_transfer_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._filter_component_transfer_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		filter_component_transfer_function_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._filter_component_transfer_function_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		filter_merge_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._filter_merge_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		filter_merge_node_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._filter_merge_node_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		filter_lighting_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._filter_lighting_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		filter_light_source_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._filter_light_source_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		text_container_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._text_container_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		linking_media_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._linking_media_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		script_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._script_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		style_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._style_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		animation_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._animation_end_tag_name, $.name)),
				optional($._s),
				'>',
			),

		descriptive_end_tag: $ =>
			seq(
				'</',
				field('name', alias($._descriptive_end_tag_name, $.name)),
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
				$._typed_attribute,
				$.generic_attribute,
			),

		_typed_attribute: $ =>
			choice(
				$.path_attribute,
				$.style_attribute,
				$.aria_attribute,
				$.animation_attribute,
				$.filter_effect_attribute,
				$.text_layout_attribute,
				$.coord_system_attribute,
				$.linking_media_attribute,
				$.color_rendering_misc_attribute,
				$.other_regular_attribute,
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
			),

		filter_primitive_core_attribute: $ => $._typed_attribute,

		filter_color_matrix_attribute: $ =>
			choice(
				$.filter_color_matrix_type_attribute,
				$._typed_attribute,
			),

		filter_turbulence_attribute: $ =>
			choice(
				$.filter_turbulence_type_attribute,
				$._typed_attribute,
			),

		filter_component_transfer_function_attribute: $ =>
			choice(
				$.filter_component_transfer_function_type_attribute,
				$._typed_attribute,
			),

		linking_media_element_attribute: $ =>
			choice(
				$.linking_media_type_attribute,
				$._typed_attribute,
			),

		script_attribute: $ =>
			choice(
				$.script_type_attribute,
				$.crossorigin_attribute,
				$.href_attribute,
				$.referrerpolicy_attribute,
				$.id_attribute,
				$.class_attribute,
				$.lang_attribute,
				$.xml_space_attribute,
				$.event_attribute,
			),

		style_element_attribute: $ =>
			choice(
				$.style_element_type_attribute,
				$.media_attribute,
				$.title_attribute,
				$.id_attribute,
				$.class_attribute,
				$.lang_attribute,
				$.xml_space_attribute,
				$.event_attribute,
			),

		script_type_attribute: $ =>
			seq(
				field('name', $.script_type_attribute_name),
				$._eq,
				field('value', $.script_type_attribute_value),
			),

		script_type_attribute_name: _ => 'type',

		script_type_attribute_value: $ => quoted($.script_mime_type),

		script_mime_type: _ =>
			choice(
				'application/ecmascript',
				'application/javascript',
				'text/ecmascript',
				'text/javascript',
				'module',
			),

		style_element_type_attribute: $ =>
			seq(
				field('name', $.style_element_type_attribute_name),
				$._eq,
				field('value', $.style_element_type_attribute_value),
			),

		style_element_type_attribute_name: _ => 'type',

		style_element_type_attribute_value: $ => quoted($.style_mime_type),

		style_mime_type: _ => 'text/css',

		filter_color_matrix_type_attribute: $ =>
			seq(
				field('name', $.filter_color_matrix_type_attribute_name),
				$._eq,
				field('value', $.filter_color_matrix_type_attribute_value),
			),

		filter_color_matrix_type_attribute_name: _ => 'type',

		filter_color_matrix_type_attribute_value: $ => quoted($.filter_color_matrix_type_keyword),

		filter_color_matrix_type_keyword: _ =>
			choice(
				'matrix',
				'saturate',
				'hueRotate',
				'luminanceToAlpha',
			),

		filter_turbulence_type_attribute: $ =>
			seq(
				field('name', $.filter_turbulence_type_attribute_name),
				$._eq,
				field('value', $.filter_turbulence_type_attribute_value),
			),

		filter_turbulence_type_attribute_name: _ => 'type',

		filter_turbulence_type_attribute_value: $ => quoted($.filter_turbulence_type_keyword),

		filter_turbulence_type_keyword: _ =>
			choice(
				'fractalNoise',
				'turbulence',
			),

		filter_component_transfer_function_type_attribute: $ =>
			seq(
				field('name', $.filter_component_transfer_function_type_attribute_name),
				$._eq,
				field('value', $.filter_component_transfer_function_type_attribute_value),
			),

		filter_component_transfer_function_type_attribute_name: _ => 'type',

		filter_component_transfer_function_type_attribute_value: $ =>
			quoted($.filter_component_transfer_function_type_keyword),

		filter_component_transfer_function_type_keyword: _ =>
			choice(
				'identity',
				'table',
				'discrete',
				'linear',
				'gamma',
			),

		linking_media_type_attribute: $ =>
			seq(
				field('name', $.linking_media_type_attribute_name),
				$._eq,
				field('value', $.linking_media_type_attribute_value),
			),

		linking_media_type_attribute_name: _ => 'type',

		linking_media_type_attribute_value: $ => quoted($.mime_type),

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

		href_attribute_value: $ => quoted($.href_reference),

		href_reference: $ => choice($.data_uri, $.iri_reference),

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

		aria_attribute: $ =>
			prec(
				2,
				seq(
					field('name', $.aria_attribute_name),
					$._eq,
					field('value', $.aria_attribute_value),
				),
			),

		aria_attribute_name: _ =>
			choice(
				'aria-activedescendant',
				'aria-atomic',
				'aria-autocomplete',
				'aria-busy',
				'aria-checked',
				'aria-colcount',
				'aria-colindex',
				'aria-colspan',
				'aria-controls',
				'aria-current',
				'aria-describedby',
				'aria-details',
				'aria-disabled',
				'aria-dropeffect',
				'aria-errormessage',
				'aria-expanded',
				'aria-flowto',
				'aria-grabbed',
				'aria-haspopup',
				'aria-hidden',
				'aria-invalid',
				'aria-keyshortcuts',
				'aria-label',
				'aria-labelledby',
				'aria-level',
				'aria-live',
				'aria-modal',
				'aria-multiline',
				'aria-multiselectable',
				'aria-orientation',
				'aria-owns',
				'aria-placeholder',
				'aria-posinset',
				'aria-pressed',
				'aria-readonly',
				'aria-relevant',
				'aria-required',
				'aria-roledescription',
				'aria-rowcount',
				'aria-rowindex',
				'aria-rowspan',
				'aria-selected',
				'aria-setsize',
				'aria-sort',
				'aria-valuemax',
				'aria-valuemin',
				'aria-valuenow',
				'aria-valuetext',
			),

		aria_attribute_value: $ => quoted($.aria_token_list),

		aria_token_list: $ => seq($.aria_token, repeat(seq($.wsp, $.aria_token))),

		aria_token: _ => token(/[A-Za-z0-9_.:-]+/),

		animation_attribute: $ =>
			choice(
				$.accumulate_attribute,
				$.additive_attribute,
				$.attribute_name_attribute,
				$.begin_attribute,
				$.by_attribute,
				$.calc_mode_attribute,
				$.dur_attribute,
				$.end_attribute,
				$.from_attribute,
				$.key_points_attribute,
				$.key_splines_attribute,
				$.key_times_attribute,
				$.repeat_count_attribute,
				$.repeat_dur_attribute,
				$.restart_attribute,
				$.to_attribute,
				$.values_attribute,
			),

		accumulate_attribute: $ =>
			seq(
				field('name', $.accumulate_attribute_name),
				$._eq,
				field('value', $.accumulate_attribute_value),
			),

		accumulate_attribute_name: _ => 'accumulate',

		accumulate_attribute_value: $ => quoted($.accumulate_keyword),

		accumulate_keyword: _ => choice('none', 'sum'),

		additive_attribute: $ =>
			seq(
				field('name', $.additive_attribute_name),
				$._eq,
				field('value', $.additive_attribute_value),
			),

		additive_attribute_name: _ => 'additive',

		additive_attribute_value: $ => quoted($.additive_keyword),

		additive_keyword: _ => choice('replace', 'sum'),

		attribute_name_attribute: $ =>
			seq(
				field('name', $.attribute_name_attribute_name),
				$._eq,
				field('value', $.attribute_name_attribute_value),
			),

		attribute_name_attribute_name: _ => 'attributeName',

		attribute_name_attribute_value: $ => quoted($.name),

		begin_attribute: $ =>
			seq(
				field('name', $.begin_attribute_name),
				$._eq,
				field('value', $.begin_attribute_value),
			),

		begin_attribute_name: _ => 'begin',

		begin_attribute_value: $ => quoted($.timing_value_list),

		by_attribute: $ =>
			seq(
				field('name', $.by_attribute_name),
				$._eq,
				field('value', $.by_attribute_value),
			),

		by_attribute_name: _ => 'by',

		by_attribute_value: $ => quoted($.animation_value_expression),

		calc_mode_attribute: $ =>
			seq(
				field('name', $.calc_mode_attribute_name),
				$._eq,
				field('value', $.calc_mode_attribute_value),
			),

		calc_mode_attribute_name: _ => 'calcMode',

		calc_mode_attribute_value: $ => quoted($.calc_mode_keyword),

		calc_mode_keyword: _ => choice('discrete', 'linear', 'paced', 'spline'),

		dur_attribute: $ =>
			seq(
				field('name', $.dur_attribute_name),
				$._eq,
				field('value', $.dur_attribute_value),
			),

		dur_attribute_name: _ => 'dur',

		dur_attribute_value: $ => quoted($.clock_or_keyword),

		end_attribute: $ =>
			seq(
				field('name', $.end_attribute_name),
				$._eq,
				field('value', $.end_attribute_value),
			),

		end_attribute_name: _ => 'end',

		end_attribute_value: $ => quoted($.timing_value_list),

		from_attribute: $ =>
			seq(
				field('name', $.from_attribute_name),
				$._eq,
				field('value', $.from_attribute_value),
			),

		from_attribute_name: _ => 'from',

		from_attribute_value: $ => quoted($.animation_value_expression),

		key_points_attribute: $ =>
			seq(
				field('name', $.key_points_attribute_name),
				$._eq,
				field('value', $.key_points_attribute_value),
			),

		key_points_attribute_name: _ => 'keyPoints',

		key_points_attribute_value: $ => quoted($.semicolon_number_list),

		key_splines_attribute: $ =>
			seq(
				field('name', $.key_splines_attribute_name),
				$._eq,
				field('value', $.key_splines_attribute_value),
			),

		key_splines_attribute_name: _ => 'keySplines',

		key_splines_attribute_value: $ => quoted($.key_spline_list),

		key_times_attribute: $ =>
			seq(
				field('name', $.key_times_attribute_name),
				$._eq,
				field('value', $.key_times_attribute_value),
			),

		key_times_attribute_name: _ => 'keyTimes',

		key_times_attribute_value: $ => quoted($.semicolon_number_list),

		repeat_count_attribute: $ =>
			seq(
				field('name', $.repeat_count_attribute_name),
				$._eq,
				field('value', $.repeat_count_attribute_value),
			),

		repeat_count_attribute_name: _ => 'repeatCount',

		repeat_count_attribute_value: $ => quoted(choice($.number, 'indefinite')),

		repeat_dur_attribute: $ =>
			seq(
				field('name', $.repeat_dur_attribute_name),
				$._eq,
				field('value', $.repeat_dur_attribute_value),
			),

		repeat_dur_attribute_name: _ => 'repeatDur',

		repeat_dur_attribute_value: $ => quoted($.clock_or_keyword),

		restart_attribute: $ =>
			seq(
				field('name', $.restart_attribute_name),
				$._eq,
				field('value', $.restart_attribute_value),
			),

		restart_attribute_name: _ => 'restart',

		restart_attribute_value: $ => quoted($.restart_keyword),

		restart_keyword: _ => choice('always', 'whenNotActive', 'never'),

		to_attribute: $ =>
			seq(
				field('name', $.to_attribute_name),
				$._eq,
				field('value', $.to_attribute_value),
			),

		to_attribute_name: _ => 'to',

		to_attribute_value: $ => quoted($.animation_value_expression),

		values_attribute: $ =>
			seq(
				field('name', $.values_attribute_name),
				$._eq,
				field('value', $.values_attribute_value),
			),

		values_attribute_name: _ => 'values',

		values_attribute_value: $ => quoted($.animation_value_list),

		timing_value_list: $ =>
			seq(
				$.timing_value,
				repeat(seq(optional($.wsp), ';', optional($.wsp), $.timing_value)),
				optional(seq(optional($.wsp), ';')),
			),

		timing_value: $ => choice($.clock_value, 'indefinite', $.timing_event_value),

		clock_or_keyword: $ => choice($.clock_value, 'media', 'indefinite'),

		clock_value: _ => token(/[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:h|min|s|ms)?/),

		timing_event_value: _ => token(/[^;"']+/),

		animation_value_expression: _ => token(/[^;"']+/),

		animation_value_list: $ =>
			seq(
				$.animation_value_expression,
				repeat(seq(optional($.wsp), ';', optional($.wsp), $.animation_value_expression)),
				optional(seq(optional($.wsp), ';')),
			),

		semicolon_number_list: $ =>
			seq(
				$.number,
				repeat(seq(optional($.wsp), ';', optional($.wsp), $.number)),
			),

		key_spline_list: $ =>
			seq(
				$.key_spline,
				repeat(seq(optional($.wsp), ';', optional($.wsp), $.key_spline)),
			),

		key_spline: $ =>
			seq(
				$.number,
				$.comma_wsp,
				$.number,
				$.comma_wsp,
				$.number,
				$.comma_wsp,
				$.number,
			),

		filter_effect_attribute: $ =>
			choice(
				$.filter_number_attribute,
				$.filter_pair_number_attribute,
				$.filter_integer_attribute,
				$.filter_order_attribute,
				$.filter_number_list_attribute,
				$.filter_input_attribute,
				$.filter_result_attribute,
				$.filter_edge_mode_attribute,
				$.filter_stitch_tiles_attribute,
				$.filter_operator_attribute,
				$.filter_preserve_alpha_attribute,
				$.filter_channel_selector_attribute,
			),

		filter_number_attribute: $ =>
			seq(
				field('name', $.filter_number_attribute_name),
				$._eq,
				field('value', $.filter_number_attribute_value),
			),

		filter_number_attribute_name: _ =>
			choice(
				'amplitude',
				'azimuth',
				'bias',
				'diffuseConstant',
				'divisor',
				'elevation',
				'exponent',
				'intercept',
				'k1',
				'k2',
				'k3',
				'k4',
				'limitingConeAngle',
				'scale',
				'seed',
				'slope',
				'specularConstant',
				'specularExponent',
				'surfaceScale',
			),

		filter_number_attribute_value: $ => quoted($.number),

		filter_pair_number_attribute: $ =>
			seq(
				field('name', $.filter_pair_number_attribute_name),
				$._eq,
				field('value', $.filter_pair_number_attribute_value),
			),

		filter_pair_number_attribute_name: _ =>
			choice(
				'baseFrequency',
				'kernelUnitLength',
				'radius',
				'stdDeviation',
			),

		filter_pair_number_attribute_value: $ => quoted(choice($.number, $.number_pair)),

		filter_integer_attribute: $ =>
			seq(
				field('name', $.filter_integer_attribute_name),
				$._eq,
				field('value', $.filter_integer_attribute_value),
			),

		filter_integer_attribute_name: _ =>
			choice(
				'numOctaves',
				'targetX',
				'targetY',
			),

		filter_integer_attribute_value: $ => quoted($.integer),

		filter_order_attribute: $ =>
			seq(
				field('name', $.filter_order_attribute_name),
				$._eq,
				field('value', $.filter_order_attribute_value),
			),

		filter_order_attribute_name: _ => 'order',

		filter_order_attribute_value: $ => quoted(choice($.integer, $.integer_pair)),

		filter_number_list_attribute: $ =>
			seq(
				field('name', $.filter_number_list_attribute_name),
				$._eq,
				field('value', $.filter_number_list_attribute_value),
			),

		filter_number_list_attribute_name: _ => choice('kernelMatrix', 'tableValues'),

		filter_number_list_attribute_value: $ => quoted($.number_list),

		filter_input_attribute: $ =>
			seq(
				field('name', $.filter_input_attribute_name),
				$._eq,
				field('value', $.filter_input_attribute_value),
			),

		filter_input_attribute_name: _ => choice('in', 'in2'),

		filter_input_attribute_value: $ => quoted($.filter_input_value),

		filter_input_value: $ =>
			choice(
				'SourceGraphic',
				'SourceAlpha',
				'BackgroundImage',
				'BackgroundAlpha',
				'FillPaint',
				'StrokePaint',
				$.id_token,
			),

		filter_result_attribute: $ =>
			seq(
				field('name', $.filter_result_attribute_name),
				$._eq,
				field('value', $.filter_result_attribute_value),
			),

		filter_result_attribute_name: _ => 'result',

		filter_result_attribute_value: $ => quoted($.id_token),

		filter_edge_mode_attribute: $ =>
			seq(
				field('name', $.filter_edge_mode_attribute_name),
				$._eq,
				field('value', $.filter_edge_mode_attribute_value),
			),

		filter_edge_mode_attribute_name: _ => 'edgeMode',

		filter_edge_mode_attribute_value: $ => quoted(choice('duplicate', 'wrap', 'none')),

		filter_stitch_tiles_attribute: $ =>
			seq(
				field('name', $.filter_stitch_tiles_attribute_name),
				$._eq,
				field('value', $.filter_stitch_tiles_attribute_value),
			),

		filter_stitch_tiles_attribute_name: _ => 'stitchTiles',

		filter_stitch_tiles_attribute_value: $ => quoted(choice('stitch', 'noStitch')),

		filter_operator_attribute: $ =>
			seq(
				field('name', $.filter_operator_attribute_name),
				$._eq,
				field('value', $.filter_operator_attribute_value),
			),

		filter_operator_attribute_name: _ => 'operator',

		filter_operator_attribute_value: $ =>
			quoted(choice('over', 'in', 'out', 'atop', 'xor', 'lighter', 'arithmetic', 'erode', 'dilate')),

		filter_preserve_alpha_attribute: $ =>
			seq(
				field('name', $.filter_preserve_alpha_attribute_name),
				$._eq,
				field('value', $.filter_preserve_alpha_attribute_value),
			),

		filter_preserve_alpha_attribute_name: _ => 'preserveAlpha',

		filter_preserve_alpha_attribute_value: $ => quoted(choice('true', 'false')),

		filter_channel_selector_attribute: $ =>
			seq(
				field('name', $.filter_channel_selector_attribute_name),
				$._eq,
				field('value', $.filter_channel_selector_attribute_value),
			),

		filter_channel_selector_attribute_name: _ => choice('xChannelSelector', 'yChannelSelector'),

		filter_channel_selector_attribute_value: $ => quoted(choice('R', 'G', 'B', 'A')),

		text_layout_attribute: $ =>
			choice(
				$.text_length_list_attribute,
				$.alignment_baseline_attribute,
				$.baseline_shift_attribute,
				$.direction_attribute,
				$.dominant_baseline_attribute,
				$.font_family_attribute,
				$.font_size_adjust_attribute,
				$.font_stretch_attribute,
				$.font_style_attribute,
				$.font_variant_attribute,
				$.font_weight_attribute,
				$.glyph_orientation_attribute,
				$.length_adjust_attribute,
				$.letter_word_spacing_attribute,
				$.method_attribute,
				$.side_attribute,
				$.spacing_attribute,
				$.text_anchor_attribute,
				$.text_decoration_attribute,
				$.unicode_bidi_attribute,
				$.writing_mode_attribute,
			),

		text_length_list_attribute: $ =>
			seq(
				field('name', $.text_length_list_attribute_name),
				$._eq,
				field('value', $.text_length_list_attribute_value),
			),

		text_length_list_attribute_name: _ => choice('dx', 'dy', 'rotate'),

		text_length_list_attribute_value: $ => quoted($.number_or_length_or_percentage_list),

		alignment_baseline_attribute: $ =>
			seq(
				field('name', $.alignment_baseline_attribute_name),
				$._eq,
				field('value', $.alignment_baseline_attribute_value),
			),

		alignment_baseline_attribute_name: _ => 'alignment-baseline',

		alignment_baseline_attribute_value: $ =>
			quoted(
				choice(
					'auto',
					'baseline',
					'before-edge',
					'text-before-edge',
					'middle',
					'central',
					'after-edge',
					'text-after-edge',
					'ideographic',
					'alphabetic',
					'hanging',
					'mathematical',
					'inherit',
				),
			),

		baseline_shift_attribute: $ =>
			seq(
				field('name', $.baseline_shift_attribute_name),
				$._eq,
				field('value', $.baseline_shift_attribute_value),
			),

		baseline_shift_attribute_name: _ => 'baseline-shift',

		baseline_shift_attribute_value: $ => quoted(choice('baseline', 'sub', 'super', $.length_or_percentage, 'inherit')),

		direction_attribute: $ =>
			seq(
				field('name', $.direction_attribute_name),
				$._eq,
				field('value', $.direction_attribute_value),
			),

		direction_attribute_name: _ => 'direction',

		direction_attribute_value: $ => quoted(choice('ltr', 'rtl', 'inherit')),

		dominant_baseline_attribute: $ =>
			seq(
				field('name', $.dominant_baseline_attribute_name),
				$._eq,
				field('value', $.dominant_baseline_attribute_value),
			),

		dominant_baseline_attribute_name: _ => 'dominant-baseline',

		dominant_baseline_attribute_value: $ =>
			quoted(
				choice(
					'auto',
					'use-script',
					'no-change',
					'reset-size',
					'ideographic',
					'alphabetic',
					'hanging',
					'mathematical',
					'central',
					'middle',
					'text-after-edge',
					'text-before-edge',
					'inherit',
				),
			),

		font_family_attribute: $ =>
			seq(
				field('name', $.font_family_attribute_name),
				$._eq,
				field('value', $.font_family_attribute_value),
			),

		font_family_attribute_name: _ => 'font-family',

		font_family_attribute_value: $ => quoted($.raw_text),

		font_size_adjust_attribute: $ =>
			seq(
				field('name', $.font_size_adjust_attribute_name),
				$._eq,
				field('value', $.font_size_adjust_attribute_value),
			),

		font_size_adjust_attribute_name: _ => 'font-size-adjust',

		font_size_adjust_attribute_value: $ => quoted(choice('none', $.number, 'inherit')),

		font_stretch_attribute: $ =>
			seq(
				field('name', $.font_stretch_attribute_name),
				$._eq,
				field('value', $.font_stretch_attribute_value),
			),

		font_stretch_attribute_name: _ => 'font-stretch',

		font_stretch_attribute_value: $ =>
			quoted(
				choice(
					'normal',
					'wider',
					'narrower',
					'ultra-condensed',
					'extra-condensed',
					'condensed',
					'semi-condensed',
					'semi-expanded',
					'expanded',
					'extra-expanded',
					'ultra-expanded',
					'inherit',
				),
			),

		font_style_attribute: $ =>
			seq(
				field('name', $.font_style_attribute_name),
				$._eq,
				field('value', $.font_style_attribute_value),
			),

		font_style_attribute_name: _ => 'font-style',

		font_style_attribute_value: $ => quoted(choice('normal', 'italic', 'oblique', 'inherit')),

		font_variant_attribute: $ =>
			seq(
				field('name', $.font_variant_attribute_name),
				$._eq,
				field('value', $.font_variant_attribute_value),
			),

		font_variant_attribute_name: _ => 'font-variant',

		font_variant_attribute_value: $ => quoted(choice('normal', 'small-caps', 'inherit')),

		font_weight_attribute: $ =>
			seq(
				field('name', $.font_weight_attribute_name),
				$._eq,
				field('value', $.font_weight_attribute_value),
			),

		font_weight_attribute_name: _ => 'font-weight',

		font_weight_attribute_value: $ =>
			quoted(
				choice(
					'normal',
					'bold',
					'bolder',
					'lighter',
					'100',
					'200',
					'300',
					'400',
					'500',
					'600',
					'700',
					'800',
					'900',
					'inherit',
				),
			),

		glyph_orientation_attribute: $ =>
			seq(
				field('name', $.glyph_orientation_attribute_name),
				$._eq,
				field('value', $.glyph_orientation_attribute_value),
			),

		glyph_orientation_attribute_name: _ => choice('glyph-orientation-horizontal', 'glyph-orientation-vertical'),

		glyph_orientation_attribute_value: $ => quoted(choice($.angle, 'auto')),

		length_adjust_attribute: $ =>
			seq(
				field('name', $.length_adjust_attribute_name),
				$._eq,
				field('value', $.length_adjust_attribute_value),
			),

		length_adjust_attribute_name: _ => 'lengthAdjust',

		length_adjust_attribute_value: $ => quoted(choice('spacing', 'spacingAndGlyphs')),

		letter_word_spacing_attribute: $ =>
			seq(
				field('name', $.letter_word_spacing_attribute_name),
				$._eq,
				field('value', $.letter_word_spacing_attribute_value),
			),

		letter_word_spacing_attribute_name: _ => choice('letter-spacing', 'word-spacing'),

		letter_word_spacing_attribute_value: $ => quoted(choice('normal', $.length, 'inherit')),

		method_attribute: $ =>
			seq(
				field('name', $.method_attribute_name),
				$._eq,
				field('value', $.method_attribute_value),
			),

		method_attribute_name: _ => 'method',

		method_attribute_value: $ => quoted(choice('align', 'stretch')),

		side_attribute: $ =>
			seq(
				field('name', $.side_attribute_name),
				$._eq,
				field('value', $.side_attribute_value),
			),

		side_attribute_name: _ => 'side',

		side_attribute_value: $ => quoted(choice('left', 'right')),

		spacing_attribute: $ =>
			seq(
				field('name', $.spacing_attribute_name),
				$._eq,
				field('value', $.spacing_attribute_value),
			),

		spacing_attribute_name: _ => 'spacing',

		spacing_attribute_value: $ => quoted(choice('auto', 'exact')),

		text_anchor_attribute: $ =>
			seq(
				field('name', $.text_anchor_attribute_name),
				$._eq,
				field('value', $.text_anchor_attribute_value),
			),

		text_anchor_attribute_name: _ => 'text-anchor',

		text_anchor_attribute_value: $ => quoted(choice('start', 'middle', 'end', 'inherit')),

		text_decoration_attribute: $ =>
			seq(
				field('name', $.text_decoration_attribute_name),
				$._eq,
				field('value', $.text_decoration_attribute_value),
			),

		text_decoration_attribute_name: _ => 'text-decoration',

		text_decoration_attribute_value: $ => quoted($.raw_text),

		unicode_bidi_attribute: $ =>
			seq(
				field('name', $.unicode_bidi_attribute_name),
				$._eq,
				field('value', $.unicode_bidi_attribute_value),
			),

		unicode_bidi_attribute_name: _ => 'unicode-bidi',

		unicode_bidi_attribute_value: $ =>
			quoted(choice('normal', 'embed', 'bidi-override', 'isolate', 'isolate-override', 'plaintext', 'inherit')),

		writing_mode_attribute: $ =>
			seq(
				field('name', $.writing_mode_attribute_name),
				$._eq,
				field('value', $.writing_mode_attribute_value),
			),

		writing_mode_attribute_name: _ => 'writing-mode',

		writing_mode_attribute_value: $ =>
			quoted(
				choice('horizontal-tb', 'vertical-rl', 'vertical-lr', 'lr', 'lr-tb', 'rl', 'rl-tb', 'tb', 'tb-rl', 'inherit'),
			),

		coord_system_attribute: $ =>
			choice(
				$.units_attribute,
				$.marker_units_attribute,
				$.spread_method_attribute,
				$.orient_attribute,
				$.zoom_and_pan_attribute,
				$.fr_attribute,
				$.origin_attribute,
			),

		units_attribute: $ =>
			seq(
				field('name', $.units_attribute_name),
				$._eq,
				field('value', $.units_attribute_value),
			),

		units_attribute_name: _ =>
			choice(
				'clipPathUnits',
				'filterUnits',
				'gradientUnits',
				'maskContentUnits',
				'maskUnits',
				'patternContentUnits',
				'patternUnits',
				'primitiveUnits',
			),

		units_attribute_value: $ => quoted(choice('userSpaceOnUse', 'objectBoundingBox')),

		marker_units_attribute: $ =>
			seq(
				field('name', $.marker_units_attribute_name),
				$._eq,
				field('value', $.marker_units_attribute_value),
			),

		marker_units_attribute_name: _ => 'markerUnits',

		marker_units_attribute_value: $ => quoted(choice('strokeWidth', 'userSpaceOnUse')),

		spread_method_attribute: $ =>
			seq(
				field('name', $.spread_method_attribute_name),
				$._eq,
				field('value', $.spread_method_attribute_value),
			),

		spread_method_attribute_name: _ => 'spreadMethod',

		spread_method_attribute_value: $ => quoted(choice('pad', 'reflect', 'repeat')),

		orient_attribute: $ =>
			seq(
				field('name', $.orient_attribute_name),
				$._eq,
				field('value', $.orient_attribute_value),
			),

		orient_attribute_name: _ => 'orient',

		orient_attribute_value: $ => quoted(choice('auto', 'auto-start-reverse', $.angle)),

		zoom_and_pan_attribute: $ =>
			seq(
				field('name', $.zoom_and_pan_attribute_name),
				$._eq,
				field('value', $.zoom_and_pan_attribute_value),
			),

		zoom_and_pan_attribute_name: _ => 'zoomAndPan',

		zoom_and_pan_attribute_value: $ => quoted(choice('disable', 'magnify')),

		fr_attribute: $ =>
			seq(
				field('name', $.fr_attribute_name),
				$._eq,
				field('value', $.fr_attribute_value),
			),

		fr_attribute_name: _ => 'fr',

		fr_attribute_value: $ => quoted($.number_or_percentage),

		origin_attribute: $ =>
			seq(
				field('name', $.origin_attribute_name),
				$._eq,
				field('value', $.origin_attribute_value),
			),

		origin_attribute_name: _ => 'origin',

		origin_attribute_value: $ => quoted($.raw_text),

		linking_media_attribute: $ =>
			choice(
				$.crossorigin_attribute,
				$.download_attribute,
				$.hreflang_attribute,
				$.media_attribute,
				$.ping_attribute,
				$.referrerpolicy_attribute,
				$.rel_attribute,
				$.target_attribute,
			),

		crossorigin_attribute: $ =>
			seq(
				field('name', $.crossorigin_attribute_name),
				$._eq,
				field('value', $.crossorigin_attribute_value),
			),

		crossorigin_attribute_name: _ => 'crossorigin',

		crossorigin_attribute_value: $ => quoted(choice('anonymous', 'use-credentials')),

		download_attribute: $ =>
			seq(
				field('name', $.download_attribute_name),
				$._eq,
				field('value', $.download_attribute_value),
			),

		download_attribute_name: _ => 'download',

		download_attribute_value: $ => quoted($.raw_text),

		hreflang_attribute: $ =>
			seq(
				field('name', $.hreflang_attribute_name),
				$._eq,
				field('value', $.hreflang_attribute_value),
			),

		hreflang_attribute_name: _ => 'hreflang',

		hreflang_attribute_value: $ => quoted($.language_tag),

		media_attribute: $ =>
			seq(
				field('name', $.media_attribute_name),
				$._eq,
				field('value', $.media_attribute_value),
			),

		media_attribute_name: _ => 'media',

		media_attribute_value: $ => quoted($.raw_text),

		ping_attribute: $ =>
			seq(
				field('name', $.ping_attribute_name),
				$._eq,
				field('value', $.ping_attribute_value),
			),

		ping_attribute_name: _ => 'ping',

		ping_attribute_value: $ => quoted($.iri_reference_list),

		referrerpolicy_attribute: $ =>
			seq(
				field('name', $.referrerpolicy_attribute_name),
				$._eq,
				field('value', $.referrerpolicy_attribute_value),
			),

		referrerpolicy_attribute_name: _ => 'referrerpolicy',

		referrerpolicy_attribute_value: $ =>
			quoted(
				choice(
					'no-referrer',
					'no-referrer-when-downgrade',
					'same-origin',
					'origin',
					'strict-origin',
					'origin-when-cross-origin',
					'strict-origin-when-cross-origin',
					'unsafe-url',
				),
			),

		rel_attribute: $ =>
			seq(
				field('name', $.rel_attribute_name),
				$._eq,
				field('value', $.rel_attribute_value),
			),

		rel_attribute_name: _ => 'rel',

		rel_attribute_value: $ => quoted($.raw_text),

		target_attribute: $ =>
			seq(
				field('name', $.target_attribute_name),
				$._eq,
				field('value', $.target_attribute_value),
			),

		target_attribute_name: _ => 'target',

		target_attribute_value: $ => quoted(choice('_self', '_parent', '_top', '_blank', $.id_token)),

		color_rendering_misc_attribute: $ =>
			choice(
				$.clip_attribute,
				$.color_interpolation_attribute,
				$.color_interpolation_filters_attribute,
				$.image_rendering_attribute,
			),

		clip_attribute: $ =>
			seq(
				field('name', $.clip_attribute_name),
				$._eq,
				field('value', $.clip_attribute_value),
			),

		clip_attribute_name: _ => 'clip',

		clip_attribute_value: $ => quoted(choice('auto', 'none', $.raw_text)),

		color_interpolation_attribute: $ =>
			seq(
				field('name', $.color_interpolation_attribute_name),
				$._eq,
				field('value', $.color_interpolation_attribute_value),
			),

		color_interpolation_attribute_name: _ => 'color-interpolation',

		color_interpolation_attribute_value: $ => quoted(choice('auto', 'sRGB', 'linearRGB', 'inherit')),

		color_interpolation_filters_attribute: $ =>
			seq(
				field('name', $.color_interpolation_filters_attribute_name),
				$._eq,
				field('value', $.color_interpolation_filters_attribute_value),
			),

		color_interpolation_filters_attribute_name: _ => 'color-interpolation-filters',

		color_interpolation_filters_attribute_value: $ => quoted(choice('auto', 'sRGB', 'linearRGB', 'inherit')),

		image_rendering_attribute: $ =>
			seq(
				field('name', $.image_rendering_attribute_name),
				$._eq,
				field('value', $.image_rendering_attribute_value),
			),

		image_rendering_attribute_name: _ => 'image-rendering',

		image_rendering_attribute_value: $ =>
			quoted(choice('auto', 'optimizeSpeed', 'optimizeQuality', 'crisp-edges', 'pixelated', 'inherit')),

		other_regular_attribute: $ =>
			choice(
				$.max_attribute,
				$.min_attribute,
				$.mode_attribute,
				$.offset_attribute,
				$.paint_order_attribute,
				$.path_data_attribute,
				$.playbackorder_attribute,
				$.points_at_attribute,
				$.required_extensions_attribute,
				$.role_attribute,
				$.system_language_attribute,
				$.timelinebegin_attribute,
				$.title_attribute,
				$.z_attribute,
			),

		max_attribute: $ =>
			seq(
				field('name', $.max_attribute_name),
				$._eq,
				field('value', $.max_attribute_value),
			),

		max_attribute_name: _ => 'max',

		max_attribute_value: $ => quoted(choice($.number, $.clock_value)),

		min_attribute: $ =>
			seq(
				field('name', $.min_attribute_name),
				$._eq,
				field('value', $.min_attribute_value),
			),

		min_attribute_name: _ => 'min',

		min_attribute_value: $ => quoted(choice($.number, $.clock_value)),

		mode_attribute: $ =>
			seq(
				field('name', $.mode_attribute_name),
				$._eq,
				field('value', $.mode_attribute_value),
			),

		mode_attribute_name: _ => 'mode',

		mode_attribute_value: $ =>
			quoted(choice('normal', 'multiply', 'screen', 'darken', 'lighten', 'hue', 'saturate', 'color', 'luminosity')),

		offset_attribute: $ =>
			seq(
				field('name', $.offset_attribute_name),
				$._eq,
				field('value', $.offset_attribute_value),
			),

		offset_attribute_name: _ => 'offset',

		offset_attribute_value: $ => quoted($.number_or_percentage),

		paint_order_attribute: $ =>
			seq(
				field('name', $.paint_order_attribute_name),
				$._eq,
				field('value', $.paint_order_attribute_value),
			),

		paint_order_attribute_name: _ => 'paint-order',

		paint_order_attribute_value: $ => quoted(choice('normal', $.paint_order_list)),

		paint_order_list: $ => seq($.paint_order_item, repeat(seq($.wsp, $.paint_order_item))),

		paint_order_item: _ => choice('fill', 'stroke', 'markers'),

		path_data_attribute: $ =>
			seq(
				field('name', $.path_data_attribute_name),
				$._eq,
				field('value', $.path_data_attribute_value),
			),

		path_data_attribute_name: _ => 'path',

		path_data_attribute_value: $ =>
			choice(
				seq('"', optional($.path_data_content), '"'),
				seq("'", optional($.path_data_content), "'"),
			),

		playbackorder_attribute: $ =>
			seq(
				field('name', $.playbackorder_attribute_name),
				$._eq,
				field('value', $.playbackorder_attribute_value),
			),

		playbackorder_attribute_name: _ => 'playbackorder',

		playbackorder_attribute_value: $ => quoted(choice('forward', 'reverse')),

		points_at_attribute: $ =>
			seq(
				field('name', $.points_at_attribute_name),
				$._eq,
				field('value', $.points_at_attribute_value),
			),

		points_at_attribute_name: _ => choice('pointsAtX', 'pointsAtY', 'pointsAtZ'),

		points_at_attribute_value: $ => quoted($.number),

		required_extensions_attribute: $ =>
			seq(
				field('name', $.required_extensions_attribute_name),
				$._eq,
				field('value', $.required_extensions_attribute_value),
			),

		required_extensions_attribute_name: _ => 'requiredExtensions',

		required_extensions_attribute_value: $ => quoted($.iri_reference_list),

		role_attribute: $ =>
			seq(
				field('name', $.role_attribute_name),
				$._eq,
				field('value', $.role_attribute_value),
			),

		role_attribute_name: _ => 'role',

		role_attribute_value: $ => quoted($.raw_text),

		system_language_attribute: $ =>
			seq(
				field('name', $.system_language_attribute_name),
				$._eq,
				field('value', $.system_language_attribute_value),
			),

		system_language_attribute_name: _ => 'systemLanguage',

		system_language_attribute_value: $ => quoted($.language_tag_list),

		timelinebegin_attribute: $ =>
			seq(
				field('name', $.timelinebegin_attribute_name),
				$._eq,
				field('value', $.timelinebegin_attribute_value),
			),

		timelinebegin_attribute_name: _ => 'timelinebegin',

		timelinebegin_attribute_value: $ => quoted($.timing_event_value),

		title_attribute: $ =>
			seq(
				field('name', $.title_attribute_name),
				$._eq,
				field('value', $.title_attribute_value),
			),

		title_attribute_name: _ => choice('title', 'xlink:title'),

		title_attribute_value: $ => quoted($.raw_text),

		z_attribute: $ =>
			seq(
				field('name', $.z_attribute_name),
				$._eq,
				field('value', $.z_attribute_value),
			),

		z_attribute_name: _ => 'z',

		z_attribute_value: $ => quoted($.number),

		number_or_length_or_percentage: $ => choice($.length, $.percentage),

		number_or_length_or_percentage_list: $ =>
			seq(
				$.number_or_length_or_percentage,
				repeat(seq($.comma_wsp, $.number_or_length_or_percentage)),
			),

		number_pair: $ => seq($.number, $.comma_wsp, $.number),

		integer_pair: $ => seq($.integer, $.comma_wsp, $.integer),

		number_list: $ => seq($.number, repeat(seq($.comma_wsp, $.number))),

		integer: _ => token(/[+-]?[0-9]+/),

		angle: $ => seq($.number, optional(choice('deg', 'grad', 'rad', 'turn'))),

		language_tag_list: $ => seq($.language_tag, repeat(seq($.comma_wsp, $.language_tag))),

		iri_reference_list: $ => seq($.iri_reference, repeat(seq($.wsp, $.iri_reference))),

		raw_text: _ => token(/[^"']+/),

		mime_type: _ => token(/[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+/),

		data_uri: $ =>
			seq(
				'data:',
				optional(field('media_type', $.data_uri_media_type)),
				repeat(field('parameter', $.data_uri_parameter)),
				optional(field('encoding', $.data_uri_encoding)),
				',',
				optional(field('payload', $.data_uri_payload)),
			),

		data_uri_media_type: $ => $.mime_type,

		data_uri_parameter: $ =>
			seq(
				';',
				field('name', $.data_uri_parameter_name),
				optional(seq('=', field('value', $.data_uri_parameter_value))),
			),

		data_uri_parameter_name: _ => token(/[A-Za-z0-9!#$&^_.+-]+/),

		data_uri_parameter_value: _ => token(/[^;,"'&<]+/),

		data_uri_encoding: _ => token(prec(1, /;[Bb][Aa][Ss][Ee]64/)),

		data_uri_payload: _ => token(/[^"'&<]+/),

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
