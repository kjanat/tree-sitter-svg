import { describe, expect, test } from "bun:test";

import { runHarnessDetailed, strictRootOnlyCandidate } from "./regex_harness";

type TestEach = (cases: readonly string[]) => (name: string, fn: (file: string) => void | Promise<void>) => void;

const testEach: TestEach = cases => {
	const withEach = test as unknown as { each: TestEach };
	return withEach.each.call(test, cases);
};

function pct(value: number): string {
	return `${(value * 100).toFixed(1)}%`;
}

describe("regex harness", () => {
	test("compare current vs stricter candidate", async () => {
		const results = await runHarnessDetailed([strictRootOnlyCandidate]);
		expect(results.length).toBe(2);

		for (const result of results) {
			console.log(`\\n[${result.candidate.name}]`);
			console.log(
				`either TP=${result.either.tp} FP=${result.either.fp} TN=${result.either.tn} FN=${result.either.fn} ` +
					`precision=${pct(result.either.precision)} recall=${pct(result.either.recall)} ` +
					`specificity=${pct(result.either.specificity)} accuracy=${pct(result.either.accuracy)}`,
			);
			console.log(`either FP files: ${result.falsePositivesEither.join(", ") || "(none)"}`);
			console.log(`either FN files: ${result.falseNegativesEither.join(", ") || "(none)"}`);
		}

		const current = results.find(result => result.candidate.name === "current");
		const strict = results.find(result => result.candidate.name === "strict_root_only");

		expect(current).toBeDefined();
		expect(strict).toBeDefined();

		if (current === undefined || strict === undefined) {
			throw new Error("missing expected candidates in results");
		}

		expect(strict.either.fp).toBeLessThan(current.either.fp);
		expect(strict.either.fn).toBeLessThanOrEqual(current.either.fn);
	});

	describe("per-sample strict candidate", () => {
		const strictResultsPromise = runHarnessDetailed([strictRootOnlyCandidate]);
		const sampleFiles = [
			"svg_plain.svg",
			"svg_namespaced.xml",
			"svg_xml_decl.xml",
			"svg_comment_first.xml",
			"svg_doctype.xml",
			"svg_ws_then_root.xml",
			"svg_prefix_decl.xml",
			"svg_comment_decl_then_root.xml",
			"html_doctype.html",
			"html_inline_svg.html",
			"xhtml_inline_svg.xhtml",
			"xml_note_decl.xml",
			"xml_note_comment.xml",
			"xml_pi_book.xml",
			"ttml_doc.ttml",
			"rss_doc.xml",
			"doc.json",
			"doc.yaml",
			"text_with_svg_word.txt",
			"xml_svgish.xml",
			"xml_prefix_svgish.xml",
			"mathml.xml",
			"doctype_svg_but_not_root.xml",
			"uppercase_svg_root.xml",
		] as const;

		test("all samples covered", async () => {
			const results = await strictResultsPromise;
			const strict = results.find(result => result.candidate.name === "strict_root_only");
			expect(strict).toBeDefined();
			if (strict === undefined) {
				throw new Error("strict candidate missing");
			}
			expect(strict.samples.length).toBe(sampleFiles.length);
		});

		testEach(sampleFiles)("strict either match: %s", async file => {
				const results = await strictResultsPromise;
				const strict = results.find(result => result.candidate.name === "strict_root_only");
				expect(strict).toBeDefined();
				if (strict === undefined) {
					throw new Error("strict candidate missing");
				}

				const sample = strict.samples.find(entry => entry.file === file);
				expect(sample).toBeDefined();
				if (sample === undefined) {
					throw new Error(`sample missing: ${file}`);
				}

				expect(sample.eitherMatch).toBe(sample.expectedSvg);
			});
	});
});
