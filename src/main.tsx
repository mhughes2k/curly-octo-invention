import React from 'react';
import ReactDOM from 'react-dom/client';
import TimelineExample from './examples/TimelineExample';

const rootEl = document.getElementById('root');
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <TimelineExample />
    </React.StrictMode>,
  );
}
