export type ExampleName = 'none' | 'selectors' | 'wikidata' | 'iiif';

export interface Example {
  readonly shapes: string;
  readonly graph: string;
  readonly framed: string;
}

const EXAMPLES = new Map<ExampleName, Example>();

export function getBundledExample(name: ExampleName): Example {
  const example = EXAMPLES.get(name);
  if (!example) {
    throw new Error(`Unknown example "${name}"`);
  }
  return example;
}

function stringifyFramed(json: unknown) {
  return JSON.stringify(json, null, 2);
}

EXAMPLES.set('none', {
  shapes: '',
  graph: '',
  framed: '',
});

EXAMPLES.set('selectors', {
  shapes: require('./selectors.shapes.ttl'),
  graph: require('./selectors.graph.ttl'),
  framed: stringifyFramed(require('./selectors.framed.json')),
});

EXAMPLES.set('wikidata', {
  shapes: require('./wikidata.shapes.ttl'),
  graph: require('./wikidata.graph.ttl'),
  framed: stringifyFramed(require('./wikidata.framed.json')),
});

EXAMPLES.set('iiif', {
  shapes: require('./iiif.shapes.ttl'),
  graph: require('./iiif.graph.ttl'),
  framed: stringifyFramed(require('./iiif.framed.json')),
});
