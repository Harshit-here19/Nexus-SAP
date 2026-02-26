import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

window.copyCodeSnippet = (btn) => {
  const code = decodeURIComponent(btn.getAttribute('data-code'));
  
  navigator.clipboard.writeText(code).then(() => {
    const originalText = btn.innerText;
    btn.innerText = 'Copied!';
    btn.style.background = '#10b981'; // Green success color
    
    setTimeout(() => {
      btn.innerText = originalText;
      btn.style.background = '#444';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy!', err);
    btn.innerText = 'Error';
  });
};