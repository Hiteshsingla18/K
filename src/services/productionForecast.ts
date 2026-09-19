import type { MineTelemetryRow } from '../data/mineTelemetry';

export interface ForecastSummary {
  current: number;
  projected: number;
  direction: 'up' | 'down' | 'stable';
  currentMonthlyTons: number;
  projectedYearEndTons: number;
  targetYearEndTons: number;
  variancePercent: number;
}

export function calculateProductionForecast(rows: MineTelemetryRow[]): ForecastSummary {
  const production = rows.map(row => row.production);
  if (production.length === 0) {
    return {
      current: 0, projected: 0, direction: 'stable', currentMonthlyTons: 0,
      projectedYearEndTons: 0, targetYearEndTons: 0, variancePercent: 0
    };
  }

  const recent = production.slice(-6);
  const current = recent[recent.length - 1];
  const first = recent[0];
  const change = current - first;
  const projected = Math.max(0, Math.min(100, current + change * 0.5));
  const currentMonthlyTons = Math.round(current * 100);
  const monthsElapsed = new Date().getMonth() + 1;
  const yearToDateTotal = Math.round(production
    .slice(0, Math.min(production.length, monthsElapsed))
    .reduce((sum, value) => sum + value * 100, 0));
  const remainingMonths = 12 - monthsElapsed;
  const projectedYearEndTons = yearToDateTotal + (currentMonthlyTons * remainingMonths);
  const targetYearEndTons = Math.round((production.reduce((sum, value) => sum + value, 0) / production.length) * 100 * 12);
  const variancePercent = targetYearEndTons === 0 ? 0 : ((projectedYearEndTons - targetYearEndTons) / targetYearEndTons) * 100;
  return {
    current,
    projected,
    direction: change > 3 ? 'up' : change < -3 ? 'down' : 'stable',
    currentMonthlyTons,
    projectedYearEndTons,
    targetYearEndTons,
    variancePercent
  };
}
