import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatWidget from './widget.js';

const init = () => {
    const script = document.currentScript;
    const appKey = script?.getAttribute('data-app-key') || '';
    
    // Don't initialize if no key is found
    if (!appKey) return;

    const div = document.createElement('div');
    div.id = 'docless-ai-root';
    document.body.appendChild(div);

    const root = ReactDOM.createRoot(div);
    root.render(React.createElement(ChatWidget, { appKey }));
};

// Run when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}