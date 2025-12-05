import { Link } from 'react-router-dom';
import { StatsGrid } from '../components/StatsGrid';
import { InventoryPanel } from '../components/InventoryPanel';
import { MapPanel } from '../components/MapPanel';
import { EventsPanel } from '../components/EventsPanel';
import { SimControls } from '../components/SimControls';
import { PageShell } from '../components/PageShell';
import { SiteHeader } from '../components/SiteHeader';
import type { UseGameStateResult } from '../hooks/useGameState';
import type { Theme } from '../hooks/useTheme';

type HomePageProps = {
  game: UseGameStateResult;
  theme: Theme;
  onToggleTheme: () => void;
};

const defaultGameState = {
  day: 0,
  hour: 0,
  round: 0,
  isStarting: false,
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

const navLinks = [
  { to: '/inventory', label: 'Airport Inventory' },
  { to: '/network', label: 'Global Network' },
  { to: '/events', label: 'Events & Penalties' }
];

export function HomePage({ game, theme, onToggleTheme }: HomePageProps) {
  const { state, isLoading, error, isConnected, startGame } = game;

  if (isLoading) {
    return (
      <PageShell>
        <SiteHeader isConnected={isConnected} theme={theme} onToggleTheme={onToggleTheme} />
        <div className="flex flex-col items-center justify-center min-h-[200px] text-text-muted">
          <div className="w-10 h-10 border-[3px] border-border border-t-accent rounded-full animate-spin mb-4" />
          <p>Connecting to backend...</p>
        </div>
      </PageShell>
    );
  }

  if (error && !isConnected) {
    return (
      <PageShell>
        <SiteHeader isConnected={isConnected} theme={theme} onToggleTheme={onToggleTheme} />
        <section className="bg-gradient-to-br from-bg-alt/95 to-panel-dark/95 rounded-[34px] p-10 mb-10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(6,6,10,0.7)]">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-text-muted mb-0.5">Connection Error</p>
            <h2 className="mt-1 mb-6 text-4xl">Cannot connect to backend</h2>
          </div>
          <p className="text-text-muted text-sm">
            Make sure the backend server is running on <code className="bg-panel px-2 py-1 rounded">http://localhost:3001</code>
          </p>
          <p className="text-text-muted text-sm mt-4">
            Run <code className="bg-panel px-2 py-1 rounded">npm run backend</code> to start the backend server.
          </p>
          <p className="text-danger text-sm mt-4">
            Error: {error}
          </p>
        </section>
      </PageShell>
    );
  }

  const gameState = state || defaultGameState;

  return (
    <PageShell>
      <SiteHeader isConnected={isConnected} theme={theme} onToggleTheme={onToggleTheme} />

      <nav className="flex flex-wrap gap-3 mb-6">
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted transition hover:text-text hover:border-accent"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <section className="bg-gradient-to-br from-bg-alt/95 to-panel-dark/95 rounded-[34px] p-6 sm:p-10 mb-10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),0_30px_80px_rgba(6,6,10,0.7)]">
        <div className="mb-6">
          <p className="uppercase tracking-[0.2em] text-xs text-text-muted mb-0.5">Live Simulation Dashboard</p>
          <h2 className="mt-1 mb-6 text-3xl sm:text-4xl">Day {gameState.day} · Hour {gameState.hour}</h2>
        </div>

        <StatsGrid
          stats={gameState.stats}
          day={gameState.day}
          hour={gameState.hour}
        />

        <div className="grid grid-cols-[300px_minmax(280px,1fr)_350px] gap-5 mb-6 max-xl:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
          <InventoryPanel airports={gameState.airports} />
          <MapPanel activeFlights={gameState.activeFlights} />
          <EventsPanel
            events={gameState.events}
            penalties={gameState.recentPenalties}
          />
        </div>

        <SimControls
          isStarting={gameState.isStarting}
          isRunning={gameState.isRunning}
          isComplete={gameState.isComplete}
          round={gameState.stats.roundsCompleted}
          onStartGame={startGame}
        />
      </section>
    </PageShell>
  );
}

export default HomePage;
