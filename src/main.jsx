import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { canonicalPath, pages } from './pages.js';

document.documentElement.dataset.page = pages[canonicalPath(location.pathname)]?.type || 'home';
createRoot(document.getElementById('root')).render(<App />);
