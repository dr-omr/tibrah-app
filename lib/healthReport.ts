/**
 * Health Report PDF Generator
 * Generates a printable/downloadable health summary report
 * Uses browser-native print API (no external library needed)
 */

interface ReportData {
    userName?: string;
    date: string;
    period: 'weekly' | 'monthly';
    waterData?: { avgCups: number; totalDays: number; goalDays: number };
    sleepData?: { avgHours: number; bestDay: string; worstDay: string };
    weightData?: { current: number; change: number; trend: 'up' | 'down' | 'stable' };
    moodData?: { avgScore: number; totalEntries: number };
    fastingData?: { totalSessions: number; avgHours: number };
    exerciseData?: { totalMinutes: number; sessions: number };
    medications?: { name: string; adherence: number }[];
    challengesCompleted?: number;
    streak?: number;
    aiRecommendations?: string[];
}

function getHealthScoreEmoji(score: number): string {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    if (score >= 40) return '🟠';
    return '🔴';
}

function calculateHealthScore(data: ReportData): number {
    let score = 50; // Base score
    let factors = 0;

    if (data.waterData) {
        factors++;
        score += data.waterData.avgCups >= 8 ? 10 : (data.waterData.avgCups / 8) * 10;
    }
    if (data.sleepData) {
        factors++;
        const sleepScore = data.sleepData.avgHours >= 7 && data.sleepData.avgHours <= 9 ? 10 : Math.max(0, 10 - Math.abs(data.sleepData.avgHours - 8) * 3);
        score += sleepScore;
    }
    if (data.moodData) {
        factors++;
        score += (data.moodData.avgScore / 10) * 10;
    }
    if (data.exerciseData && data.exerciseData.totalMinutes > 0) {
        factors++;
        score += Math.min(10, (data.exerciseData.totalMinutes / 150) * 10);
    }
    if (data.streak && data.streak > 0) {
        score += Math.min(10, data.streak);
    }

    return Math.min(100, Math.round(score));
}

/**
 * Collect report data from localStorage health trackers
 */
export function collectReportData(period: 'weekly' | 'monthly' = 'weekly'): ReportData {
    const now = new Date();
    const daysBack = period === 'weekly' ? 7 : 30;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const report: ReportData = {
        date: now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }),
        period,
    };

    // Try to get user name
    try {
        const authData = localStorage.getItem('tibrah_auth');
        if (authData) {
            const auth = JSON.parse(authData);
            report.userName = auth.displayName || auth.name;
        }
    } catch { }

    // Collect water data
    try {
        const waterLogs = JSON.parse(localStorage.getItem('tibrah_water_logs') || '[]');
        const recentLogs = waterLogs.filter((l: any) => new Date(l.date) >= startDate);
        if (recentLogs.length > 0) {
            const totalCups = recentLogs.reduce((sum: number, l: any) => sum + (l.cups || l.amount || 0), 0);
            report.waterData = {
                avgCups: Math.round((totalCups / recentLogs.length) * 10) / 10,
                totalDays: recentLogs.length,
                goalDays: recentLogs.filter((l: any) => (l.cups || l.amount || 0) >= 8).length,
            };
        }
    } catch { }

    // Collect sleep data
    try {
        const sleepLogs = JSON.parse(localStorage.getItem('tibrah_sleep_logs') || '[]');
        const recentLogs = sleepLogs.filter((l: any) => new Date(l.date) >= startDate);
        if (recentLogs.length > 0) {
            const hours = recentLogs.map((l: any) => l.hours || l.duration || 0);
            report.sleepData = {
                avgHours: Math.round((hours.reduce((a: number, b: number) => a + b, 0) / hours.length) * 10) / 10,
                bestDay: hours.indexOf(Math.max(...hours)) >= 0 ? recentLogs[hours.indexOf(Math.max(...hours))]?.date || '' : '',
                worstDay: hours.indexOf(Math.min(...hours)) >= 0 ? recentLogs[hours.indexOf(Math.min(...hours))]?.date || '' : '',
            };
        }
    } catch { }

    // Collect challenge stats
    try {
        const challengeData = JSON.parse(localStorage.getItem('tibrah_daily_challenges') || '{}');
        report.streak = challengeData.streak?.current || 0;
        report.challengesCompleted = challengeData.challenges?.filter((c: any) => c.completed).length || 0;
    } catch { }

    // Collect mood data
    try {
        const moodLogs = JSON.parse(localStorage.getItem('tibrah_mood_logs') || '[]');
        const recentLogs = moodLogs.filter((l: any) => new Date(l.date) >= startDate);
        if (recentLogs.length > 0) {
            const scores = recentLogs.map((l: any) => l.score || l.mood || 5);
            report.moodData = {
                avgScore: Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10,
                totalEntries: recentLogs.length,
            };
        }
    } catch { }

    return report;
}

/**
 * Generate and open a printable HTML report
 */
export function generateHealthReport(data?: ReportData): void {
    const report = data || collectReportData();
    const healthScore = calculateHealthScore(report);
    const scoreEmoji = getHealthScoreEmoji(healthScore);
    const periodLabel = report.period === 'weekly' ? 'الأسبوعي' : 'الشهري';

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>تقرير طِبرَا الصحي ${periodLabel}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Cairo', sans-serif; background: #f8fafc; color: #1e293b; padding: 24px; max-width: 800px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #2D9B83, #3FB39A); color: white; padding: 32px; border-radius: 20px; margin-bottom: 24px; text-align: center; }
        .header h1 { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
        .header p { opacity: 0.85; font-size: 14px; }
        .score-circle { width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-direction: column; margin: 20px auto 10px; border: 4px solid rgba(255,255,255,0.4); }
        .score-number { font-size: 36px; font-weight: 800; line-height: 1; }
        .score-label { font-size: 12px; opacity: 0.8; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
        .card { background: white; border-radius: 16px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .card-title { font-size: 14px; font-weight: 700; color: #64748b; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .card-value { font-size: 28px; font-weight: 800; color: #1e293b; }
        .card-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }
        .full-width { grid-column: 1 / -1; }
        .recommendations { list-style: none; padding: 0; }
        .recommendations li { padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; display: flex; align-items: flex-start; gap: 8px; }
        .recommendations li::before { content: '✓'; color: #2D9B83; font-weight: 700; flex-shrink: 0; }
        .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 24px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-green { background: #dcfce7; color: #16a34a; }
        .badge-amber { background: #fef3c7; color: #d97706; }
        .badge-red { background: #fee2e2; color: #dc2626; }
        .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; border-radius: 4px; background: linear-gradient(90deg, #2D9B83, #3FB39A); }
        @media print { body { padding: 0; } .header { break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌿 تقرير طِبرَا الصحي ${periodLabel}</h1>
        <p>${report.userName ? report.userName + ' — ' : ''}${report.date}</p>
        <div class="score-circle">
            <span class="score-number">${healthScore}</span>
            <span class="score-label">نقطة صحة</span>
        </div>
        <span class="badge ${healthScore >= 80 ? 'badge-green' : healthScore >= 60 ? 'badge-amber' : 'badge-red'}">
            ${scoreEmoji} ${healthScore >= 80 ? 'ممتاز' : healthScore >= 60 ? 'جيد' : healthScore >= 40 ? 'بحاجة لتحسين' : 'يحتاج اهتمام'}
        </span>
    </div>

    <div class="grid">
        ${report.waterData ? `
        <div class="card">
            <div class="card-title">💧 شرب الماء</div>
            <div class="card-value">${report.waterData.avgCups} <span style="font-size:14px;color:#94a3b8">كوب/يوم</span></div>
            <div class="card-sub">أيام تحقيق الهدف: ${report.waterData.goalDays} من ${report.waterData.totalDays}</div>
            <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, (report.waterData.avgCups / 8) * 100)}%"></div></div>
        </div>` : ''}

        ${report.sleepData ? `
        <div class="card">
            <div class="card-title">🌙 النوم</div>
            <div class="card-value">${report.sleepData.avgHours} <span style="font-size:14px;color:#94a3b8">ساعة/ليلة</span></div>
            <div class="card-sub">الهدف: 7-9 ساعات</div>
            <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(100, (report.sleepData.avgHours / 8) * 100)}%"></div></div>
        </div>` : ''}

        ${report.moodData ? `
        <div class="card">
            <div class="card-title">😊 المزاج</div>
            <div class="card-value">${report.moodData.avgScore}/10</div>
            <div class="card-sub">${report.moodData.totalEntries} تسجيل خلال الفترة</div>
        </div>` : ''}

        ${report.weightData ? `
        <div class="card">
            <div class="card-title">⚖️ الوزن</div>
            <div class="card-value">${report.weightData.current} <span style="font-size:14px;color:#94a3b8">كجم</span></div>
            <div class="card-sub" style="color:${report.weightData.trend === 'down' ? '#16a34a' : report.weightData.trend === 'up' ? '#dc2626' : '#64748b'}">
                ${report.weightData.change > 0 ? '+' : ''}${report.weightData.change} كجم
            </div>
        </div>` : ''}

        ${report.streak !== undefined ? `
        <div class="card">
            <div class="card-title">🔥 السلسلة</div>
            <div class="card-value">${report.streak} <span style="font-size:14px;color:#94a3b8">يوم متتالي</span></div>
            <div class="card-sub">${report.challengesCompleted || 0} تحدي مكتمل</div>
        </div>` : ''}

        ${report.fastingData ? `
        <div class="card">
            <div class="card-title">⏰ الصيام المتقطع</div>
            <div class="card-value">${report.fastingData.avgHours} <span style="font-size:14px;color:#94a3b8">ساعة متوسط</span></div>
            <div class="card-sub">${report.fastingData.totalSessions} جلسة صيام</div>
        </div>` : ''}
    </div>

    <div class="card full-width" style="margin-bottom:16px">
        <div class="card-title">💡 توصيات شخصية</div>
        <ul class="recommendations">
            ${report.waterData && report.waterData.avgCups < 8 ? '<li>زد شرب الماء — الهدف 8 أكواب يومياً. جرب وضع زجاجة ماء بجانبك</li>' : ''}
            ${report.sleepData && report.sleepData.avgHours < 7 ? '<li>نومك أقل من المطلوب. جرب النوم قبل 11 مساءً وابتعد عن الشاشات</li>' : ''}
            ${report.sleepData && report.sleepData.avgHours >= 7 ? '<li>نومك ممتاز! حافظ على هذا الروتين الصحي</li>' : ''}
            ${report.moodData && report.moodData.avgScore < 6 ? '<li>مزاجك يحتاج اهتمام. جرب تمارين التنفس والمشي 20 دقيقة يومياً</li>' : ''}
            ${(report.streak || 0) >= 3 ? '<li>أحسنت على المواظبة! سلسلتك رائعة — استمر</li>' : '<li>جرب إكمال تحدي صحي يومياً لبناء عادات صحية</li>'}
            <li>احرص على وجبة واحدة متوازنة يومياً غنية بالخضروات</li>
            <li>خصص 5 دقائق يومياً لتمارين التنفس العميق</li>
        </ul>
    </div>

    <div class="footer">
        <p>🌿 تقرير مُعد بواسطة تطبيق <strong>طِبرَا</strong> — العيادة الرقمية للطب الوظيفي</p>
        <p>د. عمر العماد — أخصائي الطب الوظيفي والتكاملي</p>
        <p style="margin-top:8px;font-size:11px">هذا التقرير استرشادي ولا يغني عن الاستشارة الطبية المتخصصة</p>
    </div>
</body>
</html>`;

    // Open in new window for printing/saving
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        // Auto-trigger print dialog after a short delay
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
}
