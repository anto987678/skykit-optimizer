import { useGameState } from './hooks/useGameState';
import { StatsGrid } from './components/StatsGrid';
import { InventoryPanel } from './components/InventoryPanel';
import { MapPanel } from './components/MapPanel';
import { EventsPanel } from './components/EventsPanel';
import { SimControls } from './components/SimControls';

function App() {
  const { state, isLoading, error, isConnected, startGame } = useGameState(1000);

  if (isLoading) {
    return (
      <div className="background-pattern">
        <div className="loading">
          <div className="loading-spinner" />
          <p>Connecting to backend...</p>
        </div>
      </div>
    );
  }

  if (error && !isConnected) {
    return (
      <div className="background-pattern">
        <header className="global-header">
          <div className="brand">
            <span className="brand-icon">◆</span>
            <div>
              <p className="eyebrow">SkyKit Optimizer</p>
              <h1>Rotable Kit Logistics Optimizer</h1>
            </div>
          </div>
        </header>

        <section className="page">
          <div className="section-heading">
            <p className="eyebrow">Connection Error</p>
            <h2>Cannot connect to backend</h2>
          </div>
          <p className="muted">
            Make sure the backend server is running on <code>http://localhost:3001</code>
          </p>
          <p className="muted" style={{ marginTop: '1rem' }}>
            Run <code>npm run backend</code> to start the backend server.
          </p>
          <p className="negative" style={{ marginTop: '1rem' }}>
            Error: {error}
          </p>
        </section>
      </div>
    );
  }

  // Default empty state
  const gameState = state || {
    day: 0,
    hour: 0,
    round: 0,
    isRunning: false,
    isComplete: false,
    stats: {
      totalCost: 0,
      transportCost: 0,
      processingCost: 0,
      purchaseCost: 0,
      penaltyCost: 0,
      totalPenalties: 0,
      roundsCompleted: 0
    },
    airports: [],
    activeFlights: [],
    events: [],
    recentPenalties: []
  };

  return (
    <div className="background-pattern">
      <header className="global-header">
        <div className="brand">
          <span className="brand-icon">◆</span>
          <div>
            <p className="eyebrow">SkyKit Optimizer</p>
            <h1>Rotable Kit Logistics Optimizer</h1>
          </div>
        </div>
        <div className="status-indicator">
          <div className={`status-dot ${isConnected ? 'running' : ''}`} />
          <span className="muted">
            {isConnected ? 'Connected to backend' : 'Disconnected'}
          </span>
        </div>
      </header>

      <section className="page">
        <div className="section-heading">
          <p className="eyebrow">Live Simulation Dashboard</p>
          <h2>Day {gameState.day} · Hour {gameState.hour}</h2>
        </div>

        <StatsGrid
          stats={gameState.stats}
          day={gameState.day}
          hour={gameState.hour}
        />

        <div className="live-panels">
          <InventoryPanel airports={gameState.airports} />
          <MapPanel activeFlights={gameState.activeFlights} />
          <EventsPanel
            events={gameState.events}
            penalties={gameState.recentPenalties}
          />
        </div>

        <SimControls
          isRunning={gameState.isRunning}
          isComplete={gameState.isComplete}
          round={gameState.stats.roundsCompleted}
          onStartGame={startGame}
        />
      </section>
    </div>
  );
}

export default App;
