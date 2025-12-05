# SkyKit Optimizer - Frontend

React + TypeScript + Vite frontend for the SkyKit Optimizer simulation dashboard.

## Features

- Real-time game state monitoring via API polling
- Live statistics dashboard (Total Cost, Penalties, Rounds)
- Airport inventory panel with low-stock filtering
- Flight events and penalties timeline
- Responsive dark theme UI

## Development

```bash
# Start frontend dev server
npm run dev

# The frontend runs on http://localhost:5173
# It connects to the backend at http://localhost:3001
```

## Components

- `StatsGrid` - Displays game statistics cards
- `InventoryPanel` - Shows airport kit inventories
- `MapPanel` - Placeholder for network visualization
- `EventsPanel` - Events and penalties timeline
- `SimControls` - Game status indicator

## Hooks

- `useGameState` - Polls backend API for real-time game state updates

## Connecting to Backend

The frontend automatically connects to the backend API at `http://localhost:3001`.
Make sure the backend is running before starting the frontend:

```bash
# From project root
npm run backend
```

Then in another terminal:
```bash
npm run frontend
```

Or run both together:
```bash
npm run dev
```
