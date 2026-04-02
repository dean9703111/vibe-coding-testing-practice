import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminPage } from './AdminPage';
import { useAuth } from '../context/AuthContext';
import { MemoryRouter, useNavigate } from 'react-router-dom';

// 1. Mock useAuth context
vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn()
}));

// 2. Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom') as any;
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('AdminPage', () => {
    const mockNavigate = vi.fn();
    const mockLogout = vi.fn();

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<MemoryRouter>{ui}</MemoryRouter>);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    });

    describe('前端元素', () => {
        it('顯示完整的 AdminPage UI', () => {
            vi.mocked(useAuth).mockReturnValue({
                login: vi.fn(),
                logout: mockLogout,
                user: { username: 'admin', role: 'admin', email: 'a@b.com' },
                isAuthenticated: true,
                isLoading: false,
                authExpiredMessage: null,
                clearAuthExpiredMessage: vi.fn(),
                token: 'mock-token',
                checkAuth: vi.fn()
            });

            renderWithRouter(<AdminPage />);

            expect(screen.getByText('← 返回')).toBeInTheDocument();
            expect(screen.getByText('🛠️ 管理後台')).toBeInTheDocument();
            expect(screen.getByText('管理員')).toBeInTheDocument(); // 角色徽章
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
            expect(screen.getByText('管理員專屬頁面')).toBeInTheDocument();
        });
    });

    describe('狀態邏輯', () => {
        it('點擊返回連結導向回 Dashboard', async () => {
            vi.mocked(useAuth).mockReturnValue({
                login: vi.fn(),
                logout: mockLogout,
                user: { username: 'admin', role: 'admin', email: 'a@b.com' },
                isAuthenticated: true,
                isLoading: false,
                authExpiredMessage: null,
                clearAuthExpiredMessage: vi.fn(),
                token: 'mock-token',
                checkAuth: vi.fn()
            });

            renderWithRouter(<AdminPage />);

            const linkElement = screen.getByText('← 返回');
            expect(linkElement.getAttribute('href')).toBe('/dashboard');
        });

        it('點擊登出按鈕會呼叫 logout 與轉址', async () => {
            vi.mocked(useAuth).mockReturnValue({
                login: vi.fn(),
                logout: mockLogout,
                user: { username: 'admin', role: 'admin', email: 'a@b.com' },
                isAuthenticated: true,
                isLoading: false,
                authExpiredMessage: null,
                clearAuthExpiredMessage: vi.fn(),
                token: 'mock-token',
                checkAuth: vi.fn()
            });

            renderWithRouter(<AdminPage />);
            const userEventSetup = userEvent.setup();

            const logoutButton = screen.getByRole('button', { name: '登出' });
            await userEventSetup.click(logoutButton);

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });

        it('使用者為 admin 時徽章顯示管理員', () => {
            vi.mocked(useAuth).mockReturnValue({
                login: vi.fn(),
                logout: mockLogout,
                user: { username: 'admin', role: 'admin', email: 'a@b.com' },
                isAuthenticated: true,
                isLoading: false,
                authExpiredMessage: null,
                clearAuthExpiredMessage: vi.fn(),
                token: 'mock-token',
                checkAuth: vi.fn()
            });

            renderWithRouter(<AdminPage />);

            const badge = screen.getByText('管理員');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('role-badge', 'admin');
        });

        it('若使用者為一般用戶時徽章顯示一般用戶', () => {
            vi.mocked(useAuth).mockReturnValue({
                login: vi.fn(),
                logout: mockLogout,
                user: { username: 'test_user', role: 'user', email: 'u@b.com' },
                isAuthenticated: true,
                isLoading: false,
                authExpiredMessage: null,
                clearAuthExpiredMessage: vi.fn(),
                token: 'mock-token',
                checkAuth: vi.fn()
            });

            renderWithRouter(<AdminPage />);

            const badge = screen.getByText('一般用戶');
            expect(badge).toBeInTheDocument();
            expect(badge).toHaveClass('role-badge', 'user');
        });
    });
});
