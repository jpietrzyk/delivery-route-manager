import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import { HereMapProvider } from './here-map-context';

ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
  <HereMapProvider>
    <App />
  </HereMapProvider>
</React.StrictMode>
);
