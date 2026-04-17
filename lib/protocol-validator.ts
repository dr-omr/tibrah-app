// lib/protocol-validator.ts
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — Protocol Validator (Sprint 5)
// ════════════════════════════════════════════════════════════════════════
//
// validator خفيف يتحقق من اكتمال أي بروتوكول قبل استخدامه.
// يُطلَق فقط في بيئة development — لا overhead في الإنتاج.
// ════════════════════════════════════════════════════════════════════════

import type { RegisteredProtocol, RequiredToolType } from '@/lib/protocol-registry';
import { getAllRegisteredIds, getRegisteredProtocol } from '@/lib/protocol-registry';

export interface ValidationResult {
    subdomainId: string;
    valid: boolean;
    errors: string[];
    warnings: string[];
}

/* ══════════════════════════════════════════════════════════
   VALIDATION RULES
   ══════════════════════════════════════════════════════════ */

function validateProtocol(protocol: RegisteredProtocol): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const sid = String(protocol.subdomainId);

    // ── Required fields ──
    if (!protocol.arabicTitle)  errors.push('arabicTitle مفقود');
    if (!protocol.weekGoal)     errors.push('weekGoal مفقود');
    if (!protocol.completionCopy) errors.push('completionCopy مفقود');

    // ── Days count ──
    if (protocol.days.length !== protocol.totalDays) {
        errors.push(`عدد الأيام ${protocol.days.length} لا يطابق totalDays ${protocol.totalDays}`);
    }

    // ── Required tool types ──
    const toolTypesPresent = protocol.days.map(d => {
        const id = d.toolId;
        if (id.includes('_test'))     return 'test';
        if (id.includes('_practice')) return 'practice';
        if (id.includes('_workshop')) return 'workshop';
        if (id.includes('_tracker'))  return 'tracker';
        if (id.includes('_protocol')) return 'protocol_day';
        return 'unknown';
    });

    const REQUIRED: RequiredToolType[] = ['test', 'practice', 'workshop', 'tracker'];
    for (const req of REQUIRED) {
        if (!toolTypesPresent.includes(req)) {
            errors.push(`أداة من نوع "${req}" مفقودة من تسلسل الأيام`);
        }
    }

    // ── reassessmentTemplate ──
    if (!protocol.reassessmentTemplate) {
        errors.push('reassessmentTemplate مفقود');
    } else {
        const rt = protocol.reassessmentTemplate;
        if (!rt.improvementQuestion) errors.push('reassessmentTemplate.improvementQuestion مفقود');
        if (!rt.nextStepOnImprovement) warnings.push('reassessmentTemplate.nextStepOnImprovement غير محدد');
    }

    // ── handoffCopy ──
    if (!protocol.handoffCopy) {
        errors.push('handoffCopy مفقود');
    } else {
        const hc = protocol.handoffCopy;
        if (!hc.responding)    errors.push('handoffCopy.responding مفقود');
        if (!hc.book_session)  errors.push('handoffCopy.book_session مفقود');
    }

    // ── insightHooks ──
    if (!protocol.insightHooks || protocol.insightHooks.length === 0) {
        warnings.push('insightHooks فارغ — لن تظهر tracker insights في my-plan');
    }

    // ── Phase coverage ──
    const phases = protocol.days.map(d => d.phase);
    const hasAssess = phases.includes('assess');
    if (!hasAssess) warnings.push('لا يوجد يوم بمرحلة assess — يُنصح بإضافته في اليوم الأخير');

    return {
        subdomainId: sid,
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/* ══════════════════════════════════════════════════════════
   PUBLIC API
   ══════════════════════════════════════════════════════════ */

/** Validate all registered protocols. Logs warnings/errors in dev. */
export function validateAllProtocols(): ValidationResult[] {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
        return []; // لا overhead في الإنتاج
    }

    const results: ValidationResult[] = [];

    for (const sid of getAllRegisteredIds()) {
        const protocol = getRegisteredProtocol(sid);
        if (!protocol) continue;
        const result = validateProtocol(protocol);
        results.push(result);

        if (result.errors.length > 0) {
            console.error(`[Tibrah Validator] ❌ ${sid}:\n  ${result.errors.join('\n  ')}`);
        }
        if (result.warnings.length > 0) {
            console.warn(`[Tibrah Validator] ⚠️  ${sid}:\n  ${result.warnings.join('\n  ')}`);
        }
        if (result.valid && result.warnings.length === 0) {
            console.info(`[Tibrah Validator] ✅ ${sid}: بروتوكول مكتمل`);
        }
    }

    return results;
}

/** Validate a single protocol by subdomain ID. */
export function validateProtocolById(subdomainId: string): ValidationResult | null {
    const protocol = getRegisteredProtocol(subdomainId);
    if (!protocol) return null;
    return validateProtocol(protocol);
}

/** Returns true if all registered protocols pass validation. */
export function allProtocolsValid(): boolean {
    return validateAllProtocols().every(r => r.valid);
}
