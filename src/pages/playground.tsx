import React from 'react';

import { renderApp } from '../components/common';
import { AppNavbar, AppPage } from '../components/navbar';

function PlaygroundPage() {
  return (
    <>
      <AppNavbar page={AppPage.Playground} />
    </>
  );
}

renderApp(<PlaygroundPage />);
