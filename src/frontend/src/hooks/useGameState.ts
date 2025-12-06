import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL, POLL_INTERVAL_RUNNING } from '../constants/config';

// Types matching shared/types.ts
export interface PerClassAmount {
  first: number;
  business: number;
  premiumEconomy: number;
  economy: number;
}

export interface AirportStock {
  code: string;
  name: string;
  isHub: boolean;
  stock: PerClassAmount;
  capacity: PerClassAmount;
  isLowStock: boolean;
}

export interface FlightInfo {
  flightId: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDay: number;
  departureHour: number;
  arrivalDay: number;
  arrivalHour: number;
  passengers: PerClassAmount;
  aircraftType: string;
  status: 'SCHEDULED' | 'CHECKED_IN' | 'LANDED';
}

export interface PenaltyInfo {
  code: string;
  amount: number;
  reason: string;
  flightId?: string;
  flightNumber?: string;
  issuedDay: number;
  issuedHour: number;
}

// Penalties grouped by day (day number -> array of penalties)
export interface PenaltiesByDay {
  [day: number]: PenaltyInfo[];
}

export interface GameEvent {
  type: 'flight' | 'purchase' | 'warning' | 'penalty';
  text: string;
  timestamp: string;
}

export interface GameStats {
  totalCost: number;
  transportCost: number;
  processingCost: number;
  purchaseCost: number;
  penaltyCost: number;
  totalPenalties: number;
  totalEvents: number;
  roundsCompleted: number;
  comparableScore: number;
  endOfGameFlightPenalty: number;
}

export interface GameStateSnapshot {
  day: number;
  hour: number;
  round: number;
  isStarting: boolean;
  isRunning: boolean;
  isComplete: boolean;
  stats: GameStats;
  airports: AirportStock[];
  activeFlights: FlightInfo[];
  events: GameEvent[];
  recentPenalties: PenaltyInfo[];
  penaltiesByDay?: PenaltiesByDay;
}

export interface UseGameStateResult {
  state: GameStateSnapshot | null;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  refresh: () => Promise<void>;
  retry: () => void;
  startGame: () => Promise<{ success: boolean; message: string }>;
}

export function useGameState(pollInterval: number = 2000): UseGameStateResult {
  const [state, setState] = useState<GameStateSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchState = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE_URL}/api/state`, {
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data: GameStateSnapshot = await response.json();
      setState(data);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to connect to backend');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manual retry function
  const retry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchState();
  }, [fetchState]);

  // Page Visibility API - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchState();

    // Only poll if tab is visible
    if (!isTabVisible) return;

    // Use faster polling when game is running, slower otherwise
    const actualInterval = state?.isRunning ? POLL_INTERVAL_RUNNING : pollInterval;
    const interval = setInterval(fetchState, actualInterval);

    return () => {
      clearInterval(interval);
      // Cleanup: abort any pending request on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchState, pollInterval, isTabVisible, state?.isRunning]);

  const startGame = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, message: data.error || 'Failed to start game' };
      }
      return { success: true, message: data.message || 'Game started' };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Failed to start game' };
    }
  }, []);

  return {
    state,
    isLoading,
    error,
    isConnected,
    refresh: fetchState,
    retry,
    startGame
  };
}

export default useGameState;

// Separate hook for penalty history (slower polling, only used on Events page)
export interface UsePenaltyHistoryResult {
  penaltiesByDay: PenaltiesByDay;
  isLoading: boolean;
  error: string | null;
}

// Separate hook for event history (slower polling, only used on Events page)
export interface UseEventHistoryResult {
  events: GameEvent[];
  isLoading: boolean;
  error: string | null;
}

export function useEventHistory(pollInterval: number = 1000): UseEventHistoryResult {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/history`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data: GameEvent[] = await response.json();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Page Visibility API - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    fetchEvents();

    if (!isTabVisible) return;

    const interval = setInterval(fetchEvents, pollInterval);
    return () => clearInterval(interval);
  }, [fetchEvents, pollInterval, isTabVisible]);

  return { events, isLoading, error };
}

export function usePenaltyHistory(pollInterval: number = 1000): UsePenaltyHistoryResult {
  const [penaltiesByDay, setPenaltiesByDay] = useState<PenaltiesByDay>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/penalties/history`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data: PenaltiesByDay = await response.json();
      setPenaltiesByDay(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch penalty history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Page Visibility API - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    fetchHistory();

    if (!isTabVisible) return;

    const interval = setInterval(fetchHistory, pollInterval);
    return () => clearInterval(interval);
  }, [fetchHistory, pollInterval, isTabVisible]);

  return { penaltiesByDay, isLoading, error };
}
