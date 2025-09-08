import Game from './components/Game';
import './App.css';

// Import ore model tester for development
if (import.meta.env.DEV) {
  import('./utils/OreModelTester');
}

function App() {
  return (
    <div className="App">
      <Game />
    </div>
  );
}

export default App;
