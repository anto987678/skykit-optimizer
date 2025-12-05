import { useState } from 'react';
import type { GameEvent, PenaltyInfo } from '../hooks/useGameState';

interface EventsPanelProps {
  events: GameEvent[];
  penalties: PenaltyInfo[];
}

type TabType = 'events' | 'penalties';

const eventBadgeMap: Record<string, { label: string; className: string }> = {
  flight: { label: '✈', className: 'badge' },
  purchase: { label: '⬆', className: 'badge' },
  warning: { label: '⚠', className: 'badge warning' },
  penalty: { label: '$', className: 'badge danger' }
};

export function EventsPanel({ events, penalties }: EventsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('events');

  return (
    <div className="events-panel card">
      <div className="panel-tabs">
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events ({events.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'penalties' ? 'active' : ''}`}
          onClick={() => setActiveTab('penalties')}
        >
          Penalties ({penalties.length})
        </button>
      </div>
      <div className="panel-scroll">
        {activeTab === 'events' ? (
          events.length === 0 ? (
            <p className="muted">No events yet. Start the game to see updates.</p>
          ) : (
            events.slice().reverse().map((event, index) => {
              const badge = eventBadgeMap[event.type] || eventBadgeMap.flight;
              return (
                <div key={index} className="event-item">
                  <span className={badge.className}>{badge.label}</span>
                  <p>{event.text}</p>
                </div>
              );
            })
          )
        ) : (
          penalties.length === 0 ? (
            <p className="muted">No penalties incurred yet.</p>
          ) : (
            penalties.slice().reverse().map((penalty, index) => (
              <div key={index} className="event-item">
                <span className="badge danger">$</span>
                <div>
                  <p style={{ margin: 0 }}>
                    <strong className="negative">${penalty.amount.toFixed(2)}</strong>
                    {' - '}{penalty.code}
                  </p>
                  <p className="muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                    {penalty.reason}
                  </p>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

export default EventsPanel;
