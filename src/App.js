import React, { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    const loadScript = (src) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    };

    const scripts = [
      '/ghost.js',
      '/pacman.js',
      '/game.js'
    ];

    const cleanupScripts = scripts.map(src => loadScript(src));

    return () => {
      cleanupScripts.forEach(cleanup => cleanup());
    };
  }, []);

  return (
    <div id="container">
      <canvas id="canvas" width="430" height="500"></canvas>
      <div style={{ display: 'none' }}>
        <img id="animation" src="/img/animations.gif" width="140" height="20" alt="animation" />
        <img id="ghosts" src="/img/ghost.png" width="140" height="20" alt="ghosts" />
      </div>
    </div>
  );
}

export default App;
