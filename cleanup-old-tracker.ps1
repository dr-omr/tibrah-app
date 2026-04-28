# cleanup-old-tracker.ps1
# حذف نظام متتبع الطعام القديم واستبداله بنظام الطيبات
# شغّل هذا السكريبت من مجلد المشروع

Write-Host "🗑️  جارٍ حذف صفحات الطعام القديمة..." -ForegroundColor Yellow

# ── صفحات Pages ──
$pagesToDelete = @(
    "pages\daily-log.tsx",
    "pages\meal-planner.tsx",
    "pages\health-tracker.tsx"
)

foreach ($file in $pagesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ حُذف: $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  غير موجود: $file" -ForegroundColor Gray
    }
}

# ── مجلدات Components ──
$dirsToDelete = @(
    "components\daily-log",
    "components\meal-planner"
)

foreach ($dir in $dirsToDelete) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
        Write-Host "  ✅ حُذف: $dir" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  غير موجود: $dir" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ تم الحذف بنجاح!" -ForegroundColor Green
Write-Host "📌 تذكر: المسارات القديمة ستُعاد توجيهها تلقائياً:" -ForegroundColor Cyan
Write-Host "   /daily-log    → /tayyibat/tracker" -ForegroundColor White
Write-Host "   /meal-planner → /tayyibat" -ForegroundColor White
Write-Host "   /health-tracker → /tayyibat" -ForegroundColor White
Write-Host ""
Write-Host "الآن شغّل: npm run build" -ForegroundColor Yellow
