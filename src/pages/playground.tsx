import React from 'react';
import { useEffect } from 'react';
import { Tabs, Tab, Button, Form } from 'react-bootstrap';

import { renderApp } from '../core/common';
import { AppPage } from '../core/routing';
import { AppNavbar } from '../components/navbar';
import { CodeEditor } from '../components/code-editor';

import * as styles from './playground.css';

const DEFAULT_EXAMPLE = 'selectors';
const EDITOR_HEIGHT = 300;

function PlaygroundPage() {
  const setExample = (exampleName: string | undefined) => {
    switch (exampleName) {
      case undefined:
      case 'none': {
        break;
      }
      case 'selectors': {
        break;
      }
    }
  };

  const onFrame = () => {

  };

  useEffect(() => {
    setExample(DEFAULT_EXAMPLE);
  }, []);

  return (
    <>
      <AppNavbar page={AppPage.Playground} />
      <div className={styles.pageContent}>
        <h4>Load example:</h4>
        <Form.Control as='select'
          defaultValue={DEFAULT_EXAMPLE}
          onChange={e => setExample(e.currentTarget.value)}>
          <option value='none'>None</option>
          <option value='selectors'>Selectors</option>
        </Form.Control>
        <div className={styles.topPart}>
          <div className={styles.shapesPane}>
            <h4>Shapes:</h4>
            <CodeEditor style={{height: EDITOR_HEIGHT}}
              language='turtle'
            />
          </div>
          <div className={styles.infoBoxPane}></div>
        </div>
        <Tabs defaultActiveKey='frame' id='operation-types'
          className={styles.operationTabs}>
          <Tab eventKey='frame' title='Frame'>
            <div className={styles.twoPanes}>
              <CodeEditor style={{flex: '1 1 50%', height: EDITOR_HEIGHT}}
                language='turtle'
              />
              <div className={styles.paneControls}>
                <Button onClick={onFrame}>Frame 🠚</Button>
              </div>
              <CodeEditor style={{flex: '1 1 50%', height: EDITOR_HEIGHT}}
                language='json'
              />
            </div>
          </Tab>
          <Tab eventKey='flatten' title='Flatten'>
          </Tab>
        </Tabs>
      </div>
    </>
  );
}

renderApp(<PlaygroundPage />);
