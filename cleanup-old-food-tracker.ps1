# cleanup-old-food-tracker.ps1
# حذف نظام متتبع الطعام القديم (daily-log + meal-planner) فقط
# health-tracker يبقى لأنه نظام صحي متكامل (نوم، ماء، دواء، لياقة)
# شغّل هذا السكريبت من مجلد المشروع

Write-Host ""
Write-Host "🗑️  حذف نظام متتبع الطعام القديم..." -ForegroundColor Yellow
Write-Host "   (health-tracker يبقى — هو نظام صحي متكامل وليس متتبع طعام)" -ForegroundColor Cyan
Write-Host ""

# ── صفحات Pages المحذوفة ──
$pagesToDelete = @(
    "pages\daily-log.tsx",
    "pages\meal-planner.tsx"
)

foreach ($file in $pagesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✅ حُذف: $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  غير موجود (ربما حُذف مسبقاً): $file" -ForegroundColor Gray
    }
}

# ── مجلدات Components المحذوفة ──
$dirsToDelete = @(
    "components\daily-log",
    "components\meal-planner"
)

foreach ($dir in $dirsToDelete) {
    if (Test-Path $dir) {
        Remove-Item $dir -Recurse -Force
        Write-Host "  ✅ حُذف: $dir\" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  غير موجود: $dir\" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✅ تم بنجاح!" -ForegroundColor Green
Write-Host ""
Write-Host "📌 الإعادة التوجيه (301 Permanent) مُعرَّفة في next.config.js:" -ForegroundColor Cyan
Write-Host "   /daily-log    → /tayyibat/tracker" -ForegroundColor White
Write-Host "   /meal-planner → /tayyibat" -ForegroundColor White
Write-Host "   /health-tracker → /tayyibat  (302 Temporary — يبقى كصفحة أصلية)" -ForegroundColor White
Write-Host ""
Write-Host "🔨 الآن شغّل: npm run build" -ForegroundColor Yellow
