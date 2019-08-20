import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';

import { AppPage, getLinkHref } from '../core/routing';

import * as styles from './navbar.css';

const GITHUB_ICON = require('../assets/github-icon.png');

export interface AppNavbarProps {
  readonly page: AppPage;
}

export function AppNavbar({page}: AppNavbarProps) {
  return (
    <Navbar bg='dark' variant='dark' expand='lg'>
      <Navbar.Brand href='.'>RAMP shapes</Navbar.Brand>
      <Nav className='mr-auto' activeKey={page}>
        <Nav.Link eventKey={AppPage.Home} href={getLinkHref(AppPage.Home, {base: '/'})}>Home</Nav.Link>
        <Nav.Link eventKey={AppPage.Spec} href={getLinkHref(AppPage.Spec, {base: '/'})}>Specification</Nav.Link>
        <Nav.Link eventKey={AppPage.Playground} href={getLinkHref(AppPage.Playground, {base: '/'})}>
            Playground
        </Nav.Link>
      </Nav>
      <Nav className='justify-content-end'>
        <a href='https://github.com/ramp-shapes/ramp-shapes'>
          <img className={styles.githubIcon}
            src={GITHUB_ICON} title='Link to GitHub' />
        </a>
      </Nav>
    </Navbar>
  );
}
