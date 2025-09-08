import { useEffect } from 'react';
import Game from './components/Game';
import { initializeSettings } from './store/settingsStore';
import './App.css';

function App() {
  useEffect(() => {
    // Initialize settings when the app starts
    initializeSettings();
  }, []);

  return (
    <div className="App">
      <Game />
    </div>
  );
}

export default App;
