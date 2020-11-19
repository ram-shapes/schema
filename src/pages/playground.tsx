import React from 'react';
import { useRef, useState } from 'react';
import * as Ramp from 'ramp-shapes';
import * as N3 from 'n3';
import * as SparqlJs from 'sparqljs';

import { renderApp } from '../core/common';
import { AppPage } from '../core/routing';
import { Alert } from '../components/alert';
import { CodeEditor } from '../components/code-editor';
import { AppNavbar } from '../components/navbar';
import { Tabs, Tab } from '../components/tabs';
import { quadsToTurtleString } from '../util/turtle-blank';
import { Example, ExampleName, getBundledExample } from '../examples';

import * as styles from './playground.css';

const DEFAULT_EXAMPLE = 'selectors';
const FRAME_RESULT_PLACEHOLDER = '{ _: "Press \'Frame\' to perform frame() on specified graph" }';
const FLATTEN_RESULT_PLACEHOLDER = '_:b _:p "Press \'Flatten\' to perform flatten() on specified JSON"';
const GENERATE_QUERY_RESULT_PLACEHOLDER =
  '# Press "Generate CONSTRUCT query" to generate query for specified shapes';

function PlaygroundPage() {
  const shapesEditorRef = useRef<CodeEditor>(null);
  const graphEditorRef = useRef<CodeEditor>(null);
  const jsonEditorRef = useRef<CodeEditor>(null);

  const [example, setExample] = useState(getBundledExample(DEFAULT_EXAMPLE));
  const [errors, setErrors] = useState<ReadonlyArray<string>>([]);
  const [frameResult, setFrameResult] = useState(FRAME_RESULT_PLACEHOLDER);
  const [flattenResult, setFlattenResult] = useState(FLATTEN_RESULT_PLACEHOLDER);
  const [generateQueryResult, setGenerateQueryResult] = useState(GENERATE_QUERY_RESULT_PLACEHOLDER);

  function addError(message: string, reason?: { message: string }) {
    let error = message;
    if (reason) {
      console.warn(reason);
      error += '\n' + reason.message;
    }
    setErrors(errors => ([...errors, error]));
  }

  function onChangeExample(exampleName: ExampleName = 'none') {
    const example = getBundledExample(exampleName);
    setExample(example);
    setFrameResult(FRAME_RESULT_PLACEHOLDER);
    setFlattenResult(FLATTEN_RESULT_PLACEHOLDER);
    setGenerateQueryResult(GENERATE_QUERY_RESULT_PLACEHOLDER);
  }

  function tryParseShapes() {
    let shapesQuads: Ramp.Rdf.Quad[];
    let shapes: Ramp.Shape[];
    let prefixes: { [prefix: string]: string } = {};
    try {
      const parser = new N3.Parser();
      shapesQuads = parser.parse(
        shapesEditorRef.current!.getEditor().getValue()
      ) as Ramp.Rdf.Quad[];
      shapes = Ramp.frameShapes(Ramp.Rdf.dataset(shapesQuads as Ramp.Rdf.Quad[]));
      // HACK: access prefixes parsed by N3
      if (typeof (parser as any)._prefixes === 'object') {
        prefixes = (parser as any)._prefixes;
      }
    } catch (err) {
      addError('Failed to parse shapes:', err);
      return undefined;
    }

    const rootShape = findFirstShape(shapesQuads, shapes);
    if (!rootShape) {
      addError('Failed to find root shape (should be the first one)');
      return undefined;
    }

    return {shapes, rootShape, prefixes};
  }

  function tryParseDataset() {
    let dataset: Ramp.Rdf.Dataset;
    try {
      dataset = Ramp.Rdf.dataset(new N3.Parser().parse(
        graphEditorRef.current!.getEditor().getValue()
      ) as Ramp.Rdf.Quad[]);
    } catch (err) {
      addError('Failed to parse source graph:', err);
      return undefined;
    }
    return dataset;
  }

  function tryParseJson() {
    let json: unknown;
    try {
      json = JSON.parse(jsonEditorRef.current!.getEditor().getValue());
    } catch (err) {
      addError('Failed to parse source JSON:', err);
      return undefined;
    }
    return json;
  }

  function onFrame() {
    setErrors([]);
    const parsedShapes = tryParseShapes();
    const dataset = tryParseDataset();
    if (!(parsedShapes && dataset)) {
      return;
    }

    try {
      const {rootShape} = parsedShapes;
      const results = Ramp.frame({shape: rootShape, dataset});
      for (const {value} of results) {
        setFrameResult(toJson(value));
        return;
      }
      addError(`Cannot find matches for root shape ${Ramp.Rdf.toString(rootShape.id)}`);
      setFrameResult('');
    } catch (err) {
      addError('Failed to frame:', err);
    }
  }

  async function onFlatten() {
    setErrors([]);
    const parsedShapes = tryParseShapes();
    const json = tryParseJson();
    if (!(parsedShapes && json)) {
      return;
    }

    try {
      const {rootShape, prefixes} = parsedShapes;
      const quads = Array.from(Ramp.flatten({shape: rootShape, value: json}));
      const quadsString = await quadsToTurtleString(quads, prefixes);
      setFlattenResult(quadsString);
    } catch (err) {
      addError('Failed to flatten:', err);
    }
  }

  function onGenerateQuery() {
    setErrors([]);
    const parsedShapes = tryParseShapes();
    if (!parsedShapes) {
      return;
    }

    try {
      const {rootShape, prefixes} = parsedShapes;
      const sparqljsQuery = Ramp.generateQuery({shape: rootShape, prefixes});
      const queryString = new SparqlJs.Generator().stringify(sparqljsQuery);
      setGenerateQueryResult(queryString);
    } catch (err) {
      addError('Failed to generate query:', err);
    }
  }

  return (
    <>
      <AppNavbar page={AppPage.Playground} />
      <div className={styles.pageContent}>
        <label>
          Load example:
          <select className={styles.exampleSelector}
            defaultValue={DEFAULT_EXAMPLE}
            onChange={e => onChangeExample(e.currentTarget.value as ExampleName)}>
            <option value='none'>None</option>
            <option value='selectors'>Selectors with union and list</option>
            <option value='wikidata'>Wikidata: Alexander III of Russia</option>
            <option value='iiif'>IIIF Presentation Context v2</option>
          </select>
        </label>
        <div className={styles.panes}>
          <div className={styles.shapesPane}>
            <h4>Shapes:</h4>
            <CodeEditor ref={shapesEditorRef}
              className={styles.shapesEditor}
              defaultValue={example.shapes}
              language='turtle'
            />
          </div>
          <div className={styles.operationTabs}>
            <Tabs defaultActiveTab='frame'>
              <Tab tabKey='frame' className={styles.twoPaneOperation} title='Frame'>
                <CodeEditor ref={graphEditorRef}
                  className={styles.twoPaneEditor}
                  defaultValue={example.graph}
                  language='turtle'
                />
                <div className={styles.paneControls}>
                  <button className='btn btn-primary' onClick={onFrame}>Frame 🠛</button>
                </div>
                <CodeEditor className={styles.twoPaneEditor}
                  defaultValue={frameResult}
                  language='json'
                  readOnly={true}
                />
              </Tab>
              <Tab tabKey='flatten' className={styles.twoPaneOperation} title='Flatten'>
                <CodeEditor ref={jsonEditorRef}
                  className={styles.twoPaneEditor}
                  defaultValue={example.framed}
                  language='json'
                />
                <div className={styles.paneControls}>
                  <button className='btn btn-primary' onClick={onFlatten}>Flatten 🠛</button>
                </div>
                <CodeEditor className={styles.twoPaneEditor}
                  defaultValue={flattenResult}
                  language='turtle'
                  readOnly={true}
                />
              </Tab>
              <Tab tabKey='generateQuery'
                className={styles.singlePaneOperation}
                title='Generate Query'>
                <button className={`btn btn-primary ${styles.generateQueryButton}`}
                  onClick={onGenerateQuery}>
                  Generate CONSTRUCT query 🠛
                </button>
                <CodeEditor className={styles.twoPaneEditor}
                  defaultValue={generateQueryResult}
                  language='sparql'
                  readOnly={true}
                />
              </Tab>
            </Tabs>
          </div>
        </div>
        <div className={styles.infoBox}>
          {errors.length > 0 ? (
            <Alert className={styles.infoBox}
              onClose={() => setErrors([])}>
              <ul className={styles.errorList}>
                {errors.map((error, i) => <li key={i} className={styles.errorMessage}>{error}</li>)}
              </ul>
            </Alert>
          ) : null}
        </div>
      </div>
    </>
  );
}

function findFirstShape(
  quads: ReadonlyArray<Ramp.Rdf.Quad>,
  shapes: ReadonlyArray<Ramp.Shape>
): Ramp.Shape | undefined {
  const shapeIds = new Set<string>();
  for (const shape of shapes) {
    shapeIds.add(shape.id.value);
  }
  const rootShapeQuad = quads.find(
    q => q.subject.termType === 'NamedNode' && shapeIds.has(q.subject.value)
  );
  if (!rootShapeQuad) {
    return undefined;
  }
  return shapes.find(s => Ramp.Rdf.equalTerms(s.id, rootShapeQuad.subject));
}

function toJson(match: unknown): string {
  return JSON.stringify(match, (key, value) => {
    // if (typeof value === 'object' && value !== null && 'termType' in value) {
    //   return Ramp.Rdf.toString(value as Ramp.Rdf.Term);
    // }
    return value;
  }, 2);
}

renderApp(<PlaygroundPage />);
