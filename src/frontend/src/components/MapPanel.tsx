import type { FlightInfo } from '../hooks/useGameState';

interface MapPanelProps {
  activeFlights: FlightInfo[];
}

export function MapPanel({ activeFlights }: MapPanelProps) {
  const scheduledCount = activeFlights.filter(f => f.status === 'SCHEDULED').length;
  const checkedInCount = activeFlights.filter(f => f.status === 'CHECKED_IN').length;

  return (
    <div className="map-panel card">
      <div className="map-overlay">
        <p className="eyebrow">Global Network</p>
        <p className="muted">Real-time kit allocation across 161 airports.</p>
        <div style={{ marginTop: '2rem' }}>
          <p style={{ margin: '0.5rem 0' }}>
            <span className="positive">{scheduledCount}</span> scheduled flights
          </p>
          <p style={{ margin: '0.5rem 0' }}>
            <span className="positive">{checkedInCount}</span> checked-in flights
          </p>
          <p style={{ margin: '0.5rem 0' }}>
            <strong>{activeFlights.length}</strong> total active
          </p>
        </div>
      </div>
    </div>
  );
}

export default MapPanel;
