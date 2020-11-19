import React from 'react';

import { renderApp } from '../core/common';
import { AppPage, getLinkHref } from '../core/routing';
import { AppNavbar } from '../components/navbar';

import * as styles from './home.css';

const RAMP_LOGO = require('../assets/logo/logo.png');

function HomePage() {
  return (
    <>
      <AppNavbar page={AppPage.Home} />
      <div className={styles.pageContent}>
        <div className={styles.jumbotron}>
          <div>
            <img className={styles.logo} src={RAMP_LOGO} />
          </div>
          <div>
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
              <a className='btn btn-primary' role='button'
                href='https://www.researchgate.net/publication/337724413_RAMP_Shapes_Declarative_RDF_ADT_Mapping'>
                Read paper
              </a>
              <a className={`btn btn-outline-info ${styles.goButton}`} role='button'
                href={getLinkHref(AppPage.Spec, {base: '/'})}>
                Read specification draft
              </a>
              <a className={`btn btn-outline-info ${styles.goButton}`} role='button'
                href={getLinkHref(AppPage.Playground, {base: '/'})}>
                Try out on Playground
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

renderApp(<HomePage />);
