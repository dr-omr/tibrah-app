// components/common/PageLoader.tsx
// مكون wrapper للصفحات يوفر حالات التحميل والخطأ الموحدة

import React, { ReactNode } from 'react';
import LoadingScreen from './LoadingScreen';
import ErrorState from './ErrorState';

interface PageLoaderProps {
    children: ReactNode;
    isLoading?: boolean;
    isError?: boolean;
    error?: Error | null;
    onRetry?: () => void;
    loadingMessage?: string;
    errorTitle?: string;
    errorMessage?: string;
    variant?: 'default' | 'fullscreen' | 'inline';
    minHeight?: string;
}

export default function PageLoader({
    children,
    isLoading = false,
    isError = false,
    error = null,
    onRetry,
    loadingMessage = 'جاري التحميل...',
    errorTitle,
    errorMessage,
    variant = 'default',
    minHeight = 'min-h-[50vh]',
}: PageLoaderProps) {
    // حالة التحميل
    if (isLoading) {
        return (
            <div className={minHeight}>
                <LoadingScreen message={loadingMessage} variant={variant} />
            </div>
        );
    }

    // حالة الخطأ
    if (isError) {
        return (
            <div className={minHeight}>
                <ErrorState
                    title={errorTitle}
                    message={errorMessage || error?.message}
                    onRetry={onRetry || (() => window.location.reload())}
                />
            </div>
        );
    }

    // المحتوى العادي
    return <>{children}</>;
}

// مكون للاستخدام مع React Query
interface QueryLoaderProps<T> {
    query: {
        isLoading: boolean;
        isError: boolean;
        error: Error | null;
        data: T | undefined;
        refetch: () => void;
    };
    children: (data: T) => ReactNode;
    loadingMessage?: string;
    errorTitle?: string;
    variant?: 'default' | 'fullscreen' | 'inline';
}

export function QueryLoader<T>({
    query,
    children,
    loadingMessage,
    errorTitle,
    variant = 'default',
}: QueryLoaderProps<T>) {
    return (
        <PageLoader
            isLoading={query.isLoading}
            isError={query.isError}
            error={query.error}
            onRetry={() => query.refetch()}
            loadingMessage={loadingMessage}
            errorTitle={errorTitle}
            variant={variant}
        >
            {query.data ? children(query.data) : null}
        </PageLoader>
    );
}

// مكون للتحميل الكسول (Suspense-like)
export function LazyLoader({
    children,
    fallback,
}: {
    children: ReactNode;
    fallback?: ReactNode;
}) {
    return (
        <React.Suspense
            fallback={
                fallback || (
                    <div className="min-h-[200px]">
                        <LoadingScreen variant="inline" message="جاري التحميل..." />
                    </div>
                )
            }
        >
            {children}
        </React.Suspense>
    );
}
