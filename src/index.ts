import { ApiClient } from './api/client';
import { HourRequestDto, FlightEvent } from './types';

const TOTAL_DAYS = 30;
const HOURS_PER_DAY = 24;
const TOTAL_ROUNDS = TOTAL_DAYS * HOURS_PER_DAY; // 720

async function main() {
  console.log('===========================================');
  console.log('       SkyKit Optimizer v1.0');
  console.log('   SAP Hackathon - Rotables Optimization');
  console.log('===========================================\n');

  const client = new ApiClient();

  try {
    // 1. Start session
    console.log('[GAME] Starting new session...');
    await client.startSession();
    console.log('');

    // Track flights we know about
    const knownFlights = new Map<string, FlightEvent>();

    // 2. Game loop - 720 rounds (30 days × 24 hours)
    console.log('[GAME] Starting game loop...\n');

    for (let day = 0; day < TOTAL_DAYS; day++) {
      for (let hour = 0; hour < HOURS_PER_DAY; hour++) {
        const roundNumber = day * HOURS_PER_DAY + hour + 1;

        // Build request
        const request: HourRequestDto = {
          day,
          hour,
          flightLoads: [],  // TODO: Implement loading logic based on known flights
          // kitPurchasingOrders: undefined  // TODO: Implement purchasing logic
        };

        // Play the round
        const response = await client.playRound(request);

        // Process flight updates
        for (const update of response.flightUpdates) {
          knownFlights.set(update.flightId, update);

          // Log important events
          if (update.eventType === 'SCHEDULED') {
            // Flight scheduled 24h before departure
          } else if (update.eventType === 'CHECKED_IN') {
            // Passengers checked in 1h before departure - we now know exact numbers
          } else if (update.eventType === 'LANDED') {
            // Flight landed - kits arrived at destination
          }
        }

        // Log progress every day at midnight
        if (hour === 0) {
          console.log(`[DAY ${day.toString().padStart(2, '0')}] Cost: ${response.totalCost.toFixed(2)} | Flights tracked: ${knownFlights.size}`);
        }

        // Log penalties (always)
        if (response.penalties.length > 0) {
          for (const penalty of response.penalties) {
            console.log(`  ⚠️  PENALTY: ${penalty.code} - ${penalty.penalty.toFixed(2)} (${penalty.reason})`);
          }
        }
      }
    }

    // 3. End session
    console.log('\n[GAME] Ending session...');
    const finalResult = await client.endSession();

    console.log('\n===========================================');
    console.log(`       FINAL SCORE: ${finalResult.totalCost.toFixed(2)}`);
    console.log('===========================================\n');

    // Log final penalties if any
    if (finalResult.penalties.length > 0) {
      console.log('Final penalties:');
      for (const penalty of finalResult.penalties) {
        console.log(`  - ${penalty.code}: ${penalty.penalty.toFixed(2)}`);
      }
    }

  } catch (error) {
    console.error('\n[ERROR] Game failed:', error);
    process.exit(1);
  }
}

// Run the game
main().catch(console.error);
