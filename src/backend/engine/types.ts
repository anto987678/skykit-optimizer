/**
 * Engine-specific types and interfaces
 */

import { PerClassAmount } from '../types';

// Track kits that are in-flight (loaded on a plane, not yet landed)
export interface InFlightKits {
  flightId: string;
  destinationAirport: string;
  kits: PerClassAmount;
  arrivalDay: number;
  arrivalHour: number;
}

// Track kits that are processing at an airport (arrived but not yet available)
export interface ProcessingKits {
  airportCode: string;
  kits: PerClassAmount;
  readyDay: number;
  readyHour: number;
}

// Configuration for purchasing strategy
export interface PurchaseConfig {
  // Thresholds - when stock falls below, trigger purchase
  thresholds: Record<string, number>;

  // Emergency thresholds - when stock is critically low
  emergencyThresholds: Record<string, number>;

  // Maximum per single order (for pacing)
  maxPerOrder: Record<string, number>;

  // Maximum total purchases per class
  maxTotalPurchase: Record<string, number>;

  // API limits per request
  apiLimits: Record<string, number>;

  // Purchase interval in hours (how often to check for regular purchases)
  purchaseInterval: number;

  // Buffer multiplier for demand forecasting
  demandBuffer: number;

  // How many hours ahead to forecast
  forecastHours: number;
}

// Configuration for flight loading strategy
export interface LoadingConfig {
  // Safety buffer to keep at each airport (avoid negative inventory)
  safetyBuffer: {
    hub: number;
    spoke: number;
  };

  // How many hours ahead to look for demand at destinations
  destinationForecastHours: number;

  // Whether to load extra kits for destination deficit
  enableExtraLoadingToSpokes: boolean;

  // Whether to return surplus kits to hub
  enableReturnToHub: boolean;
}

/**
 * Calculate dynamic purchase config based on hub capacity
 * This ensures thresholds scale properly with different datasets
 */
export function calculateDynamicPurchaseConfig(hubCapacity: PerClassAmount): PurchaseConfig {
  return {
    // Thresholds as percentage of hub capacity - OPTIMIZED based on penalty analysis
    thresholds: {
      first: Math.floor(hubCapacity.first * 0.20),           // 20% - was 10%, First deficit from Day 7
      business: Math.floor(hubCapacity.business * 0.40),     // 40% - was 33%, 822 penalties
      premiumEconomy: Math.floor(hubCapacity.premiumEconomy * 0.55), // 55% - was 40%, 1961 penalties (most!)
      economy: Math.floor(hubCapacity.economy * 0.75)        // 75% - was 70%, 1309 penalties
    },
    // Emergency thresholds - increased for early-game protection
    emergencyThresholds: {
      first: Math.max(50, Math.floor(hubCapacity.first * 0.05)),      // 5% - was 2%
      business: Math.max(200, Math.floor(hubCapacity.business * 0.03)),
      premiumEconomy: Math.max(50, Math.floor(hubCapacity.premiumEconomy * 0.05)), // 5% - was 2%
      economy: Math.max(1000, Math.floor(hubCapacity.economy * 0.10))
    },
    // Max per order - increased for faster stock building
    maxPerOrder: {
      first: Math.max(100, Math.floor(hubCapacity.first * 0.08)),      // 8% - was 5%
      business: Math.max(500, Math.floor(hubCapacity.business * 0.15)),
      premiumEconomy: Math.max(100, Math.floor(hubCapacity.premiumEconomy * 0.15)), // 15% - was 10%
      economy: Math.max(2000, Math.floor(hubCapacity.economy * 0.15))
    },
    // Max total - 3x capacity (for entire 30 days)
    maxTotalPurchase: {
      first: hubCapacity.first * 3,
      business: hubCapacity.business * 3,
      premiumEconomy: hubCapacity.premiumEconomy * 3,
      economy: hubCapacity.economy * 3
    },
    // API limits - keep as-is (server constraints)
    apiLimits: {
      first: 42000,
      business: 42000,
      premiumEconomy: 3000,
      economy: 42000
    },
    purchaseInterval: 6,
    demandBuffer: 1.0,
    forecastHours: 48
  };
}

/**
 * Calculate dynamic loading config based on hub capacity
 */
export function calculateDynamicLoadingConfig(hubCapacity: PerClassAmount): LoadingConfig {
  // Safety buffer as percentage (1% hub, 3% spoke) - will be applied per airport
  // Here we just store base values, actual calculation happens in flightLoader
  return {
    safetyBuffer: {
      hub: 0.01,   // 1% of capacity (will be multiplied by actual capacity)
      spoke: 0.03  // 3% of capacity
    },
    destinationForecastHours: 24,
    enableExtraLoadingToSpokes: true,
    enableReturnToHub: true
  };
}

// Default configurations (fallback if hub capacity not available)
export const DEFAULT_PURCHASE_CONFIG: PurchaseConfig = {
  thresholds: {
    first: 1800,
    business: 6000,
    premiumEconomy: 4000,
    economy: 70000
  },
  emergencyThresholds: {
    first: 400,
    business: 2000,
    premiumEconomy: 400,
    economy: 10000
  },
  maxPerOrder: {
    first: 1000,
    business: 3000,
    premiumEconomy: 1000,
    economy: 15000
  },
  maxTotalPurchase: {
    first: 50000,
    business: 100000,
    premiumEconomy: 30000,
    economy: 200000
  },
  apiLimits: {
    first: 42000,
    business: 42000,
    premiumEconomy: 3000,
    economy: 42000
  },
  purchaseInterval: 6,
  demandBuffer: 1.0,
  forecastHours: 48
};

export const DEFAULT_LOADING_CONFIG: LoadingConfig = {
  safetyBuffer: {
    hub: 100,    // Fallback absolute values
    spoke: 20
  },
  destinationForecastHours: 24,
  enableExtraLoadingToSpokes: true,
  enableReturnToHub: true
};
