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

	extras: () => [],

	rules: {
		source_file: $ => repeat($._node),

		_node: $ =>
			choice(
				$.xml_declaration,
				$.doctype,
				$.processing_instruction,
				$.comment,
				$.element,
				$.cdata_section,
				$.entity_reference,
				$.text,
			),

		element: $ =>
			choice(
				$.self_closing_tag,
				seq($.start_tag, repeat($._content), $.end_tag),
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
				'<?xml',
				repeat1(seq($._s, $.attribute)),
				optional($._s),
				'?>',
			),

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
				field('target', $.name),
				optional(seq($._s, field('content', $.pi_content))),
				'?>',
			),

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
				field('name', $.name),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'>',
			),

		self_closing_tag: $ =>
			seq(
				'<',
				field('name', $.name),
				repeat(seq($._s, $.attribute)),
				optional($._s),
				'/>',
			),

		end_tag: $ =>
			seq(
				'</',
				field('name', $.name),
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
			repeat1(choice(
				$.path_command,
				$.path_number,
				$.path_comma,
				$.path_wsp,
			)),

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
				optional(seq('=', field('value', $._attribute_value))),
			),

		attribute_name: _ => token(/[A-Za-z_:][A-Za-z0-9_.:-]*/),

		_attribute_value: $ =>
			choice(
				$.quoted_attribute_value,
				$.unquoted_attribute_value,
			),

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

		unquoted_attribute_value: $ =>
			repeat1(choice(
				$.entity_reference,
				$.unquoted_attribute_text,
			)),

		unquoted_attribute_text: _ => token(/[^<>&"'\s=]+/),

		entity_reference: _ => token(/&(#x[0-9A-Fa-f]+|#[0-9]+|[A-Za-z_:][A-Za-z0-9_.:-]*);/),

		text: _ => token(prec(-1, /[^<&]+/)),

		name: _ => token(/[A-Za-z_:][A-Za-z0-9_.:-]*/),

		_s: _ => token(/[ \t\r\n]+/),
	},
});
