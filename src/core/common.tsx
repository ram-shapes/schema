import React from 'react';
import ReactDOM from 'react-dom';

import './common.css';

export function renderApp(component: React.ReactElement) {
  ReactDOM.render(component, document.getElementById('app'));
}
