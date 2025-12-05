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

  const handleStart = async () => {
    setIsStarting(true);
    setStartMessage(null);
    const result = await onStartGame();
    setIsStarting(false);
    if (!result.success) {
      setStartMessage(result.message);
    }
  };

  const isDisabled = isRunning || isComplete || isStarting;

  const statusDotClass = isComplete
    ? 'bg-accent'
    : isRunning
    ? 'bg-success animate-pulse-opacity'
    : 'bg-text-muted';

  const buttonText = isStarting
    ? 'Starting...'
    : isRunning
    ? 'Running...'
    : isComplete
    ? 'Completed'
    : 'Start Simulation';

  return (
    <div className="bg-panel rounded-[20px] border border-border p-6 flex justify-between items-center gap-6">
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${statusDotClass}`} />
        <span>{statusText}</span>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-text-muted font-mono text-sm m-0">
          Round {round} / 720 ({((round / 720) * 100).toFixed(1)}% complete)
        </p>

        <button
          onClick={handleStart}
          disabled={isDisabled}
          className={`px-6 py-3 text-base font-semibold border-none rounded-full transition-transform ${
            isDisabled
              ? 'bg-text-muted/30 text-text-muted cursor-not-allowed'
              : 'bg-accent text-[#001121] cursor-pointer shadow-[0_10px_30px_rgba(46,180,255,0.35)] hover:-translate-y-0.5'
          }`}
        >
          {buttonText}
        </button>

        {startMessage && (
          <span className="text-danger text-sm">
            {startMessage}
          </span>
        )}
      </div>
    </div>
  );
}

export default SimControls;
