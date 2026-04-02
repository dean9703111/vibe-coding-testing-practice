import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DashboardPage } from './DashboardPage';
import { useAuth } from '../context/AuthContext';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';

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

// 3. Mock product API
vi.mock('../api/productApi', () => ({
    productApi: {
        getProducts: vi.fn()
    }
}));

describe('DashboardPage', () => {
    const mockNavigate = vi.fn();
    const mockLogout = vi.fn();

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<MemoryRouter>{ui}</MemoryRouter>);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        
        // 預設成功載入為空資料，不要在不需要 api 的測試裡一直拋錯或 loading
        vi.mocked(productApi.getProducts).mockResolvedValue([]);
    });

    describe('前端元素', () => {
        it('顯示完整的 Dashboard UI', async () => {
            vi.mocked(useAuth).mockReturnValue({
                login: vi.fn(),
                logout: mockLogout,
                user: { username: 'test', role: 'user', email: 'u@b.com' },
                isAuthenticated: true,
                isLoading: false,
                authExpiredMessage: null,
                clearAuthExpiredMessage: vi.fn(),
                token: 'mock-token',
                checkAuth: vi.fn()
            });

            renderWithRouter(<DashboardPage />);

            expect(screen.getByRole('heading', { name: '儀表板' })).toBeInTheDocument();
            expect(screen.getByText('T')).toBeInTheDocument(); // 字首大寫 (Test => T)
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();

            // async 等待 Loading 結束，顯示商品列表區塊
            await waitFor(() => {
                expect(screen.getByRole('heading', { name: '商品列表' })).toBeInTheDocument();
                // 不會顯示 error 跟 loading
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });
        });
    });

    describe('狀態邏輯', () => {
        it('使用者為 admin 時顯示管理員項目', async () => {
            vi.mocked(useAuth).mockReturnValue({
                login: vi.fn(),
                logout: mockLogout,
                user: { username: 'admin_user', role: 'admin', email: 'a@b.com' },
                isAuthenticated: true,
                isLoading: false,
                authExpiredMessage: null,
                clearAuthExpiredMessage: vi.fn(),
                token: 'mock-token',
                checkAuth: vi.fn()
            });

            renderWithRouter(<DashboardPage />);
            
            expect(screen.getByRole('link', { name: '🛠️ 管理後台' })).toBeInTheDocument();
            expect(screen.getByText('管理員')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });
        });

        it('使用者為 general user 時不顯示管理員項目', async () => {
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

            renderWithRouter(<DashboardPage />);
            
            expect(screen.queryByRole('link', { name: '🛠️ 管理後台' })).not.toBeInTheDocument();
            expect(screen.getByText('一般用戶')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });
        });

        it('點擊登出按鈕會呼叫 logout 與轉址', async () => {
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

            renderWithRouter(<DashboardPage />);
            const userContext = userEvent.setup();

            // 等待加載完畢再點擊，以免狀態更新和轉址發生衝突引起 act() 警告
            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });

            const logoutButton = screen.getByRole('button', { name: '登出' });
            await userContext.click(logoutButton);

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });

    describe('Mock API', () => {
        it('請求載入商品時顯示 Loading 狀態', async () => {
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

            // 讓 promise 處於 pending 狀態以檢測 loading UI
            let resolveApi: any;
            vi.mocked(productApi.getProducts).mockImplementation(() => new Promise(res => {
                resolveApi = res;
            }));

            renderWithRouter(<DashboardPage />);
            
            expect(screen.getByText('載入商品中...')).toBeInTheDocument();
            
            // clear promise to avoid leaks
            resolveApi([]);

            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });
        });

        it('Mock API 成功取得商品清單並正確渲染', async () => {
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

            const MOCK_PRODUCTS = [
                { id: 1, name: '測試產品A', description: '描述A', price: 1000 },
                { id: 2, name: '測試產品B', description: '描述B', price: 99999 }
            ];
            vi.mocked(productApi.getProducts).mockResolvedValue(MOCK_PRODUCTS);

            renderWithRouter(<DashboardPage />);

            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });

            expect(screen.getByText('測試產品A')).toBeInTheDocument();
            expect(screen.getByText('描述A')).toBeInTheDocument();
            expect(screen.getByText('NT$ 1,000')).toBeInTheDocument(); // 加入千分位

            expect(screen.getByText('測試產品B')).toBeInTheDocument();
            expect(screen.getByText('NT$ 99,999')).toBeInTheDocument();
        });

        it('Mock API 回傳一般錯誤並顯示錯誤訊息', async () => {
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

            vi.mocked(productApi.getProducts).mockRejectedValue({
                isAxiosError: true,
                response: {
                    status: 500,
                    data: { message: '無法載入商品資料' }
                }
            });

            renderWithRouter(<DashboardPage />);

            await waitFor(() => {
                expect(screen.getByText('無法載入商品資料')).toBeInTheDocument();
            });

            expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
        });

        it('遭遇 401 Error 時不設定元件層級錯誤', async () => {
            vi.mocked(useAuth).mockReturnValue({
                login: vi.fn(),
                logout: mockLogout,
                user: { id: 2, username: 'test_user', role: 'user', email: 'u@b.com' },
                isAuthenticated: true,
                isLoading: false,
                authExpiredMessage: null,
                clearAuthExpiredMessage: vi.fn(),
                token: 'mock-token',
                checkAuth: vi.fn()
            });

            vi.mocked(productApi.getProducts).mockRejectedValue({
                isAxiosError: true,
                response: {
                    status: 401,
                    data: { message: 'Unauthorized' }
                }
            });

            renderWithRouter(<DashboardPage />);

            await waitFor(() => {
                expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument();
            });

            // 因為是 401，錯誤不會寫進 state (元件 return)，也不會顯示任何錯誤訊息
            expect(screen.queryByText('Unauthorized')).not.toBeInTheDocument();
            expect(screen.queryByText('⚠️')).not.toBeInTheDocument();
        });
    });
});
