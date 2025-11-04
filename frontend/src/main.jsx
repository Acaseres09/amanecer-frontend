import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered', reg);
    } catch (e) {
      console.error('SW registration failed', e);
    }
  });
}

createRoot(document.getElementById('root')).render(<App />)
