import React, { useRef, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import * as Ramp from 'ramp-shapes';
import * as N3 from 'n3';
import * as SparqlJs from 'sparqljs';

import { renderApp } from '../core/common';
import { AppPage } from '../core/routing';
import { AppNavbar } from '../components/navbar';
import { CodeEditor } from '../components/code-editor';
import { PanelSystem } from '../components/panel-system';
import { Example, ExampleName, getBundledExample } from '../examples';

import * as styles from './playground.css';

const DEFAULT_EXAMPLE = 'selectors';
const FRAME_RESULT_PLACEHLDER = '{ _: "Press \'Frame\' to perform frame() on specified graph" }';
const FLATTEN_RESULT_PLACEHOLDER = '_:b _:p "Press \'Flatten\' to perform flatten() on specified JSON"';
const GENERATE_QUERY_RESULT_PLACEHOLDER =
  '# Press "Generate CONSTRUCT query" to generate query for specified shapes';

function PlaygroundPage() {
  const shapesEditorRef = useRef<CodeEditor>(null);
  const graphEditorRef = useRef<CodeEditor>(null);
  const jsonEditorRef = useRef<CodeEditor>(null);

  const [example, setExample] = useState(getBundledExample(DEFAULT_EXAMPLE));
  const [errors, setErrors] = useState<ReadonlyArray<string>>([]);
  const [frameResult, setFrameResult] = useState(FRAME_RESULT_PLACEHLDER);
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
    setFrameResult(FRAME_RESULT_PLACEHLDER);
    setFlattenResult(FLATTEN_RESULT_PLACEHOLDER);
    setGenerateQueryResult(GENERATE_QUERY_RESULT_PLACEHOLDER);
  }

  function tryParseShapes() {
    let shapesQuads: N3.Quad[];
    let shapes: Ramp.Shape[];
    let prefixes: { [prefix: string]: string } | undefined;
    try {
      const parser = new N3.Parser();
      shapesQuads = parser.parse(
        shapesEditorRef.current!.getEditor().getValue()
      );
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
      const {shapes, rootShape} = parsedShapes;
      const results = Ramp.frame({shapes, rootShape, dataset});
      for (const {value} of results) {
        setFrameResult(toJson(value));
        return;
      }
      addError(`Cannot find matches for root shape ${Ramp.Rdf.toString(rootShape)}`);
      setFrameResult('');
    } catch (err) {
      addError('Failed to frame:', err);
    }
  }

  function onFlatten() {
    setErrors([]);
    const parsedShapes = tryParseShapes();
    const json = tryParseJson();
    if (!(parsedShapes && json)) {
      return;
    }

    try {
      const {shapes, rootShape, prefixes} = parsedShapes;
      const quads = [...Ramp.flatten({shapes, rootShape, value: json})];
      const quadsString = new N3.Writer({prefixes}).quadsToString(quads as N3.Quad[]);
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
      const {shapes, rootShape, prefixes} = parsedShapes;
      const sparqljsQuery = Ramp.generateQuery({shapes, rootShape, prefixes});
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
        <h4>Load example:</h4>
        <Form.Control as='select'
          className={styles.exampleSelector}
          defaultValue={DEFAULT_EXAMPLE}
          onChange={e => onChangeExample(e.currentTarget.value as ExampleName)}>
          <option value='none'>None</option>
          <option value='selectors'>Selectors with union and list</option>
          <option value='wikidata'>Wikidata: Alexander III of Russia</option>
          <option value='iiif'>IIIF Presentation Context v2</option>
        </Form.Control>
        <PanelSystem className={styles.panes}
          settings={{showPopoutIcon: false}}
          layout={{
            type: 'row',
            content: [
              {
                type: 'component',
                key: 'shapes-editor',
                title: 'Shapes (Turtle)',
                closable: false,
                element: (
                  <CodeEditor ref={shapesEditorRef}
                    className={styles.shapesEditor}
                    defaultValue={example.shapes}
                    language='turtle'
                  />
                )
              },
              {
                type: 'column',
                content: [
                  {
                    type: 'stack',
                    content: [
                      {
                        type: 'component',
                        key: 'graph-editor',
                        title: 'Input graph (Turle)',
                        closable: false,
                        element: (
                          <div className={styles.paneWithToolbar}>
                            <div className={styles.paneControls}>
                              <Button size='sm'
                                variant='outline-primary'
                                onClick={onFrame}>
                                Frame&nbsp;▶
                              </Button>
                            </div>
                            <CodeEditor ref={graphEditorRef}
                              className={styles.twoPaneEditor}
                              defaultValue={example.graph}
                              language='turtle'
                            />
                          </div>
                        )
                      },
                      {
                        type: 'component',
                        key: 'json-editor',
                        title: 'Input value (JSON)',
                        closable: false,
                        element: (
                          <div className={styles.paneWithToolbar}>
                            <div className={styles.paneControls}>
                              <Button size='sm'
                                variant='outline-primary'
                                onClick={onFlatten}>
                                Flatten&nbsp;▶
                              </Button>
                            </div>
                            <CodeEditor ref={jsonEditorRef}
                              className={styles.twoPaneEditor}
                              defaultValue={example.framed}
                              language='json'
                            />
                          </div>
                        )
                      },
                      {
                        type: 'component',
                        key: 'generate-query',
                        title: 'Generate Query',
                        closable: false,
                        element: (
                          <div className={styles.paneWithToolbar}>
                            <div className={styles.paneControls}>
                              <Button size='sm'
                                variant='outline-primary'
                                onClick={onGenerateQuery}>
                                Generate CONSTRUCT query&nbsp;▶
                              </Button>
                            </div>
                            <CodeEditor className={styles.twoPaneEditor}
                              defaultValue={generateQueryResult}
                              language='sparql'
                              readOnly={true}
                            />
                          </div>
                        )
                      },
                    ]
                  },
                  {
                    type: 'stack',
                    content: [
                      {
                        type: 'component',
                        key: 'frame-result',
                        title: 'Result: Frame (JSON)',
                        element: (
                          <CodeEditor className={styles.twoPaneEditor}
                            defaultValue={frameResult}
                            language='json'
                            readOnly={true}
                          />
                        )
                      },
                      {
                        type: 'component',
                        key: 'flatten-result',
                        title: 'Result: Flatten (Turtle)',
                        element: (
                          <CodeEditor className={styles.twoPaneEditor}
                            defaultValue={flattenResult}
                            language='turtle'
                            readOnly={true}
                          />
                        )
                      },
                      {
                        type: 'component',
                        key: 'errors',
                        title: 'Errors',
                        element: (
                          <div className={styles.infoBox}>
                            {errors.length > 0 ? (
                              <Alert variant='danger'
                                className={styles.infoBox}
                                onClose={() => setErrors([])}
                                dismissible={true}>
                                <ul className={styles.errorList}>
                                  {errors.map((error, i) => <li key={i} className={styles.errorMessage}>{error}</li>)}
                                </ul>
                              </Alert>
                            ) : null}
                          </div>
                        )
                      }
                    ]
                  }
                ]
              }
            ]
          }}>
        </PanelSystem>
      </div>
    </>
  );
}

function findFirstShape(quads: ReadonlyArray<N3.Quad>, shapes: ReadonlyArray<Ramp.Shape>): Ramp.ShapeID | undefined {
  const shapeIds = new Set<string>();
  for (const shape of shapes) {
    shapeIds.add(shape.id.value);
  }
  const rootShapeQuad = quads.find(
    q => q.subject.termType === 'NamedNode' && shapeIds.has(q.subject.value)
  );
  return rootShapeQuad ? rootShapeQuad.subject as Ramp.Rdf.NamedNode : undefined;
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
