// lib/analytics.ts
// نظام تحليلات بسيط لتتبع سلوك المستخدم

type EventProperties = Record<string, string | number | boolean | null>;

interface AnalyticsEvent {
    name: string;
    properties?: EventProperties;
    timestamp: string;
}

// تخزين محلي للأحداث (يمكن إرسالها لاحقاً لخادم التحليلات)
const eventQueue: AnalyticsEvent[] = [];

// تعريف أحداث التطبيق
export const ANALYTICS_EVENTS = {
    // أحداث الصفحات
    PAGE_VIEW: 'page_view',

    // أحداث المستخدم
    USER_LOGIN: 'user_login',
    USER_REGISTER: 'user_register',
    USER_LOGOUT: 'user_logout',

    // أحداث الحجز
    BOOKING_STARTED: 'booking_started',
    BOOKING_COMPLETED: 'booking_completed',
    BOOKING_ABANDONED: 'booking_abandoned',

    // أحداث المتجر
    PRODUCT_VIEWED: 'product_viewed',
    ADD_TO_CART: 'add_to_cart',
    CHECKOUT_STARTED: 'checkout_started',
    PURCHASE_COMPLETED: 'purchase_completed',

    // أحداث التفاعل
    BUTTON_CLICK: 'button_click',
    LINK_CLICK: 'link_click',
    FORM_SUBMIT: 'form_submit',
    SEARCH: 'search',

    // أحداث الميزات
    AI_ASSISTANT_OPENED: 'ai_assistant_opened',
    AI_MESSAGE_SENT: 'ai_message_sent',
    BODY_MAP_AREA_SELECTED: 'body_map_area_selected',
    FREQUENCY_PLAYED: 'frequency_played',
    HEALTH_LOG_SAVED: 'health_log_saved',

    // أحداث الأداء
    ERROR_OCCURRED: 'error_occurred',
    SLOW_LOAD: 'slow_load',

    // أحداث التقييم والتوجيه
    ASSESSMENT_STARTED: 'assessment_started',
    ASSESSMENT_PATHWAY_SELECTED: 'assessment_pathway_selected',
    ASSESSMENT_COMPLETED: 'assessment_completed',
    ROUTING_RESULT_VIEWED: 'routing_result_viewed',
    ROUTING_TOOL_OPENED: 'routing_tool_opened',
    ROUTING_ESCALATION_SHOWN: 'routing_escalation_shown',
    BOOKING_FROM_ROUTING: 'booking_from_routing',
    // أحداث البروتوكول والـ Outcome Loop (Sprint 2)
    PROTOCOL_STARTED:                'protocol_started',
    PROTOCOL_DAY_COMPLETED:          'protocol_day_completed',
    PROTOCOL_OUTCOME_LOGGED:         'protocol_outcome_logged',
    PROTOCOL_REASSESSMENT_SHOWN:     'protocol_reassessment_shown',
    PROTOCOL_REASSESSMENT_COMPLETED: 'protocol_reassessment_completed',
    PROTOCOL_BOOKING_CLICKED:        'protocol_booking_clicked',
    // أحداث الأدوات والـ Completion Trust (Sprint 4)
    TOOL_PAGE_VIEWED:               'tool_page_viewed',
    TOOL_COMPLETED:                 'tool_completed',
    TOOL_ABANDONED:                 'tool_abandoned',
    COMPLETION_SCREEN_VIEWED:       'completion_screen_viewed',
    RETURNED_TO_MY_PLAN:            'returned_to_my_plan',
    CHECKIN_CLICKED_FROM_COMPLETION:'checkin_clicked_from_completion',
} as const;

// دالة لتسجيل حدث
export function trackEvent(
    eventName: string,
    properties?: EventProperties
): void {
    // تجاهل في وضع التطوير إذا لم يكن مطلوباً
    // if (process.env.NODE_ENV === 'development') {
    //     console.log('[Analytics]', eventName, properties);
    //     return;
    // }

    const event: AnalyticsEvent = {
        name: eventName,
        properties: {
            ...properties,
            url: typeof window !== 'undefined' ? window.location.pathname : null,
            referrer: typeof document !== 'undefined' ? document.referrer : null,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        },
        timestamp: new Date().toISOString(),
    };

    // إضافة للقائمة
    eventQueue.push(event);

    // حفظ في localStorage للـ dashboard
    if (typeof window !== 'undefined') {
        try {
            const KEY = 'tibrah_analytics';
            const existing: AnalyticsEvent[] = JSON.parse(localStorage.getItem(KEY) || '[]');
            existing.push(event);
            // أبقِ آخر 500 حدث فقط
            if (existing.length > 500) existing.splice(0, existing.length - 500);
            localStorage.setItem(KEY, JSON.stringify(existing));
        } catch { /* quota exceeded — ignore */ }
    }

    // تسجيل في Console للتطوير
    if (process.env.NODE_ENV === 'development') {
        console.log('[Analytics]', event.name, event.properties);
    }

    // يمكن إرسال للخادم هنا
    // sendToServer(event);
}

// دالة لتتبع مشاهدات الصفحات
export function trackPageView(pageName: string, additionalProps?: EventProperties): void {
    trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {
        page_name: pageName,
        ...additionalProps,
    });
}

// دالة لتتبع النقرات
export function trackClick(elementName: string, additionalProps?: EventProperties): void {
    trackEvent(ANALYTICS_EVENTS.BUTTON_CLICK, {
        element: elementName,
        ...additionalProps,
    });
}

// دالة لتتبع الأخطاء
export function trackError(error: Error, context?: string): void {
    trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: error.message,
        error_name: error.name,
        error_stack: error.stack?.slice(0, 500) || null,
        context: context || null,
    });
}

// دالة لقياس الأداء
export function trackPerformance(metric: string, value: number): void {
    trackEvent('performance_metric', {
        metric,
        value,
    });
}

// دالة للحصول على قائمة الأحداث (للتصحيح)
export function getEventQueue(): AnalyticsEvent[] {
    return [...eventQueue];
}

// دالة لمسح قائمة الأحداث
export function clearEventQueue(): void {
    eventQueue.length = 0;
}

// Hook للاستخدام في React
export function useAnalytics() {
    return {
        trackEvent,
        trackPageView,
        trackClick,
        trackError,
        trackPerformance,
        events: ANALYTICS_EVENTS,
    };
}

export default {
    trackEvent,
    trackPageView,
    trackClick,
    trackError,
    trackPerformance,
    getEventQueue,
    clearEventQueue,
    EVENTS: ANALYTICS_EVENTS,
};
