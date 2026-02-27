// __tests__/components/ActivityLog.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActivityLog from '@/components/admin/ActivityLog';

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ActivityLog Component', () => {
    const mockUsers = [
        { id: '1', name: 'أحمد', email: 'ahmed@test.com', created_at: new Date().toISOString() },
        { id: '2', name: 'سارة', email: 'sara@test.com', created_at: new Date().toISOString() },
    ];
    const mockAppointments = [
        { id: 'a1', service: 'استشارة صحية', status: 'pending', created_date: new Date().toISOString() },
    ];
    const mockProducts = [
        { id: 'p1', name: 'مكمل غذائي', created_at: new Date().toISOString() },
    ];
    const mockCourses = [
        { id: 'c1', title: 'دورة التغذية', created_at: new Date().toISOString() },
    ];

    test('should render without crashing', () => {
        const { container } = render(
            <ActivityLog users={mockUsers} appointments={mockAppointments} products={mockProducts} courses={mockCourses} />
        );
        expect(container).toBeTruthy();
    });

    test('should display header', () => {
        render(<ActivityLog users={mockUsers} appointments={mockAppointments} products={mockProducts} courses={mockCourses} />);
        expect(screen.getByText('سجل النشاطات')).toBeInTheDocument();
    });

    test('should display filter buttons', () => {
        render(<ActivityLog users={mockUsers} appointments={mockAppointments} products={mockProducts} courses={mockCourses} />);
        expect(screen.getByText('الكل')).toBeInTheDocument();
        expect(screen.getByText('المستخدمين')).toBeInTheDocument();
    });

    test('should display footer stats', () => {
        render(<ActivityLog users={mockUsers} appointments={mockAppointments} products={mockProducts} courses={mockCourses} />);
        expect(screen.getByText('مستخدم')).toBeInTheDocument();
        expect(screen.getByText('موعد')).toBeInTheDocument();
    });

    test('should handle empty data', () => {
        render(<ActivityLog users={[]} appointments={[]} products={[]} courses={[]} />);
        expect(screen.getByText('لا توجد نشاطات بعد')).toBeInTheDocument();
    });
});
