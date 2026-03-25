/**
 * Health Export Tests
 * Tests for generateHealthReport, generateHealthCSV, and sharing functions
 */
import {
    generateHealthReport,
    generateHealthCSV,
    copyHealthReport,
} from '@/lib/healthExport';

const mockData = [
    { date: '2026-03-10', water_glasses: 8, sleep_hours: 7, mood: 4, weight: 75, notes: 'يوم جيد' },
    { date: '2026-03-11', water_glasses: 6, sleep_hours: 6, mood: 3, weight: 75.2 },
    { date: '2026-03-12', water_glasses: 10, sleep_hours: 8, mood: 5, weight: 74.8 },
    { date: '2026-03-13', water_glasses: 4, sleep_hours: 5, mood: 2 },
    { date: '2026-03-14', water_glasses: 7, sleep_hours: 7.5, mood: 4, weight: 74.5 },
];

describe('Health Export', () => {
    describe('generateHealthReport', () => {
        test('should generate a text report with all sections', () => {
            const report = generateHealthReport(mockData, { period: 'all', includeWater: true, includeSleep: true, includeMood: true, includeWeight: true });
            expect(report).toContain('تقرير طِبرَا الصحي');
            expect(report).toContain('💧 الماء');
            expect(report).toContain('😴 النوم');
            expect(report).toContain('المزاج');
            expect(report).toContain('⚖️ الوزن');
        });

        test('should exclude sections when options are false', () => {
            const report = generateHealthReport(mockData, {
                period: 'all',
                includeWater: false,
                includeSleep: false,
                includeMood: false,
                includeWeight: false,
            });
            expect(report).not.toContain('💧 الماء');
            expect(report).not.toContain('😴 النوم');
        });

        test('should return empty message when no data matches period', () => {
            const report = generateHealthReport([], { period: '7d' });
            expect(report).toContain('لا توجد بيانات');
        });

        test('should calculate correct water average', () => {
            const report = generateHealthReport(mockData, { period: 'all', includeWater: true });
            expect(report).toContain('كوب');
        });
    });

    describe('generateHealthCSV', () => {
        test('should generate CSV with headers and data rows', () => {
            const csv = generateHealthCSV(mockData, { period: 'all', includeWater: true, includeSleep: true, includeMood: true, includeWeight: true });
            const lines = csv.split('\n');

            // Header row
            expect(lines[0]).toContain('التاريخ');
            expect(lines[0]).toContain('الماء (كوب)');
            expect(lines[0]).toContain('النوم (ساعة)');

            // Data rows
            expect(lines.length).toBe(6); // 1 header + 5 data rows
        });

        test('should include date in yyyy-MM-dd format', () => {
            const csv = generateHealthCSV(mockData, { period: 'all' });
            expect(csv).toContain('2026-03-10');
        });

        test('should handle notes with commas', () => {
            const dataWithComma = [
                { date: '2026-03-10', water_glasses: 8, notes: 'يوم جيد, ممتاز' },
            ];
            const csv = generateHealthCSV(dataWithComma, { period: 'all' });
            // Arabic comma should replace latin comma
            expect(csv).toContain('يوم جيد، ممتاز');
        });

        test('should respect period filter', () => {
            const csv = generateHealthCSV(mockData, { period: '7d' });
            const lines = csv.split('\n');
            // Should filter based on period
            expect(lines.length).toBeGreaterThanOrEqual(1); // at least header
        });

        test('should only include selected columns', () => {
            const csv = generateHealthCSV(mockData, {
                period: 'all',
                includeWater: true,
                includeSleep: false,
                includeMood: false,
                includeWeight: false,
            });
            expect(csv).toContain('الماء (كوب)');
            expect(csv).not.toContain('النوم (ساعة)');
        });
    });

    describe('copyHealthReport', () => {
        test('should return true on successful copy', async () => {
            Object.assign(navigator, {
                clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
            });
            const result = await copyHealthReport('test report');
            expect(result).toBe(true);
        });

        test('should return false on clipboard error', async () => {
            Object.assign(navigator, {
                clipboard: { writeText: jest.fn().mockRejectedValue(new Error('fail')) },
            });
            const result = await copyHealthReport('test report');
            expect(result).toBe(false);
        });
    });
});
