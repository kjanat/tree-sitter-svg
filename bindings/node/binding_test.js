import assert from 'node:assert';
import { test } from 'node:test';
import Parser from 'tree-sitter';

test('can load grammar', async () => {
	const parser = new Parser();
	const { default: language } = await import('./index.js');
	parser.setLanguage(language);

	assert.equal(typeof language.HIGHLIGHTS_QUERY, 'string');
	assert.equal(typeof language.INJECTIONS_QUERY, 'string');
	assert.equal(typeof language.LOCALS_QUERY, 'string');
	assert.equal(typeof language.TAGS_QUERY, 'string');
});
