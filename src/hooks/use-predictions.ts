import { useMemo } from 'react';
import { differenceInDays, parseISO, addDays, isValid } from 'date-fns';
import { useDrawData } from './use-draw-data';
import { DrawEntry } from '@shared/types';
export function usePredictions(filteredDraws: DrawEntry[]) {
  const { draws: allDraws } = useDrawData();
  return useMemo(() => {
    if (!filteredDraws || filteredDraws.length < 3) {
      return {
        nextEstimatedDate: null,
        scoreConfidence: 0,
        predictedRange: null,
        trendSignal: 'Steady' as const,
        volatility: 0
      };
    }
    // 1. Calculate Average Interval (Frequency)
    const intervals: number[] = [];
    for (let i = 0; i < Math.min(filteredDraws.length - 1, 10); i++) {
      const d1 = parseISO(filteredDraws[i].date);
      const d2 = parseISO(filteredDraws[i + 1].date);
      if (isValid(d1) && isValid(d2)) {
        intervals.push(differenceInDays(d1, d2));
      }
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const lastDrawDate = parseISO(filteredDraws[0].date);
    const nextEstimatedDate = addDays(lastDrawDate, Math.round(avgInterval));
    // 2. Calculate Volatility (Standard Deviation of scores)
    const scores = filteredDraws.slice(0, 15).map(d => d.crsScore);
    const meanScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const squareDiffs = scores.map(s => Math.pow(s - meanScore, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    const standardDeviation = Math.sqrt(avgSquareDiff);
    const volatility = Math.min(100, Math.round((standardDeviation / meanScore) * 1000));
    // 3. Trend Momentum
    const recentAvg = (scores[0] + scores[1] + scores[2]) / 3;
    const olderAvg = (scores[3] + scores[4] + scores[5]) / 3;
    const momentum = recentAvg - olderAvg;
    let trendSignal: 'Steady' | 'Rising' | 'Falling' = 'Steady';
    if (momentum > 2) trendSignal = 'Rising';
    else if (momentum < -2) trendSignal = 'Falling';
    // 4. Predicted Range
    const buffer = Math.max(5, Math.round(standardDeviation * 0.5));
    const low = Math.round(filteredDraws[0].crsScore + (momentum * 0.2) - buffer);
    const high = Math.round(filteredDraws[0].crsScore + (momentum * 0.2) + buffer);
    // 5. Confidence Level
    const dataDensity = Math.min(40, filteredDraws.length * 2);
    const recencyFactor = Math.max(0, 60 - differenceInDays(new Date(), lastDrawDate));
    const scoreConfidence = Math.min(95, Math.round(dataDensity + recencyFactor));
    return {
      nextEstimatedDate,
      scoreConfidence,
      predictedRange: { low, high },
      trendSignal,
      volatility
    };
  }, [filteredDraws]);
}