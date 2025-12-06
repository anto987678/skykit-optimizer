/**
 * Problem Logger - Sistem de logging focusat pe probleme REALE
 *
 * Filozofie: Zero log dacă totul e OK, log detaliat doar pentru probleme care CONTEAZĂ
 *
 * CE LOGĂM:
 * 1. OVERFLOW REAL - când chiar depășim capacity (nu doar aproape)
 * 2. STOCK CRITIC - când HUB1 stock < emergency threshold (o dată pe zi)
 * 3. DEADLINE - când nu mai putem cumpăra (o dată per clasă)
 * 4. END-GAME STATUS - o dată pe zi în D25-29
 *
 * CE NU LOGĂM:
 * - HUB1 aproape de capacity (e normal în end-game)
 * - Reduceri de load care NU cauzează penalități
 * - Situații care sunt gestionate corect de algoritm
 */

import { PerClassAmount } from '../types';

interface ProblemContext {
  day: number;
  hour: number;
  airport?: string;
  kitClass?: string;
  flight?: string;
}

class ProblemLogger {
  private problems: string[] = [];

  // Track ce am logat deja pentru a evita spam
  private loggedDeadlines: Set<string> = new Set();
  private loggedLowStock: Map<string, number> = new Map(); // kitClass -> last logged day
  private loggedOverflow: Map<string, number> = new Map(); // airport+kitClass -> last logged day

  /**
   * Reset pentru o nouă simulare
   */
  reset(): void {
    this.problems = [];
    this.loggedDeadlines.clear();
    this.loggedLowStock.clear();
    this.loggedOverflow.clear();
  }

  /**
   * Warn DOAR când avem overflow REAL (expected > 100% capacity)
   * NU logăm pentru HUB1 (e normal să fie plin în end-game)
   * NU logăm de fiecare dată - doar o dată pe zi per airport+class
   */
  warnOverflow(
    ctx: ProblemContext,
    current: number,
    expected: number,
    capacity: number
  ): void {
    // NU loga pentru HUB1 - e normal să fie aproape plin
    if (ctx.airport === 'HUB1') {
      return;
    }

    // Logăm DOAR dacă expected > 100% (overflow real, nu doar aproape)
    const percent = expected / capacity;
    if (percent > 1.0) {
      const key = `${ctx.airport}-${ctx.kitClass}`;
      const lastLogged = this.loggedOverflow.get(key) ?? -1;

      // Log doar o dată pe zi per airport+class
      if (ctx.day > lastLogged) {
        const overAmount = Math.round(expected - capacity);
        console.log(`[OVERFLOW] D${ctx.day}H${ctx.hour}: ${ctx.airport} ${ctx.kitClass} over capacity by ${overAmount}`);
        console.log(`  Current: ${Math.round(current)}/${capacity}, Would be: ${Math.round(expected)}/${capacity} (${(percent * 100).toFixed(0)}%)`);
        this.problems.push(`OVERFLOW at ${ctx.airport} (${ctx.kitClass})`);
        this.loggedOverflow.set(key, ctx.day);
      }
    }
  }

  /**
   * Warn când HUB1 stock scade sub emergency threshold
   * Logăm o dată pe zi per clasă pentru a evita spam
   */
  warnLowStock(
    ctx: ProblemContext,
    stock: number,
    emergency: number
  ): void {
    const key = ctx.kitClass || 'unknown';
    const lastLogged = this.loggedLowStock.get(key) ?? -1;

    // Log doar o dată pe zi per clasă
    if (stock < emergency && ctx.day > lastLogged) {
      console.log(`[CRITICAL STOCK] D${ctx.day}H${ctx.hour}: HUB1 ${ctx.kitClass}`);
      console.log(`  Stock: ${stock} (emergency threshold: ${emergency})`);
      this.problems.push(`LOW STOCK ${ctx.kitClass}`);
      this.loggedLowStock.set(key, ctx.day);
    }
  }

  /**
   * Warn când un zbor va avea pasageri fără kituri
   */
  warnUnfulfilled(
    ctx: ProblemContext,
    demand: number,
    available: number,
    distance: number
  ): void {
    const shortfall = demand - available;
    if (shortfall > 0) {
      // Formula aproximativă: penalty ≈ kits × distance × factor
      const estimatedPenalty = shortfall * distance * 0.003;
      console.log(`[WARN UNFULFILLED] D${ctx.day}H${ctx.hour}: Flight ${ctx.flight}`);
      console.log(`  ${ctx.kitClass}: Demand=${demand}, Available=${available}`);
      console.log(`  Shortfall: ${shortfall} kits (dist: ${distance.toFixed(0)}km) ≈ $${(estimatedPenalty / 1000).toFixed(1)}k penalty`);
      this.problems.push(`UNFULFILLED ${ctx.kitClass} on ${ctx.flight}`);
    }
  }

  /**
   * Info când se închide window-ul de cumpărare pentru o clasă
   * Logăm o singură dată per clasă
   */
  infoDeadline(
    ctx: ProblemContext,
    kitClass: string,
    hoursRemaining: number,
    leadTime: number
  ): void {
    // Log doar o dată per clasă
    if (!this.loggedDeadlines.has(kitClass)) {
      console.log(`[INFO DEADLINE] D${ctx.day}H${ctx.hour}: ${kitClass} purchasing CLOSED`);
      console.log(`  Lead time: ${leadTime}h, Hours remaining: ${hoursRemaining}h`);
      this.loggedDeadlines.add(kitClass);
    }
  }

  /**
   * Status end-game - o dată pe zi în D25+
   */
  endGameStatus(
    day: number,
    hubStock: PerClassAmount,
    spokeTotal: PerClassAmount,
    inFlightToHub: PerClassAmount
  ): void {
    console.log(`\n[STATUS D${day}] End-game check`);
    console.log(`  HUB1: FC=${hubStock.first}, BC=${hubStock.business}, PE=${hubStock.premiumEconomy}, EC=${hubStock.economy}`);
    console.log(`  Spokes total: FC=${spokeTotal.first}, BC=${spokeTotal.business}, PE=${spokeTotal.premiumEconomy}, EC=${spokeTotal.economy}`);
    console.log(`  InFlight→HUB: FC=${inFlightToHub.first}, BC=${inFlightToHub.business}, PE=${inFlightToHub.premiumEconomy}, EC=${inFlightToHub.economy}`);
  }

  /**
   * Summary la final - doar dacă au fost probleme
   */
  printSummary(): void {
    if (this.problems.length > 0) {
      console.log(`\n[PROBLEMS DETECTED] ${this.problems.length} issues during simulation`);
      const grouped = this.groupProblems();
      for (const [type, count] of Object.entries(grouped)) {
        console.log(`  - ${type}: ${count}x`);
      }
    }
  }

  /**
   * Returnează true dacă au fost probleme
   */
  hadProblems(): boolean {
    return this.problems.length > 0;
  }

  /**
   * Returnează lista de probleme pentru procesare externă
   */
  getProblems(): string[] {
    return [...this.problems];
  }

  private groupProblems(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const p of this.problems) {
      // Grupează după tip (fără detalii specifice)
      const type = p.split(' at ')[0].split(' on ')[0];
      result[type] = (result[type] || 0) + 1;
    }
    return result;
  }
}

// Singleton instance
export const problemLogger = new ProblemLogger();
