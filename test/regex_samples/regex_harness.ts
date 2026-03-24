declare const Bun: {
	file(path: string | URL): {
		text(): Promise<string>;
	};
};

type JsonObject = Record<string, unknown>;

export type Candidate = {
	name: string;
	firstLineRegex: string;
	contentRegex: string;
};

export type Sample = {
	file: string;
	kind: string;
	expectedSvg: boolean;
	content: string;
	firstLine: string;
};

export type Confusion = {
	tp: number;
	fp: number;
	tn: number;
	fn: number;
};

export type Metrics = Confusion & {
	precision: number;
	recall: number;
	specificity: number;
	accuracy: number;
};

export type CandidateResult = {
	candidate: Candidate;
	firstLine: Metrics;
	content: Metrics;
	either: Metrics;
	falsePositivesEither: string[];
	falseNegativesEither: string[];
};

export type SampleMatch = {
	file: string;
	kind: string;
	expectedSvg: boolean;
	firstLineMatch: boolean;
	contentMatch: boolean;
	eitherMatch: boolean;
};

export type CandidateResultDetailed = CandidateResult & {
	samples: SampleMatch[];
};

type ManifestEntry = {
	file: string;
	kind: string;
	expectedSvg: boolean;
};

function isObject(value: unknown): value is JsonObject {
	return typeof value === "object" && value !== null;
}

async function readJson(path: string | URL): Promise<unknown> {
	const raw = await Bun.file(path).text();
	return JSON.parse(raw);
}

function toManifestEntry(value: unknown): ManifestEntry {
	if (!isObject(value)) {
		throw new Error("manifest entry must be object");
	}

	const file = value.file;
	const kind = value.kind;
	const expectedSvg = value.expected_svg;

	if (typeof file !== "string" || typeof kind !== "string" || typeof expectedSvg !== "boolean") {
		throw new Error("manifest entry must contain file:string, kind:string, expected_svg:boolean");
	}

	return { file, kind, expectedSvg };
}

async function getSvgGrammarConfig(configPath: URL): Promise<Candidate> {
	const config = await readJson(configPath);
	if (!isObject(config)) {
		throw new Error("tree-sitter.json root must be object");
	}

	const grammars = config.grammars;
	if (!Array.isArray(grammars)) {
		throw new Error("tree-sitter.json missing grammars array");
	}

	for (const grammar of grammars) {
		if (!isObject(grammar)) {
			continue;
		}

		const name = grammar.name;
		if (name !== "svg") {
			continue;
		}

		const firstLineRegex = grammar["first-line-regex"];
		const contentRegex = grammar["content-regex"];

		if (typeof firstLineRegex !== "string") {
			throw new Error("svg grammar missing first-line-regex");
		}
		if (typeof contentRegex !== "string") {
			throw new Error("svg grammar missing content-regex");
		}

		return {
			name: "current",
			firstLineRegex,
			contentRegex,
		};
	}

	throw new Error("svg grammar not found in tree-sitter.json");
}

function compileRegex(pattern: string): RegExp {
	try {
		return new RegExp(pattern);
	} catch {
		const scoped = /^\(\?([ims]+):(.*)\)$/s.exec(pattern);
		if (scoped !== null) {
			return new RegExp(scoped[2], scoped[1]);
		}

		const global = /^\(\?([ims]+)\)(.*)$/s.exec(pattern);
		if (global !== null) {
			return new RegExp(global[2], global[1]);
		}

		throw new Error(`regex not supported by JS runtime: ${pattern}`);
	}
}

function computeMetrics(tp: number, fp: number, tn: number, fn: number): Metrics {
	const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
	const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
	const specificity = tn + fp === 0 ? 0 : tn / (tn + fp);
	const accuracy = tp + fp + tn + fn === 0 ? 0 : (tp + tn) / (tp + fp + tn + fn);

	return {
		tp,
		fp,
		tn,
		fn,
		precision,
		recall,
		specificity,
		accuracy,
	};
}

function evaluate(samples: Sample[], select: (sample: Sample) => boolean): Metrics {
	let tp = 0;
	let fp = 0;
	let tn = 0;
	let fn = 0;

	for (const sample of samples) {
		const predicted = select(sample);
		if (predicted && sample.expectedSvg) {
			tp += 1;
		} else if (predicted && !sample.expectedSvg) {
			fp += 1;
		} else if (!predicted && !sample.expectedSvg) {
			tn += 1;
		} else {
			fn += 1;
		}
	}

	return computeMetrics(tp, fp, tn, fn);
}

function asFileUrl(base: URL, fileName: string): URL {
	return new URL(fileName, base);
}

async function loadSamples(manifestPath: URL, sampleDir: URL): Promise<Sample[]> {
	const manifestData = await readJson(manifestPath);
	if (!Array.isArray(manifestData)) {
		throw new Error("manifest must be array");
	}

	const entries = manifestData.map(toManifestEntry);
	const samples: Sample[] = [];

	for (const entry of entries) {
		const path = asFileUrl(sampleDir, entry.file);
		const content = await Bun.file(path).text();
		const firstLine = content.split(/\r?\n/, 1)[0] ?? "";
		samples.push({
			file: entry.file,
			kind: entry.kind,
			expectedSvg: entry.expectedSvg,
			content,
			firstLine,
		});
	}

	return samples;
}

export async function runHarnessDetailed(candidates: Candidate[]): Promise<CandidateResultDetailed[]> {
	const sampleDir = new URL("./", import.meta.url);
	const manifestPath = asFileUrl(sampleDir, "manifest.json");
	const configPath = asFileUrl(sampleDir, "../../tree-sitter.json");

	const samples = await loadSamples(manifestPath, sampleDir);
	const current = await getSvgGrammarConfig(configPath);
	const fullCandidates = [current, ...candidates];

	return fullCandidates.map(candidate => {
		const firstRegex = compileRegex(candidate.firstLineRegex);
		const contentRegex = compileRegex(candidate.contentRegex);

		const sampleMatches = samples.map(sample => {
			const firstLineMatch = firstRegex.test(sample.firstLine);
			const contentMatch = contentRegex.test(sample.content);
			return {
				file: sample.file,
				kind: sample.kind,
				expectedSvg: sample.expectedSvg,
				firstLineMatch,
				contentMatch,
				eitherMatch: firstLineMatch || contentMatch,
			};
		});

		const firstLine = evaluate(samples, sample => firstRegex.test(sample.firstLine));
		const content = evaluate(samples, sample => contentRegex.test(sample.content));
		const either = evaluate(samples, sample => firstRegex.test(sample.firstLine) || contentRegex.test(sample.content));

		const falsePositivesEither = sampleMatches
			.filter(sample => sample.eitherMatch && !sample.expectedSvg)
			.map(sample => sample.file);

		const falseNegativesEither = sampleMatches
			.filter(sample => !sample.eitherMatch && sample.expectedSvg)
			.map(sample => sample.file);

		return {
			candidate,
			firstLine,
			content,
			either,
			falsePositivesEither,
			falseNegativesEither,
			samples: sampleMatches,
		};
	});
}

export async function runHarness(candidates: Candidate[]): Promise<CandidateResult[]> {
	const detailed = await runHarnessDetailed(candidates);
	return detailed.map(({ candidate, firstLine, content, either, falsePositivesEither, falseNegativesEither }) => ({
		candidate,
		firstLine,
		content,
		either,
		falsePositivesEither,
		falseNegativesEither,
	}));
}

export const strictRootOnlyCandidate: Candidate = {
	name: "strict_root_only",
	firstLineRegex: String.raw`^\s*(?:<!DOCTYPE\s+svg\b|<(?:[A-Za-z_][\w.-]*:)?svg\b)`,
	contentRegex: String.raw`(?is)^\s*(?:<\?xml\b[^>]*\?>\s*)?(?:(?:<!--(?:[^-]|-[^-])*-->|<\?[^>]*\?>)\s*)*(?:<!DOCTYPE\s+svg\b[^>]*>\s*)?<(?:[A-Za-z_][\w.-]*:)?svg\b`,
};
