import { useState } from 'react';
import type { AirportStock } from '../hooks/useGameState';

interface InventoryPanelProps {
  airports: AirportStock[];
}

export function InventoryPanel({ airports }: InventoryPanelProps) {
  const [showOnlyLowStock, setShowOnlyLowStock] = useState(false);

  const filteredAirports = showOnlyLowStock
    ? airports.filter(a => a.isLowStock)
    : airports;

  // Show max 15 airports to avoid scroll issues
  const displayAirports = filteredAirports.slice(0, 15);

  return (
    <div className="inventory-panel card">
      <div className="panel-header">
        <h3>Airport Inventory</h3>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={showOnlyLowStock}
            onChange={(e) => setShowOnlyLowStock(e.target.checked)}
          />
          Show only low stock
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>F</th>
            <th>B</th>
            <th>PE</th>
            <th>E</th>
          </tr>
        </thead>
        <tbody>
          {displayAirports.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>
                {showOnlyLowStock ? 'All airports healthy' : 'No airports loaded'}
              </td>
            </tr>
          ) : (
            displayAirports.map((airport) => (
              <tr key={airport.code} className={airport.isLowStock ? 'low' : ''}>
                <td>{airport.isHub ? `${airport.code}` : airport.code}</td>
                <td>{airport.stock.first}</td>
                <td>{airport.stock.business}</td>
                <td>{airport.stock.premiumEconomy}</td>
                <td>{airport.stock.economy}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {filteredAirports.length > 15 && (
        <p className="muted" style={{ marginTop: '0.5rem', textAlign: 'center' }}>
          +{filteredAirports.length - 15} more airports
        </p>
      )}
    </div>
  );
}

export default InventoryPanel;
