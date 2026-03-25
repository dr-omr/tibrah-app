/**
 * HealthDataExport — Export health tracking data as formatted text
 * Supports: WhatsApp share, clipboard copy, and formatted summary
 */

import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface HealthEntry {
    date: string;
    water_glasses?: number;
    sleep_hours?: number;
    mood?: number;
    weight?: number;
    steps?: number;
    notes?: string;
}

interface ExportOptions {
    period: '7d' | '30d' | 'all';
    includeWater?: boolean;
    includeSleep?: boolean;
    includeMood?: boolean;
    includeWeight?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const moodEmoji = (val: number) => {
    if (val >= 5) return '😄';
    if (val >= 4) return '🙂';
    if (val >= 3) return '😐';
    if (val >= 2) return '😟';
    return '😔';
};

function avg(nums: number[]): number {
    const filtered = nums.filter(n => n > 0);
    return filtered.length > 0 ? filtered.reduce((a, b) => a + b, 0) / filtered.length : 0;
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT FUNCTION
// ═══════════════════════════════════════════════════════════════

export function generateHealthReport(
    data: HealthEntry[],
    options: ExportOptions = { period: '7d', includeWater: true, includeSleep: true, includeMood: true, includeWeight: true }
): string {
    // Filter by period
    const now = new Date();
    let cutoff: Date;

    switch (options.period) {
        case '7d':
            cutoff = subDays(now, 7);
            break;
        case '30d':
            cutoff = subDays(now, 30);
            break;
        default:
            cutoff = new Date('2000-01-01');
    }

    const filtered = data
        .filter(d => new Date(d.date) >= cutoff)
        .sort((a, b) => a.date.localeCompare(b.date));

    if (filtered.length === 0) {
        return '📊 لا توجد بيانات صحية في الفترة المحددة';
    }

    const periodLabel = options.period === '7d' ? 'الأسبوع' : options.period === '30d' ? 'الشهر' : 'كل الفترة';

    let report = `📊 تقرير طِبرَا الصحي — ${periodLabel}\n`;
    report += `📅 ${format(new Date(filtered[0].date), 'dd MMM', { locale: ar })} — ${format(new Date(filtered[filtered.length - 1].date), 'dd MMM yyyy', { locale: ar })}\n`;
    report += `═══════════════════════\n\n`;

    // ─── Water ────────────────────────────────────
    if (options.includeWater) {
        const waterData = filtered.map(d => d.water_glasses || 0);
        const waterAvg = avg(waterData);
        const waterMax = Math.max(...waterData);
        const daysOnTarget = waterData.filter(w => w >= 8).length;

        report += `💧 الماء\n`;
        report += `   المعدل اليومي: ${waterAvg.toFixed(1)} كوب\n`;
        report += `   أعلى يوم: ${waterMax} كوب\n`;
        report += `   أيام فوق الهدف (8): ${daysOnTarget}/${filtered.length}\n\n`;
    }

    // ─── Sleep ────────────────────────────────────
    if (options.includeSleep) {
        const sleepData = filtered.map(d => d.sleep_hours || 0).filter(s => s > 0);
        if (sleepData.length > 0) {
            const sleepAvg = avg(sleepData);
            report += `😴 النوم\n`;
            report += `   المعدل: ${sleepAvg.toFixed(1)} ساعة/يوم\n`;
            report += `   التقييم: ${sleepAvg >= 7 ? '✅ ممتاز' : sleepAvg >= 6 ? '⚡ جيد' : '⚠️ يحتاج تحسين'}\n\n`;
        }
    }

    // ─── Mood ─────────────────────────────────────
    if (options.includeMood) {
        const moodData = filtered.map(d => d.mood || 0).filter(m => m > 0);
        if (moodData.length > 0) {
            const moodAvg = avg(moodData);
            report += `${moodEmoji(moodAvg)} المزاج\n`;
            report += `   المعدل: ${moodAvg.toFixed(1)}/5\n`;
            report += `   أفضل يوم: ${moodEmoji(Math.max(...moodData))} | أصعب يوم: ${moodEmoji(Math.min(...moodData))}\n\n`;
        }
    }

    // ─── Weight ───────────────────────────────────
    if (options.includeWeight) {
        const weightData = filtered.map(d => d.weight || 0).filter(w => w > 0);
        if (weightData.length >= 2) {
            const first = weightData[0];
            const last = weightData[weightData.length - 1];
            const change = last - first;
            report += `⚖️ الوزن\n`;
            report += `   الحالي: ${last.toFixed(1)} كغ\n`;
            report += `   التغيير: ${change > 0 ? '+' : ''}${change.toFixed(1)} كغ\n\n`;
        }
    }

    report += `═══════════════════════\n`;
    report += `🌿 تم إنشاء هذا التقرير من تطبيق طِبرَا`;

    return report;
}

/** Share health report via WhatsApp */
export function shareHealthReportWhatsApp(report: string, doctorNumber = '967771447111') {
    const url = `https://wa.me/${doctorNumber}?text=${encodeURIComponent(report)}`;
    window.open(url, '_blank');
}

/** Copy health report to clipboard */
export async function copyHealthReport(report: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(report);
        return true;
    } catch {
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// CSV EXPORT
// ═══════════════════════════════════════════════════════════════

/** Generate CSV content from health data */
export function generateHealthCSV(
    data: HealthEntry[],
    options: ExportOptions = { period: '7d', includeWater: true, includeSleep: true, includeMood: true, includeWeight: true }
): string {
    const now = new Date();
    let cutoff: Date;

    switch (options.period) {
        case '7d': cutoff = subDays(now, 7); break;
        case '30d': cutoff = subDays(now, 30); break;
        default: cutoff = new Date('2000-01-01');
    }

    const filtered = data
        .filter(d => new Date(d.date) >= cutoff)
        .sort((a, b) => a.date.localeCompare(b.date));

    // Build header row
    const headers: string[] = ['التاريخ'];
    if (options.includeWater) headers.push('الماء (كوب)');
    if (options.includeSleep) headers.push('النوم (ساعة)');
    if (options.includeMood) headers.push('المزاج (1-5)');
    if (options.includeWeight) headers.push('الوزن (كغ)');
    headers.push('ملاحظات');

    // Build data rows
    const rows = filtered.map(entry => {
        const row: string[] = [format(new Date(entry.date), 'yyyy-MM-dd')];
        if (options.includeWater) row.push(String(entry.water_glasses || ''));
        if (options.includeSleep) row.push(String(entry.sleep_hours || ''));
        if (options.includeMood) row.push(String(entry.mood || ''));
        if (options.includeWeight) row.push(String(entry.weight || ''));
        row.push((entry.notes || '').replace(/,/g, '،').replace(/\n/g, ' '));
        return row;
    });

    // Combine into CSV string
    const csvLines = [headers.join(','), ...rows.map(r => r.join(','))];
    return csvLines.join('\n');
}

/** Download health data as a CSV file */
export function downloadHealthCSV(
    data: HealthEntry[],
    options?: ExportOptions,
    filename?: string
): void {
    const csv = generateHealthCSV(data, options);
    const periodLabel = (options?.period || '7d') === '7d' ? 'أسبوع' : (options?.period === '30d' ? 'شهر' : 'كامل');
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const name = filename || `تقرير-طبرا-${periodLabel}-${dateStr}.csv`;

    // Add BOM for UTF-8 to support Arabic in Excel
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

/** Download health report as a text file */
export function downloadHealthReport(
    data: HealthEntry[],
    options?: ExportOptions
): void {
    const report = generateHealthReport(data, options);
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const name = `تقرير-طبرا-${dateStr}.txt`;

    const bom = '\uFEFF';
    const blob = new Blob([bom + report], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}
