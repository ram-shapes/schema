import React from 'react';
import { Jumbotron, Button } from 'react-bootstrap';

import { renderApp } from '../core/common';
import { AppPage, getLinkHref } from '../core/routing';
import { AppNavbar } from '../components/navbar';

import * as styles from './home.css';

function HomePage() {
  return (
    <>
      <AppNavbar page={AppPage.Home} />
      <div className={styles.pageContent}>
        <Jumbotron className={styles.jumbotron}>
          <h1>RAMP shapes: declarative RDF ↔ algebraic data type mapping</h1>
          <p className={styles.descriptionText}>
            RAMP (RDF ADT Mapping) is a type construction language, specification and an
            implementation of mapping operations between RDF graphs and structured data types.
          </p>
          <p className={styles.descriptionText}>
            RAMP is based on algebraic data types, and aims to overcome limitations of existing
            approaches by providing a convinient and efficient means to perform semantic
            data workflow, which includes querying a subset of the data, mapping the data into
            statically described data structures
          </p>
          <p>
            <Button variant='primary'
              className={styles.goButton}
              href={getLinkHref(AppPage.Spec, {base: '/'})}>
              Read specification draft
            </Button>
            <Button variant='outline-info'
              className={styles.goButton}
              href={getLinkHref(AppPage.Playground, {base: '/'})}>
              Try out on Playground
            </Button>
          </p>
        </Jumbotron>
      </div>
    </>
  );
}

renderApp(<HomePage />);
