/**
 * Health Trends & Anomaly Detection Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Analyzes health metrics for trends (rolling averages)
 * and detects anomalies using statistical variance (±2σ from personal baseline).
 */

import { db } from '@/lib/db';
import { subDays, parseISO, isAfter } from 'date-fns';

export interface MetricPoint {
    date: string;
    value: number;
}

export interface TrendAnalysis {
    metricType: string;
    currentValue: number;
    sevenDayAverage: number;
    thirtyDayAverage: number;
    trendDirection: 'up' | 'down' | 'stable';
    changePercent: number;
    isAnomaly: boolean;
    anomalySeverity: 'none' | 'mild' | 'severe';
}

/**
 * Calculates standard deviation for a set of values
 */
function calculateStandardDeviation(values: number[]): { mean: number, stdDev: number } {
    if (values.length === 0) return { mean: 0, stdDev: 0 };
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(avgSquareDiff);
    
    return { mean, stdDev };
}

/**
 * Get statistical trend and anomaly detection for a specific metric types
 * @param userId The patient's ID
 * @param metricType e.g., 'heart_rate', 'blood_pressure_sys', 'blood_glucose'
 */
export async function getMetricTrend(userId: string, metricType: string): Promise<TrendAnalysis | null> {
    try {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
        const sevenDaysAgo = subDays(new Date(), 7).toISOString();

        // 1. Fetch data from last 30 days
        const rawData = await db.entities.HealthMetric.listForUser(userId);
        
        const metricData = rawData
            .filter(d => d.metric_type === metricType && isAfter(parseISO(d.recorded_at), parseISO(thirtyDaysAgo)))
            .map(d => ({ date: d.recorded_at, value: d.value }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first

        if (metricData.length < 3) return null; // Not enough data for stat analysis

        // 2. Separate into 7-day and 30-day buckets
        const sevenDayData = metricData.filter(d => isAfter(parseISO(d.date), parseISO(sevenDaysAgo)));
        
        const currentValue = metricData[0].value;
        const sevenDayValues = sevenDayData.map(d => d.value);
        const thirtyDayValues = metricData.map(d => d.value);

        const sevenDayAverage = sevenDayValues.length > 0 
            ? sevenDayValues.reduce((a, b) => a + b, 0) / sevenDayValues.length 
            : currentValue;
            
        const thirtyDayAverage = thirtyDayValues.length > 0 
            ? thirtyDayValues.reduce((a, b) => a + b, 0) / thirtyDayValues.length 
            : currentValue;

        // 3. Trend calculation
        // Compare 7-day average against 30-day average to find the recent trend
        const changePercent = thirtyDayAverage > 0 ? ((sevenDayAverage - thirtyDayAverage) / thirtyDayAverage) * 100 : 0;
        
        let trendDirection: 'up' | 'down' | 'stable' = 'stable';
        if (changePercent >= 2) trendDirection = 'up';
        if (changePercent <= -2) trendDirection = 'down';

        // 4. Anomaly Detection using standard deviation over 30 days
        const { mean, stdDev } = calculateStandardDeviation(thirtyDayValues);
        
        let isAnomaly = false;
        let anomalySeverity: 'none' | 'mild' | 'severe' = 'none';

        if (stdDev > 0) {
            const zScore = Math.abs((currentValue - mean) / stdDev);
            
            // If the latest reading is more than 2 standard deviations from personal baseline
            if (zScore > 3) {
                isAnomaly = true;
                anomalySeverity = 'severe';
            } else if (zScore > 2) {
                isAnomaly = true;
                anomalySeverity = 'mild';
            }
        }

        return {
            metricType,
            currentValue,
            sevenDayAverage: Number(sevenDayAverage.toFixed(1)),
            thirtyDayAverage: Number(thirtyDayAverage.toFixed(1)),
            trendDirection,
            changePercent: Number(changePercent.toFixed(1)),
            isAnomaly,
            anomalySeverity
        };

    } catch (e) {
        console.error(`Error calculating trend for ${metricType}:`, e);
        return null;
    }
}

/**
 * Evaluates DailyLog entries for consistency/habits
 */
export async function getBehavioralTrends(userId: string) {
    const logs = await db.entities.DailyLog.listForUser(userId, '-date', 14); // Last 14 days
    
    let daysLogged = 0;
    let avgMood = 0;
    let avgSleep = 0;
    
    if (logs.length === 0) return { consistency: 0, avgMood: 0, avgSleep: 0 };
    
    const moodLogs = logs.filter(l => l.mood !== undefined);
    if (moodLogs.length > 0) {
        avgMood = moodLogs.reduce((acc, l) => acc + (l.mood || 0), 0) / moodLogs.length;
    }
    
    const sleepLogs = logs.filter(l => l.sleep_quality !== undefined);
    if (sleepLogs.length > 0) {
        avgSleep = sleepLogs.reduce((acc, l) => acc + (l.sleep_quality || 0), 0) / sleepLogs.length;
    }

    return {
        consistency: Math.round((logs.length / 14) * 100), // Percent of days logged
        avgMood: Number(avgMood.toFixed(1)),
        avgSleep: Number(avgSleep.toFixed(1)),
        totalEntries: logs.length
    };
}
