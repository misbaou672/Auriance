// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import App from './App';
import Inscription from './pages/inscription';
import Demo from './pages/demo';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/demo" element={<Demo />} />
        </Routes>
      </Router>
    </LanguageProvider>
  </React.StrictMode>
);