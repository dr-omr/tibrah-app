// __tests__/hooks/usePullToRefresh.test.ts
// Unit tests for usePullToRefresh hook

import { renderHook, act } from '@testing-library/react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

describe('usePullToRefresh Hook', () => {
    test('should initialize with default state', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => usePullToRefresh({ onRefresh }));

        expect(result.current.pullDistance).toBe(0);
        expect(result.current.refreshing).toBe(false);
        expect(result.current.progress).toBe(0);
        expect(result.current.containerRef).toBeDefined();
    });

    test('should accept custom threshold', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() =>
            usePullToRefresh({ onRefresh, threshold: 100 })
        );
        expect(result.current.pullDistance).toBe(0);
    });

    test('should accept custom maxPull', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() =>
            usePullToRefresh({ onRefresh, maxPull: 200 })
        );
        expect(result.current.pullDistance).toBe(0);
    });

    test('progress should be clamped between 0 and 1', () => {
        const onRefresh = jest.fn().mockResolvedValue(undefined);
        const { result } = renderHook(() => usePullToRefresh({ onRefresh }));
        expect(result.current.progress).toBeGreaterThanOrEqual(0);
        expect(result.current.progress).toBeLessThanOrEqual(1);
    });
});
