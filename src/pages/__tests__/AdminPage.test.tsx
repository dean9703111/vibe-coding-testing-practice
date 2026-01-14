import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AdminPage } from '../AdminPage';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock useAuth
const mockLogout = vi.fn();
const mockAuthContext = {
    user: { username: 'admin', role: 'admin' },
    logout: mockLogout,
};

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockAuthContext,
}));

describe('AdminPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset default mock values
        mockAuthContext.user = { username: 'admin', role: 'admin' };
        mockAuthContext.logout = mockLogout;
    });

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <AdminPage />
            </BrowserRouter>
        );
    };

    describe('前端元素', () => {
        it('檢查頁面基本元素渲染', () => {
            renderComponent();

            expect(screen.getByRole('heading', { name: '🛠️ 管理後台' })).toBeInTheDocument();
            expect(screen.getByText('← 返回')).toBeInTheDocument();
            expect(screen.getByText('管理員')).toBeInTheDocument(); // Badge content
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
            expect(screen.getByText('管理員專屬頁面')).toBeInTheDocument();
        });
    });

    describe('Function 邏輯', () => {
        it('檢查返回連結', () => {
            renderComponent();
            const backLink = screen.getByText('← 返回');
            expect(backLink).toHaveAttribute('href', '/dashboard');
        });

        it('登出功能', () => {
            renderComponent();
            const logoutButton = screen.getByRole('button', { name: '登出' });
            fireEvent.click(logoutButton);

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });

    describe('RBAC', () => {
        it('顯示正確的角色標籤 (Admin)', () => {
            mockAuthContext.user = { username: 'admin', role: 'admin' };
            renderComponent();

            const badge = screen.getByText('管理員');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('role-badge admin');
        });
    });
});
