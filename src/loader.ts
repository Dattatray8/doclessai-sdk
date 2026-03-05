import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './widget.js';

const init = () => {
    const scripts = document.querySelectorAll('script[data-app-key]');
    const script = scripts[scripts.length - 1]; 
    const appKey = script?.getAttribute('data-app-key') || '';
    const name = script?.getAttribute('data-name') || 'Assistant';
    
    // Don't initialize if no key is found
    if (!appKey) return;

    const div = document.createElement('div');
    div.id = 'docless-ai-root';
    document.body.appendChild(div);

    const root = ReactDOM.createRoot(div);
    root.render(React.createElement(ChatWidget, { appKey, name }));
};

// Run when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}