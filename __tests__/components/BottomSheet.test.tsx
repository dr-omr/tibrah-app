// __tests__/components/BottomSheet.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BottomSheet from '@/components/common/BottomSheet';

jest.mock('framer-motion', () => ({
    motion: {
        div: React.forwardRef(({ children, onClick, ...props }: any, ref: any) => (
            <div ref={ref} onClick={onClick} {...props}>{children}</div>
        )),
        button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('BottomSheet Component', () => {
    const mockOnClose = jest.fn();

    beforeEach(() => mockOnClose.mockClear());

    test('should not render when closed', () => {
        const { container } = render(
            <BottomSheet isOpen={false} onClose={mockOnClose}><div>المحتوى</div></BottomSheet>
        );
        expect(container.textContent).toBe('');
    });

    test('should render content when open', () => {
        render(
            <BottomSheet isOpen={true} onClose={mockOnClose}><div>محتوى الشيت</div></BottomSheet>
        );
        expect(screen.getByText('محتوى الشيت')).toBeInTheDocument();
    });

    test('should render title when provided', () => {
        render(
            <BottomSheet isOpen={true} onClose={mockOnClose} title="عنوان"><div>محتوى</div></BottomSheet>
        );
        expect(screen.getByText('عنوان')).toBeInTheDocument();
    });

    test('should render close button with title', () => {
        render(
            <BottomSheet isOpen={true} onClose={mockOnClose} title="اختبار"><div>محتوى</div></BottomSheet>
        );
        const closeButtons = screen.getAllByRole('button');
        expect(closeButtons.length).toBeGreaterThan(0);
    });
});
