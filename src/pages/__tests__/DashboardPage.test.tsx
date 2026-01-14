import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DashboardPage } from '../DashboardPage';
import { BrowserRouter } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { AxiosError } from 'axios';

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
    user: { username: 'testuser', role: 'user' },
    logout: mockLogout,
};

vi.mock('../../context/AuthContext', () => ({
    useAuth: () => mockAuthContext,
}));

// Mock productApi
vi.mock('../../api/productApi', () => ({
    productApi: {
        getProducts: vi.fn(),
    },
}));

describe('DashboardPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset default mock values
        mockAuthContext.user = { username: 'testuser', role: 'user' };
        mockAuthContext.logout = mockLogout;
        (productApi.getProducts as any).mockResolvedValue([]);
    });

    const renderComponent = () => {
        render(
            <BrowserRouter>
                <DashboardPage />
            </BrowserRouter>
        );
    };

    describe('前端元素', () => {
        it('檢查頁面基本元素渲染', async () => {
            renderComponent();

            await waitFor(() => expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument());

            expect(screen.getByRole('heading', { name: '儀表板' })).toBeInTheDocument();
            expect(screen.getByText('Welcome, testuser 👋')).toBeInTheDocument();
            expect(screen.getByText('一般用戶')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '登出' })).toBeInTheDocument();
            expect(screen.getByRole('heading', { name: '商品列表' })).toBeInTheDocument();
        });
    });

    describe('RBAC', () => {
        it('管理員顯示後台連結', async () => {
            mockAuthContext.user = { username: 'admin', role: 'admin' };
            renderComponent();

            await waitFor(() => expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument());

            const adminLink = screen.getByText('🛠️ 管理後台');
            expect(adminLink).toBeInTheDocument();
            expect(adminLink).toHaveAttribute('href', '/admin');
        });

        it('一般用戶不顯示後台連結', async () => {
            mockAuthContext.user = { username: 'user', role: 'user' };
            renderComponent();

            await waitFor(() => expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument());

            expect(screen.queryByText('🛠️ 管理後台')).not.toBeInTheDocument();
        });
    });

    describe('Function 邏輯', () => {
        it('登出功能', async () => {
            renderComponent();
            await waitFor(() => expect(screen.queryByText('載入商品中...')).not.toBeInTheDocument());

            const logoutButton = screen.getByRole('button', { name: '登出' });
            fireEvent.click(logoutButton);

            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true, state: null });
        });
    });

    describe('Mock API', () => {
        it('商品列表載入中狀態', () => {
            // Keep the promise pending
            (productApi.getProducts as any).mockImplementation(() => new Promise(() => { }));
            renderComponent();

            expect(screen.getByText('載入商品中...')).toBeInTheDocument();
            // Checking for spinner existence by class if possible, or just text is fine as per requirements
        });

        it('商品列表載入成功', async () => {
            const mockProducts = [
                { id: 1, name: 'Prod A', price: 100, description: 'Desc A' },
                { id: 2, name: 'Prod B', price: 200, description: 'Desc B' },
            ];
            (productApi.getProducts as any).mockResolvedValue(mockProducts);

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText('Prod A')).toBeInTheDocument();
                expect(screen.getByText('Prod B')).toBeInTheDocument();
            });

            expect(screen.getByText('NT$ 100')).toBeInTheDocument();
            expect(screen.getByText('NT$ 200')).toBeInTheDocument();
        });

        it('商品列表載入失敗', async () => {
            const errorMessage = 'Error fetching data';
            const error = new AxiosError(errorMessage);
            error.response = {
                data: { message: errorMessage },
                status: 500,
                statusText: 'Internal Server Error',
                headers: {},
                config: {} as any
            };

            (productApi.getProducts as any).mockRejectedValue(error);

            renderComponent();

            await waitFor(() => {
                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });
        });
    });
});
