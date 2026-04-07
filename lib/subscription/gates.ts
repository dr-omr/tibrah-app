import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import db from '@/lib/db';

export type FeatureName = 
    | 'ai_vision'           // Prescription scanning
    | 'advanced_metrics'    // Full health history analytics
    | 'weekly_reports'      // AI generated insights
    | 'family_hub'          // Manage > 1 family member
    | 'priority_booking'    // 24hr telehealth SLA
    | 'telehealth'          // Remote consultations
    | 'rife_frequencies_pro';

interface GateResult {
    allowed: boolean;
    reason: string;
    upgradePrompt: string;
    loading: boolean;
}

/**
 * Hook to check if a feature is available to the current user
 * Uses Fallback memory if backend is slow/offline
 */
export function useFeatureGate(feature: FeatureName): GateResult {
    const { user } = useAuth();
    const [result, setResult] = useState<GateResult>({
        allowed: false,
        reason: 'checking',
        upgradePrompt: '',
        loading: true
    });

    useEffect(() => {
        // Safe defaults
        if (!user) {
            setResult({
                allowed: false,
                reason: 'not_authenticated',
                upgradePrompt: 'سجل دخولك أو اشترك للوصول لهذه الميزة',
                loading: false
            });
            return;
        }

        const checkAccess = async () => {
             try {
                // Fetch user data from DB to see subscription
                const dbUser = await db.entities.User.get(user.id);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const profile = dbUser as any; 
                const isPremium = profile?.loyalty_tier === 'gold' || profile?.loyalty_tier === 'platinum' || profile?.settings?.subscription?.active;

                // Free Features limits
                if (feature === 'telehealth') {
                    setResult({ allowed: true, reason: 'pay_per_use', upgradePrompt: '', loading: false });
                    return;
                }
                
                // Premium Only Features
                if (!isPremium) {
                    switch(feature) {
                        case 'advanced_metrics':
                            setResult({ allowed: false, reason: 'premium_required', upgradePrompt: 'رقِ حسابك لفتح التحليلات الذكية الشاملة', loading: false });
                            return;
                        case 'weekly_reports':
                            setResult({ allowed: false, reason: 'premium_required', upgradePrompt: 'احصل على تقرير أسبوعي مفصل مع الاشتراك المميز', loading: false });
                            return;
                        case 'ai_vision':
                            setResult({ allowed: false, reason: 'premium_required', upgradePrompt: 'رقِ حسابك لتصوير الروشتات وتحليلات الذكاء الاصطناعي الكاملة', loading: false });
                            return;
                        case 'family_hub':
                            setResult({ allowed: false, reason: 'premium_required', upgradePrompt: 'أضف حتى 5 أفراد من عائلتك مع اشتراك العائلة', loading: false });
                            return;
                        case 'priority_booking':
                            setResult({ allowed: false, reason: 'premium_required', upgradePrompt: 'أولوية في حجز المواعيد لاشتراكات Premium', loading: false });
                            return;
                        case 'rife_frequencies_pro':
                            setResult({ allowed: false, reason: 'premium_required', upgradePrompt: 'افتح مكتبة الترددات الشفائية الكاملة', loading: false });
                            return;
                        default:
                            setResult({ allowed: false, reason: 'premium_required', upgradePrompt: 'مطلوب باقة بلس أو أعلى', loading: false });
                            return;
                    }
                }

                setResult({ allowed: true, reason: 'is_premium', upgradePrompt: '', loading: false });

             } catch (e) {
                 // Fallback to allowed in dev or failure
                 setResult({ allowed: false, reason: 'db_error', upgradePrompt: 'فشل التحقق من حالة الاشتراك', loading: false });
             }
        };

        checkAccess();

    }, [user, feature]);

    return result;
}
