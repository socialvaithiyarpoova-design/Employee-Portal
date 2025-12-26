
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import "@fontsource/montserrat";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";

import App from './App.jsx';
import { AuthProvider } from './components/context/Authcontext.jsx'; 
import { getOrSetSessionId } from './utils.jsx';
localStorage.removeItem('session_id');
getOrSetSessionId();

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
);
