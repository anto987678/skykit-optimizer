import { useState } from 'react';

interface SimControlsProps {
  isRunning: boolean;
  isComplete: boolean;
  round: number;
  onStartGame: () => Promise<{ success: boolean; message: string }>;
}

export function SimControls({ isRunning, isComplete, round, onStartGame }: SimControlsProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [startMessage, setStartMessage] = useState<string | null>(null);

  const statusText = isComplete
    ? 'Simulation Complete'
    : isRunning
    ? 'Simulation Running...'
    : 'Ready to start';

  const statusClass = isComplete ? 'complete' : isRunning ? 'running' : '';

  const handleStart = async () => {
    setIsStarting(true);
    setStartMessage(null);
    const result = await onStartGame();
    setIsStarting(false);
    if (!result.success) {
      setStartMessage(result.message);
    }
  };

  const canStart = !isRunning && !isComplete && !isStarting;

  return (
    <div className="sim-controls card">
      <div className="status-indicator">
        <div className={`status-dot ${statusClass}`} />
        <span>{statusText}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <p className="log">
          Round {round} / 720 ({((round / 720) * 100).toFixed(1)}% complete)
        </p>

        {canStart && (
          <button
            onClick={handleStart}
            disabled={isStarting}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              backgroundColor: 'var(--accent)',
              color: '#001121',
              border: 'none',
              borderRadius: '999px',
              cursor: isStarting ? 'not-allowed' : 'pointer',
              opacity: isStarting ? 0.7 : 1,
              boxShadow: '0 10px 30px rgba(46, 180, 255, 0.35)',
              transition: 'transform 0.2s ease'
            }}
          >
            {isStarting ? 'Starting...' : 'Start Simulation'}
          </button>
        )}

        {startMessage && (
          <span className="negative" style={{ fontSize: '0.9rem' }}>
            {startMessage}
          </span>
        )}
      </div>
    </div>
  );
}

export default SimControls;
