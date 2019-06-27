import React from 'react';

import { renderApp } from '../components/common';
import { AppNavbar, AppPage } from '../components/navbar';

function HomePage() {
  return (
    <>
      <AppNavbar page={AppPage.Home} />
    </>
  );
}

renderApp(<HomePage />);
