/**
 * Maps raw Firebase authentication error codes into culturally aware,
 * premium, and secure user-facing messages.
 * We deliberately mask enumeration vectors (like user-not-found) in certain contexts.
 */
export const mapAuthError = (errorCode: string): string => {
    switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.';
        case 'auth/too-many-requests':
            return 'تم تقييد حسابك مؤقتاً لحمايتك بسبب كثرة المحاولات. يرجى المحاولة لاحقاً.';
        case 'auth/email-already-in-use':
            return 'هذا البريد مرتبط بحساب موجود بالفعل. تفضل بتسجيل الدخول.';
        case 'auth/invalid-email':
            return 'صيغة البريد الإلكتروني غير صحيحة.';
        case 'auth/weak-password':
            return 'كلمة المرور ضعيفة. يرجى استخدام 8 أحرف على الأقل.';
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled':
            return 'تم إلغاء عملية الدخول. يرجى المتابعة عند الاستعداد.';
        case 'auth/network-request-failed':
            return 'نأسف، يبدو أن هناك مشكلة في الاتصال. يرجى التحقق من الشبكة وإعادة المحاولة.';
        case 'auth/account-exists-with-different-credential':
            return 'هذا البريد مرتبط بمزود دخول آخر (مثل جوجل أو آبل). يرجى استخدام الطريقة السابقة.';
        case 'auth/invalid-action-code':
        case 'auth/expired-action-code':
            return 'الرابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد للمتابعة.';
        default:
            console.error('Unhandled Auth Error Code:', errorCode);
            return 'عفواً، حدث خطأ غير متوقع. يرجى المحاولة لاحقاً أو الاتصال بالدعم.';
    }
};

/**
 * Ensures a redirect path is local and safe to prevent open redirect vulnerabilities.
 */
export const validateRedirectPath = (path: string | string[] | undefined, defaultPath: string = '/'): string => {
    const rawPath = Array.isArray(path) ? path[0] : path;
    if (!rawPath || typeof rawPath !== 'string') return defaultPath;
    
    // Only allow absolute paths within the application domain, disallow external URLs (//, http, https)
    if (rawPath.startsWith('/') && !rawPath.startsWith('//')) {
        return rawPath;
    }
    return defaultPath;
};
