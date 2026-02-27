import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// A bit of a hack for dispatching from outside React components (e.g., in setTimeout)
// A more robust solution might use context or another state management library.
const dispatchEvent = (event: Event) => {
  rootElement.dispatchEvent(new CustomEvent('dispatch', { detail: (event as CustomEvent).detail }));
};
window.addEventListener('dispatch', dispatchEvent);


root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
