// __tests__/components/AdminStats.test.tsx
// Unit tests for AdminStats component

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminStats from '@/components/admin/AdminStats';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('AdminStats Component', () => {
    const defaultProps = {
        usersCount: 50,
        productsCount: 20,
        coursesCount: 10,
        articlesCount: 15,
    };

    test('should render without crashing', () => {
        const { container } = render(<AdminStats {...defaultProps} />);
        expect(container).toBeTruthy();
    });

    test('should display the system status', () => {
        render(<AdminStats {...defaultProps} />);
        expect(screen.getByText('النظام يعمل')).toBeInTheDocument();
    });

    test('should display stat card titles', () => {
        render(<AdminStats {...defaultProps} />);
        expect(screen.getByText('إجمالي المستخدمين')).toBeInTheDocument();
        expect(screen.getByText('إجمالي المبيعات')).toBeInTheDocument();
        expect(screen.getByText('المنتجات النشطة')).toBeInTheDocument();
        expect(screen.getByText('المحتوى التعليمي')).toBeInTheDocument();
    });

    test('should display activity feed', () => {
        render(<AdminStats {...defaultProps} />);
        expect(screen.getByText('آخر النشاطات')).toBeInTheDocument();
    });

    test('should display quick insights', () => {
        render(<AdminStats {...defaultProps} />);
        expect(screen.getByText('ملخص سريع')).toBeInTheDocument();
    });

    test('should handle zero counts', () => {
        const { container } = render(
            <AdminStats usersCount={0} productsCount={0} coursesCount={0} articlesCount={0} />
        );
        expect(container).toBeTruthy();
    });
});
