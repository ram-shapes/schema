import React from 'react';

import { AppPage, getLinkHref } from '../core/routing';

import * as styles from './navbar.css';

const GITHUB_ICON = require('../assets/github-icon.png');

export interface AppNavbarProps {
  readonly page: AppPage;
}

export function AppNavbar({page}: AppNavbarProps) {
  const renderPageLink = (target: AppPage, title: string) => {
    let className = styles.projectLink;
    if (target === page) {
      className += ` ${styles.activeProjectLink}`;
    }
    return (
      <a className={className}
        href={getLinkHref(target, {base: '/'})}>
        {title}
      </a>
    );
  };
  return (
    <nav className={styles.navbar}>
      <a className={styles.projectTitle} href='.'>RAMP shapes</a>
      <div className={styles.projectLinks}>
        {renderPageLink(AppPage.Home, 'Home')}
        {renderPageLink(AppPage.Spec, 'Specification')}
        {renderPageLink(AppPage.Playground, 'Playground')}
      </div>
      <div className={styles.sideLinks}>
        <a href='https://github.com/ramp-shapes/ramp-shapes'>
          <img className={styles.githubIcon}
            src={GITHUB_ICON} title='Link to GitHub' />
        </a>
      </div>
    </nav>
  );
}
