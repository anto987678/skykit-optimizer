import type { GameStats } from '../hooks/useGameState';

interface StatsGridProps {
  stats: GameStats;
  day: number;
  hour: number;
}

function formatCost(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function StatsGrid({ stats, day, hour }: StatsGridProps) {
  const statCards = [
    { label: 'Total Cost', value: formatCost(stats.totalCost) },
    { label: 'Penalties', value: formatCost(stats.penaltyCost), accent: stats.penaltyCost > 0 ? 'negative' : undefined },
    { label: 'Penalty Count', value: stats.totalPenalties.toString() },
    { label: 'Rounds Completed', value: `${stats.roundsCompleted} / 720` },
    { label: 'Current Day', value: `Day ${day}` },
    { label: 'Current Hour', value: `${hour}:00` },
  ];

  return (
    <div className="stats-grid">
      {statCards.map((stat, index) => (
        <article key={index} className={`stat-card ${stat.accent || ''}`}>
          <h3>{stat.label}</h3>
          <p>{stat.value}</p>
        </article>
      ))}
    </div>
  );
}

export default StatsGrid;
