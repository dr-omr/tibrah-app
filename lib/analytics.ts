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
